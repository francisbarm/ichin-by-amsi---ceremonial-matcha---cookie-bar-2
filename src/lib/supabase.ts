import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yufnxyhtonsypcwguzhz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Zm54eWh0b25zeXBjd2d1emh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTMwNzMsImV4cCI6MjEwMzg4OTA3M30.EeHfkrFWvxuWFAWmVDtNCVoIx7k5VR9a9sDXT5z0ND0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CotizacionPayload {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  tipo_evento?: string;
  fecha_evento?: string;
  lugar_evento?: string;
  numero_invitados: number;
  paquete_nombre: string;
  tipo_montaje?: string;
  adicionales?: string[];
  notas_adicionales?: string;
  resumen_items?: any;
}

/**
 * Guarda una cotización de barra de eventos en Supabase (tabla ichin_cotizaciones y leads de AMSI CRM)
 */
export async function guardarCotizacionSupabase(data: CotizacionPayload) {
  try {
    // 1. Guardar en tabla detallada ichin_cotizaciones
    const { data: cotizacion, error: errCotizacion } = await supabase
      .from('ichin_cotizaciones')
      .insert([
        {
          cliente_nombre: data.cliente_nombre,
          cliente_telefono: data.cliente_telefono,
          cliente_email: data.cliente_email || null,
          tipo_evento: data.tipo_evento || 'Evento General',
          fecha_evento: data.fecha_evento || 'Por definir',
          lugar_evento: data.lugar_evento || 'Caracas',
          numero_invitados: data.numero_invitados,
          paquete_nombre: data.paquete_nombre,
          tipo_montaje: data.tipo_montaje || 'Barra Estándar',
          adicionales: data.adicionales || [],
          notas_adicionales: data.notas_adicionales || '',
          resumen_items: data.resumen_items || {},
          estado: 'nuevo',
        },
      ])
      .select();

    if (errCotizacion) {
      console.warn('Advertencia al guardar en ichin_cotizaciones:', errCotizacion);
    }

    // 2. Guardar también como Lead en la tabla leads del CRM
    const notasLead = `[ICHIN Evento] Paquete: ${data.paquete_nombre} | Invitados: ${data.numero_invitados} | Fecha: ${data.fecha_evento || 'N/A'} | Montaje: ${data.tipo_montaje || 'N/A'}`;
    const { error: errLead } = await supabase.from('leads').insert([
      {
        nombre: data.cliente_nombre || 'Cliente Web ICHIN',
        telefono: data.cliente_telefono || 'No indicado',
        email: data.cliente_email || null,
        origen: 'web_cotizador_ichin',
        tipo: 'catering_matcha',
        estado: 'nuevo',
        notas: notasLead,
      },
    ]);

    if (errLead) {
      console.warn('Advertencia al guardar lead en CRM:', errLead);
    }

    return { success: true, cotizacion };
  } catch (err) {
    console.error('Error general al conectar con Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Guarda un pedido de la tienda/carrito en el CRM de Supabase
 */
export async function guardarPedidoCarritoSupabase(params: {
  nombre: string;
  telefono: string;
  itemsResumen: string;
  totalItems: number;
}) {
  try {
    const { error } = await supabase.from('leads').insert([
      {
        nombre: params.nombre || 'Cliente Carrito ICHIN',
        telefono: params.telefono || 'WhatsApp Directo',
        origen: 'web_carrito_ichin',
        tipo: 'pedido_menu',
        estado: 'nuevo',
        notas: `[Pedido ICHIN (${params.totalItems} items)]: ${params.itemsResumen}`,
      },
    ]);

    if (error) {
      console.warn('Error al guardar pedido en leads:', error);
    }
  } catch (err) {
    console.error('Error al guardar pedido en Supabase:', err);
  }
}

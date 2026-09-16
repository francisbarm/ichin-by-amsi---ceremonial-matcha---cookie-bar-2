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
 * Guarda un pedido de la tienda/carrito en el CRM y tabla de cotizaciones de Supabase
 */
export async function guardarPedidoCarritoSupabase(params: {
  nombre: string;
  telefono: string;
  email?: string;
  itemsResumen: string;
  totalItems: number;
  tipoEvento?: string;
  zona?: string;
  fecha?: string;
}) {
  try {
    // 1. Guardar en leads de Supabase
    const { error: errLead } = await supabase.from('leads').insert([
      {
        nombre: params.nombre || 'Cliente Carrito ICHIN',
        telefono: params.telefono || 'WhatsApp Directo',
        email: params.email || null,
        origen: 'web_carrito_ichin',
        tipo: 'pedido_menu',
        estado: 'nuevo',
        notas: `[Pedido Menú ICHIN (${params.totalItems} items)]: ${params.itemsResumen} | Evento: ${params.tipoEvento || 'N/A'} | Zona: ${params.zona || 'N/A'} | Fecha: ${params.fecha || 'N/A'}`,
      },
    ]);

    if (errLead) {
      console.warn('Advertencia al guardar pedido en leads:', errLead);
    }

    // 2. Guardar también en tabla ichin_cotizaciones para visualización unificada en Mis Reservas
    const { error: errCotiz } = await supabase.from('ichin_cotizaciones').insert([
      {
        cliente_nombre: params.nombre || 'Cliente Carrito ICHIN',
        cliente_telefono: params.telefono || 'WhatsApp Directo',
        cliente_email: params.email || null,
        tipo_evento: params.tipoEvento || 'Pedido Barra Carrito',
        fecha_evento: params.fecha || 'Por definir',
        lugar_evento: params.zona || 'Caracas',
        numero_invitados: params.totalItems || 1,
        paquete_nombre: `Selección de Menú (${params.totalItems} bebidas/dulces)`,
        tipo_montaje: 'Barra Carrito Móvil',
        adicionales: [],
        notas_adicionales: `Pedido Menú: ${params.itemsResumen}`,
        resumen_items: { 
          tipo: 'pedido_carrito', 
          items: params.itemsResumen, 
          totalItems: params.totalItems 
        },
        estado: 'nuevo',
      },
    ]);

    if (errCotiz) {
      console.warn('Advertencia al guardar pedido en ichin_cotizaciones:', errCotiz);
    }

    return { success: true };
  } catch (err) {
    console.error('Error al guardar pedido en Supabase:', err);
    return { success: false, error: err };
  }
}

// ==========================================
// MÓDULO FINANCIERO: GASTOS Y VENTAS (ADMIN)
// ==========================================

import { FinancialTransaction } from '../types';

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-001',
    type: 'ingreso',
    category: 'evento_boda',
    categoryLabel: 'Boda de Lujo (Altamira)',
    amount: 850.00,
    description: 'Reserva Boda Jardín Country Club (120 tazas + toldos + dijes)',
    date: '2026-09-12',
    paymentMethod: 'zelle',
    relatedBookingCode: 'ICH-VAL78',
    notes: 'Abono 100% recibido vía Zelle',
    createdAt: '2026-09-12T14:30:00.000Z',
  },
  {
    id: 'tx-002',
    type: 'gasto',
    category: 'insumos_matcha',
    categoryLabel: 'Matcha Ceremonial Uji',
    amount: 140.00,
    description: 'Importación 500g Matcha Ceremonial Harvest Uji Kyoto',
    date: '2026-09-10',
    paymentMethod: 'transferencia',
    notes: 'Lote fresco para eventos de septiembre y octubre',
    createdAt: '2026-09-10T10:15:00.000Z',
  },
  {
    id: 'tx-003',
    type: 'ingreso',
    category: 'evento_corporativo',
    categoryLabel: 'Activación Corporativa',
    amount: 620.00,
    description: 'Activación de Marca en Las Mercedes (80 personas)',
    date: '2026-09-08',
    paymentMethod: 'transferencia',
    relatedBookingCode: 'ICH-CORP09',
    createdAt: '2026-09-08T16:00:00.000Z',
  },
  {
    id: 'tx-004',
    type: 'gasto',
    category: 'vasos_empaques',
    categoryLabel: 'Vasos y Empaques PET',
    amount: 65.00,
    description: '500 Vasos PET cristalinos 16oz + Tapas planas y sorbetes ecológicos',
    date: '2026-09-07',
    paymentMethod: 'pago_movil',
    createdAt: '2026-09-07T11:20:00.000Z',
  },
  {
    id: 'tx-005',
    type: 'gasto',
    category: 'leche_ingredientes',
    categoryLabel: 'Leches Vegetales e Insumos',
    amount: 48.00,
    description: 'Caja Leche de Avena Barista Edition + Leche de Almendras + Vainilla Natural',
    date: '2026-09-06',
    paymentMethod: 'pago_movil',
    createdAt: '2026-09-06T09:40:00.000Z',
  },
  {
    id: 'tx-006',
    type: 'gasto',
    category: 'personal_baristas',
    categoryLabel: 'Honorarios Baristas',
    amount: 80.00,
    description: 'Pago por servicio 2 Baristas expertos en batido chasen en vivo',
    date: '2026-09-05',
    paymentMethod: 'efectivo_usd',
    relatedBookingCode: 'ICH-VAL78',
    createdAt: '2026-09-05T20:00:00.000Z',
  },
  {
    id: 'tx-007',
    type: 'gasto',
    category: 'logistica_traslado',
    categoryLabel: 'Logística y Flete Carrito',
    amount: 35.00,
    description: 'Traslado ida y vuelta de carrito móvil, toldos y mobiliario a locación',
    date: '2026-09-05',
    paymentMethod: 'efectivo_usd',
    createdAt: '2026-09-05T08:00:00.000Z',
  },
  {
    id: 'tx-008',
    type: 'ingreso',
    category: 'venta_mostrador',
    categoryLabel: 'Ventas Carrito Pop-up',
    amount: 195.00,
    description: 'Ventas al paso en evento privado (Bebidas especiales + Cookies artesanales)',
    date: '2026-09-03',
    paymentMethod: 'pago_movil',
    createdAt: '2026-09-03T18:30:00.000Z',
  },
];

/**
 * Obtiene todas las transacciones financieras (Supabase con respaldo en localStorage)
 */
export async function obtenerTransaccionesFinancieras(): Promise<FinancialRecordResult> {
  const LOCAL_STORAGE_KEY = 'ichin_finanzas_records';
  
  // 1. Intentar leer de Supabase
  try {
    const { data, error } = await supabase
      .from('ichin_finanzas')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: FinancialTransaction[] = data.map((d: any) => ({
        id: d.id,
        type: d.type,
        category: d.category,
        categoryLabel: d.category_label || d.category,
        amount: Number(d.amount),
        description: d.description,
        date: d.date,
        paymentMethod: d.payment_method,
        relatedBookingCode: d.related_booking_code,
        notes: d.notes,
        createdAt: d.created_at || d.date,
      }));
      // Sincronizar respaldo local
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
      return { data: mapped, source: 'supabase' };
    }
  } catch (err) {
    console.info('Consulta Supabase finanzas no disponible, usando almacenamiento local:', err);
  }

  // 2. Fallback local si la tabla aún no existe o no tiene registros
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, source: 'local' };
      }
    } catch (e) {
      console.warn('Error al leer finanzas de localStorage:', e);
    }
  }

  // 3. Inicializar con datos maestros por defecto
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  return { data: INITIAL_TRANSACTIONS, source: 'default' };
}

export interface FinancialRecordResult {
  data: FinancialTransaction[];
  source: 'supabase' | 'local' | 'default';
}

/**
 * Guarda una nueva transacción (Ingreso o Gasto)
 */
export async function guardarTransaccionFinanciera(tx: FinancialTransaction): Promise<boolean> {
  const LOCAL_STORAGE_KEY = 'ichin_finanzas_records';

  // Guardar en localStorage de inmediato
  try {
    const current = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: FinancialTransaction[] = current ? JSON.parse(current) : INITIAL_TRANSACTIONS;
    const updated = [tx, ...list.filter(item => item.id !== tx.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error al actualizar finanzas localmente:', e);
  }

  // Intentar guardar en Supabase tabla ichin_finanzas
  try {
    await supabase.from('ichin_finanzas').insert([
      {
        id: tx.id,
        type: tx.type,
        category: tx.category,
        category_label: tx.categoryLabel,
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
        payment_method: tx.paymentMethod || null,
        related_booking_code: tx.relatedBookingCode || null,
        notes: tx.notes || null,
      }
    ]);
  } catch (err) {
    console.info('Nota: Se guardó en local mientras se sincroniza tabla Supabase:', err);
  }

  return true;
}

/**
 * Elimina una transacción financiera
 */
export async function eliminarTransaccionFinanciera(id: string): Promise<boolean> {
  const LOCAL_STORAGE_KEY = 'ichin_finanzas_records';

  // Eliminar en localStorage
  try {
    const current = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (current) {
      const list: FinancialTransaction[] = JSON.parse(current);
      const updated = list.filter(item => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error al borrar de local:', e);
  }

  // Intentar eliminar en Supabase
  try {
    await supabase.from('ichin_finanzas').delete().eq('id', id);
  } catch (err) {
    console.info('Nota: Eliminado localmente:', err);
  }

  return true;
}


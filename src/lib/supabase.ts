import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = (rawUrl && !rawUrl.includes('your-project') && rawUrl.startsWith('https://'))
  ? rawUrl
  : 'https://yufnxyhtonsypcwguzhz.supabase.co';

export const supabaseAnonKey = (rawKey && !rawKey.includes('your-anon') && rawKey.startsWith('eyJ'))
  ? rawKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Zm54eWh0b25zeXBjd2d1emh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTMwNzMsImV4cCI6MjEwMzg4OTA3M30.EeHfkrFWvxuWFAWmVDtNCVoIx7k5VR9a9sDXT5z0ND0';

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

import { FinancialTransaction, InventoryItem, InventoryMovement } from '../types';

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];

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

    if (!error && data) {
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
      if (Array.isArray(parsed)) {
        // Limpiar mock items previos que empezaban con 'tx-00' para iniciar limpio
        const containsMock = parsed.some((item: any) => item.id && String(item.id).startsWith('tx-00'));
        if (containsMock) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
          return { data: [], source: 'local' };
        }
        return { data: parsed, source: 'local' };
      }
    } catch (e) {
      console.warn('Error al leer finanzas de localStorage:', e);
    }
  }

  // 3. Inicializar vacío
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return { data: [], source: 'default' };
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

// ==========================================
// MÓDULO DE CONTROL DE INVENTARIO (ADMIN)
// ==========================================

export const INITIAL_INVENTORY: InventoryItem[] = [];

const LOCAL_INVENTORY_KEY = 'ichin_inventory_items';
const LOCAL_MOVEMENTS_KEY = 'ichin_inventory_movements';

/**
 * Obtiene el inventario completo (Supabase con respaldo en localStorage)
 */
export async function obtenerInventario(): Promise<{ data: InventoryItem[]; fromLocal: boolean }> {
  // 1. Intentar leer de Supabase
  try {
    const { data, error } = await supabase
      .from('ichin_inventario')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      const mapped: InventoryItem[] = data.map((d: any) => ({
        id: d.id,
        sku: d.sku || `SKU-${d.id.slice(0, 6)}`,
        name: d.name,
        category: d.category,
        categoryLabel: d.category_label || d.category,
        currentStock: Number(d.current_stock) || 0,
        minStock: Number(d.min_stock) || 0,
        unit: d.unit || 'unidades',
        costPerUnit: Number(d.cost_per_unit) || 0,
        supplier: d.supplier || '',
        location: d.location || 'Carrito Móvil',
        lastRestockedDate: d.last_restocked_date || '',
        notes: d.notes || '',
        updatedAt: d.updated_at || new Date().toISOString(),
      }));
      // Sincronizar en local
      try {
        localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(mapped));
      } catch (e) {}
      return { data: mapped, fromLocal: false };
    }
  } catch (err) {
    console.info('Conectando con almacenamiento de inventario local:', err);
  }

  // 2. Fallback a localStorage
  try {
    const local = localStorage.getItem(LOCAL_INVENTORY_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        // Limpiar mock items previos que empezaban con 'inv-00' para iniciar limpio
        const containsMock = parsed.some((item: any) => item.id && String(item.id).startsWith('inv-00'));
        if (containsMock) {
          localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify([]));
          return { data: [], fromLocal: true };
        }
        return { data: parsed, fromLocal: true };
      }
    }
  } catch (err) {
    console.warn('Error leyendo inventario de localStorage:', err);
  }

  // 3. Fallback inicial vacío
  try {
    localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify([]));
  } catch (e) {}

  return { data: [], fromLocal: true };
}

/**
 * Función para vaciar y reiniciar completamente los datos administrativos y de inventario
 */
export function vaciarDatosAdministrativos(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ichin_finanzas_records', JSON.stringify([]));
    localStorage.setItem('ichin_inventory_items', JSON.stringify([]));
    localStorage.setItem('ichin_inventory_movements', JSON.stringify([]));
  }
}

/**
 * Guarda o actualiza un insumo en el inventario
 */
export async function guardarItemInventario(item: InventoryItem): Promise<boolean> {
  // Guardar en localStorage
  try {
    const current = localStorage.getItem(LOCAL_INVENTORY_KEY);
    let list: InventoryItem[] = current ? JSON.parse(current) : INITIAL_INVENTORY;
    const existingIndex = list.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list = [item, ...list];
    }
    localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Error al guardar insumo en local:', e);
  }

  // Intentar guardar en Supabase
  try {
    await supabase.from('ichin_inventario').upsert([
      {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        category_label: item.categoryLabel,
        current_stock: item.currentStock,
        min_stock: item.minStock,
        unit: item.unit,
        cost_per_unit: item.costPerUnit,
        supplier: item.supplier || null,
        location: item.location || null,
        last_restocked_date: item.lastRestockedDate || null,
        notes: item.notes || null,
        updated_at: new Date().toISOString(),
      }
    ]);
  } catch (err) {
    console.info('Nota: Guardado localmente mientras se sincroniza con Supabase:', err);
  }

  return true;
}

/**
 * Actualiza el stock de un producto directamente
 */
export async function actualizarStockItem(
  id: string,
  newStock: number,
  movementReason: 'compra' | 'evento' | 'merma' | 'conteo_fisico' | 'otro' = 'conteo_fisico',
  notes: string = ''
): Promise<{ success: boolean; item?: InventoryItem }> {
  let targetItem: InventoryItem | undefined;

  // Actualizar en localStorage
  try {
    const current = localStorage.getItem(LOCAL_INVENTORY_KEY);
    let list: InventoryItem[] = current ? JSON.parse(current) : INITIAL_INVENTORY;
    const idx = list.findIndex(i => i.id === id);
    if (idx >= 0) {
      const prevStock = list[idx].currentStock;
      list[idx].currentStock = Math.max(0, newStock);
      list[idx].updatedAt = new Date().toISOString();
      if (movementReason === 'compra') {
        list[idx].lastRestockedDate = new Date().toISOString().split('T')[0];
      }
      targetItem = list[idx];
      localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(list));

      // Registrar movimiento
      const mov: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: targetItem.id,
        itemName: targetItem.name,
        type: newStock > prevStock ? 'entrada' : newStock < prevStock ? 'salida' : 'ajuste',
        quantity: Math.abs(newStock - prevStock),
        previousStock: prevStock,
        newStock: Math.max(0, newStock),
        reason: movementReason,
        date: new Date().toISOString().split('T')[0],
        notes: notes || undefined,
      };
      await registrarMovimientoInventario(mov);
    }
  } catch (e) {
    console.warn('Error al actualizar stock en local:', e);
  }

  // Intentar actualizar en Supabase
  if (targetItem) {
    try {
      await supabase.from('ichin_inventario').update({
        current_stock: targetItem.currentStock,
        updated_at: targetItem.updatedAt,
        last_restocked_date: targetItem.lastRestockedDate || null,
      }).eq('id', id);
    } catch (err) {
      console.info('Nota: Stock actualizado localmente:', err);
    }
  }

  return { success: !!targetItem, item: targetItem };
}

/**
 * Elimina un insumo del inventario
 */
export async function eliminarItemInventario(id: string): Promise<boolean> {
  // Eliminar en localStorage
  try {
    const current = localStorage.getItem(LOCAL_INVENTORY_KEY);
    if (current) {
      const list: InventoryItem[] = JSON.parse(current);
      const updated = list.filter(item => item.id !== id);
      localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error al borrar de local:', e);
  }

  // Intentar eliminar en Supabase
  try {
    await supabase.from('ichin_inventario').delete().eq('id', id);
  } catch (err) {
    console.info('Nota: Insumo eliminado localmente:', err);
  }

  return true;
}

/**
 * Registra un movimiento de stock en el historial
 */
export async function registrarMovimientoInventario(mov: InventoryMovement): Promise<boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_MOVEMENTS_KEY);
    const list: InventoryMovement[] = raw ? JSON.parse(raw) : [];
    list.unshift(mov);
    // Limitar historial a 100 movimientos en local
    localStorage.setItem(LOCAL_MOVEMENTS_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.warn('Error registrando movimiento:', e);
  }

  try {
    await supabase.from('ichin_movimientos_inventario').insert([
      {
        id: mov.id,
        item_id: mov.itemId,
        item_name: mov.itemName,
        type: mov.type,
        quantity: mov.quantity,
        previous_stock: mov.previousStock,
        new_stock: mov.newStock,
        reason: mov.reason,
        date: mov.date,
        notes: mov.notes || null,
      }
    ]);
  } catch (e) {}

  return true;
}

/**
 * Obtiene el historial de movimientos de inventario
 */
export async function obtenerMovimientosInventario(): Promise<InventoryMovement[]> {
  try {
    const raw = localStorage.getItem(LOCAL_MOVEMENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return [];
}



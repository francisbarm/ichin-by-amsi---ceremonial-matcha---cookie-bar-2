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

import { FinancialTransaction, InventoryItem, InventoryMovement } from '../types';

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

// ==========================================
// MÓDULO DE CONTROL DE INVENTARIO (ADMIN)
// ==========================================

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    sku: 'MAT-UJI-100',
    name: 'Matcha Ceremonial Uji Grado A (100g)',
    category: 'matcha_te',
    categoryLabel: 'Matcha & Té Ceremonial',
    currentStock: 18,
    minStock: 6,
    unit: 'latas (100g)',
    costPerUnit: 22.00,
    supplier: 'Marukyu Koyamaen Kyoto',
    location: 'Almacén Central',
    lastRestockedDate: '2026-09-10',
    notes: 'Primer cosecha ceremonial de primavera (Uji, Kioto)',
    updatedAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'inv-002',
    sku: 'MAT-KIO-100',
    name: 'Matcha Imperial Kioto Reserva (100g)',
    category: 'matcha_te',
    categoryLabel: 'Matcha & Té Ceremonial',
    currentStock: 8,
    minStock: 3,
    unit: 'latas (100g)',
    costPerUnit: 32.00,
    supplier: 'Uji Tea Master Selection',
    location: 'Almacén Central',
    lastRestockedDate: '2026-09-08',
    notes: 'Reserva exclusiva para bodas VIP y catas privadas',
    updatedAt: '2026-09-08T12:00:00.000Z',
  },
  {
    id: 'inv-003',
    sku: 'LAC-AVE-001',
    name: 'Leche de Avena Barista Edition',
    category: 'lacteos_bebidas',
    categoryLabel: 'Lácteos & Jarabes',
    currentStock: 34,
    minStock: 12,
    unit: 'litros',
    costPerUnit: 3.50,
    supplier: 'Oatly / Minor Figures VE',
    location: 'Cava Refrigerada',
    lastRestockedDate: '2026-09-12',
    notes: 'Textura sedosa para latte art ceremonial',
    updatedAt: '2026-09-12T15:00:00.000Z',
  },
  {
    id: 'inv-004',
    sku: 'LAC-ALM-001',
    name: 'Leche de Almendras Sin Azúcar',
    category: 'lacteos_bebidas',
    categoryLabel: 'Lácteos & Jarabes',
    currentStock: 20,
    minStock: 8,
    unit: 'litros',
    costPerUnit: 3.20,
    supplier: 'Distribuidora Gourmet Caracas',
    location: 'Cava Refrigerada',
    lastRestockedDate: '2026-09-11',
    notes: 'Para opciones veganas y keto friendly',
    updatedAt: '2026-09-11T14:00:00.000Z',
  },
  {
    id: 'inv-005',
    sku: 'LAC-VAI-MAD',
    name: 'Jarabe de Vainilla Bourbon Madagascar',
    category: 'lacteos_bebidas',
    categoryLabel: 'Lácteos & Jarabes',
    currentStock: 5,
    minStock: 2,
    unit: 'botellas',
    costPerUnit: 14.00,
    supplier: 'Monin / Artisan Syrups',
    location: 'Carrito Móvil',
    lastRestockedDate: '2026-09-05',
    notes: 'Endulzante botánico suave para lattes',
    updatedAt: '2026-09-05T09:00:00.000Z',
  },
  {
    id: 'inv-006',
    sku: 'LAC-STR-PUR',
    name: 'Puré de Fresas Frescas Naturales',
    category: 'lacteos_bebidas',
    categoryLabel: 'Lácteos & Jarabes',
    currentStock: 12,
    minStock: 4,
    unit: 'kg',
    costPerUnit: 6.50,
    supplier: 'Fresas de Galipán',
    location: 'Cava Refrigerada',
    lastRestockedDate: '2026-09-14',
    notes: 'Insumo estrella para Strawberry Matcha Latte',
    updatedAt: '2026-09-14T08:00:00.000Z',
  },
  {
    id: 'inv-007',
    sku: 'EMP-VAS-12P',
    name: 'Vasos PET Cristal 12oz Logo ICHIN',
    category: 'empaques_desechables',
    categoryLabel: 'Empaques & Vasos',
    currentStock: 420,
    minStock: 150,
    unit: 'unidades',
    costPerUnit: 0.35,
    supplier: 'Envases Serigrafiados Caracas',
    location: 'Carrito Móvil',
    lastRestockedDate: '2026-09-07',
    notes: '100% Reciclables y ultra cristalinos con serigrafía',
    updatedAt: '2026-09-07T11:00:00.000Z',
  },
  {
    id: 'inv-008',
    sku: 'EMP-TAP-DOM',
    name: 'Tapas Domo PET 12oz',
    category: 'empaques_desechables',
    categoryLabel: 'Empaques & Vasos',
    currentStock: 450,
    minStock: 150,
    unit: 'unidades',
    costPerUnit: 0.12,
    supplier: 'Envases Serigrafiados Caracas',
    location: 'Carrito Móvil',
    lastRestockedDate: '2026-09-07',
    notes: 'Compatibles con vasos de 12oz y 16oz',
    updatedAt: '2026-09-07T11:00:00.000Z',
  },
  {
    id: 'inv-009',
    sku: 'EMP-PIT-ECO',
    name: 'Pitillos Biodegradables Bambú/Papel',
    category: 'empaques_desechables',
    categoryLabel: 'Empaques & Vasos',
    currentStock: 8,
    minStock: 3,
    unit: 'paquetes',
    costPerUnit: 4.00,
    supplier: 'EcoSupply VE',
    location: 'Carrito Móvil',
    lastRestockedDate: '2026-09-05',
    notes: 'Paquetes de 100 unidades color kraft',
    updatedAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'inv-010',
    sku: 'EMP-SRV-KRA',
    name: 'Servilletas Kraft Serigrafiadas ICHIN',
    category: 'empaques_desechables',
    categoryLabel: 'Empaques & Vasos',
    currentStock: 10,
    minStock: 4,
    unit: 'paquetes',
    costPerUnit: 5.00,
    supplier: 'Gráficas Caracas',
    location: 'Carrito Móvil',
    lastRestockedDate: '2026-09-06',
    notes: 'Paquetes de 250 unidades con logo ceremonial',
    updatedAt: '2026-09-06T12:00:00.000Z',
  },
  {
    id: 'inv-011',
    sku: 'REP-CK-DDL',
    name: 'Cookies Rellenas Dulce de Leche',
    category: 'reposteria',
    categoryLabel: 'Repostería & Cookies',
    currentStock: 65,
    minStock: 25,
    unit: 'unidades',
    costPerUnit: 1.80,
    supplier: 'Taller Dulce AMSI',
    location: 'Cava / Barra',
    lastRestockedDate: '2026-09-14',
    notes: 'Horneadas frescas con centro cremoso de arequipe',
    updatedAt: '2026-09-14T09:00:00.000Z',
  },
  {
    id: 'inv-012',
    sku: 'REP-CK-RDV',
    name: 'Cookies Red Velvet & White Chocolate',
    category: 'reposteria',
    categoryLabel: 'Repostería & Cookies',
    currentStock: 50,
    minStock: 20,
    unit: 'unidades',
    costPerUnit: 1.90,
    supplier: 'Taller Dulce AMSI',
    location: 'Cava / Barra',
    lastRestockedDate: '2026-09-14',
    notes: 'Con chips belgas de chocolate blanco',
    updatedAt: '2026-09-14T09:00:00.000Z',
  },
  {
    id: 'inv-013',
    sku: 'REP-BOM-VIP',
    name: 'Bombones Artesanales Matcha & Cacao',
    category: 'reposteria',
    categoryLabel: 'Repostería & Cookies',
    currentStock: 22,
    minStock: 8,
    unit: 'cajas',
    costPerUnit: 4.50,
    supplier: 'Chocolatería de Autor Caracas',
    location: 'Cava / Barra',
    lastRestockedDate: '2026-09-13',
    notes: 'Cajas de 6 bombones de matcha ceremonial y cacao fino',
    updatedAt: '2026-09-13T16:00:00.000Z',
  },
  {
    id: 'inv-014',
    sku: 'MRC-CHM-CAR',
    name: 'Charms Acrílicos de Carrito ICHIN',
    category: 'merch_accesorios',
    categoryLabel: 'Merchandising & Barra',
    currentStock: 85,
    minStock: 30,
    unit: 'unidades',
    costPerUnit: 0.60,
    supplier: 'Acrílicos y Dijes Laser VE',
    location: 'Carrito Móvil',
    lastRestockedDate: '2026-09-08',
    notes: 'Dijes decorativos de pitillo para personalizar las bebidas',
    updatedAt: '2026-09-08T14:00:00.000Z',
  },
  {
    id: 'inv-015',
    sku: 'MRC-CHA-SEN',
    name: 'Batidores Chasen Bambú Tradicional (100 púas)',
    category: 'merch_accesorios',
    categoryLabel: 'Merchandising & Barra',
    currentStock: 6,
    minStock: 2,
    unit: 'unidades',
    costPerUnit: 12.00,
    supplier: 'Importación Directa Japón',
    location: 'Barra Ceremonial',
    lastRestockedDate: '2026-08-28',
    notes: 'Batidores tradicionales para batido en vivo en eventos',
    updatedAt: '2026-08-28T10:00:00.000Z',
  },
];

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

    if (!error && data && data.length > 0) {
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, fromLocal: true };
      }
    }
  } catch (err) {
    console.warn('Error leyendo inventario de localStorage:', err);
  }

  // 3. Fallback inicial
  try {
    localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
  } catch (e) {}

  return { data: INITIAL_INVENTORY, fromLocal: true };
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



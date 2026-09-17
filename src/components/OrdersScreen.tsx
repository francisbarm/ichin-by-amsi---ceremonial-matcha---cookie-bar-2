import React, { useState, useEffect } from 'react';
import { BookingRecord, CartOrderItem } from '../types';
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronRight,
  QrCode,
  FileText,
  Sparkles,
  MessageCircle,
  RefreshCw,
  Database,
  Mail,
  Phone,
  User as UserIcon,
  Filter,
  DollarSign,
  Printer,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BudgetProposalModal, BudgetItem } from './BudgetProposalModal';
import { EVENT_PACKAGES } from '../data/eventPackages';

interface OrdersScreenProps {
  bookings: BookingRecord[];
  activeOrders: CartOrderItem[];
  onNewQuoteClick: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  bookings,
  activeOrders,
  onNewQuoteClick,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [supabaseBookings, setSupabaseBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOnlyMine, setFilterOnlyMine] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [copiedQuickText, setCopiedQuickText] = useState<boolean>(false);

  // Helper to calculate total for a booking
  const calculateTotal = (item: any): number => {
    if (item.resumen_items?.totalUsd && Number(item.resumen_items.totalUsd) > 0) {
      return Number(item.resumen_items.totalUsd);
    }
    const pkg =
      EVENT_PACKAGES.find(
        (p) => p.name.toLowerCase() === (item.paquete_nombre || item.packageTitle || '').toLowerCase()
      ) || EVENT_PACKAGES[1];

    let calculated = pkg ? pkg.basePrice : 820;
    // Inclusiones obligatorias: Personalización (Vasos $65 + Charms $60) + Mobiliario (Toldos $65 + Mesas $60 + Sillas $65)
    calculated += 65; // Vasos con Logo
    calculated += (item.numero_invitados || item.guests || 60) * 1.0; // Charms & Gemas 3D
    calculated += 65; // Toldos Riviera
    calculated += 60; // Mesas Cocteleras & Apoyo
    calculated += 65; // Sillas Medallón & Taburetes
    return Math.round(calculated);
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'in_prep' | 'confirmed') => {
    if (!isAdmin) return;
    const dbStatus = newStatus === 'confirmed' ? 'confirmado' : newStatus === 'in_prep' ? 'en_prep' : 'nuevo';
    try {
      await supabase.from('ichin_cotizaciones').update({ estado: dbStatus }).eq('id', bookingId);
      setSupabaseBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: newStatus,
                statusLabel: newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'in_prep' ? 'En Preparación' : 'En Revisión',
              }
            : b
        )
      );
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                statusLabel: newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'in_prep' ? 'En Preparación' : 'En Revisión',
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error al actualizar estado en Supabase:', err);
    }
  };

  // Save budget total directly to Supabase
  const handleSaveBudgetTotal = async (bookingId: string, totalUsd: number, budgetItems: BudgetItem[]) => {
    try {
      const b = supabaseBookings.find((item) => item.id === bookingId);
      const updatedResumen = {
        ...(b?.resumenItems || {}),
        totalUsd: totalUsd,
        budgetItems: budgetItems,
      };

      await supabase
        .from('ichin_cotizaciones')
        .update({
          resumen_items: updatedResumen,
          estado: 'presupuesto_enviado',
        })
        .eq('id', bookingId);

      setSupabaseBookings((prev) =>
        prev.map((item) =>
          item.id === bookingId
            ? {
                ...item,
                totalUsd: totalUsd,
                statusLabel: 'Presupuesto Enviado',
                resumenItems: updatedResumen,
              }
            : item
        )
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) =>
          prev
            ? {
                ...prev,
                totalUsd: totalUsd,
                statusLabel: 'Presupuesto Enviado',
                resumenItems: updatedResumen,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error al guardar presupuesto en Supabase:', err);
    }
  };

  const fetchSupabaseBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ichin_cotizaciones')
        .select('*')
        .order('creado_en', { ascending: false });

      if (data && data.length > 0) {
        const mapped: BookingRecord[] = data.map((item) => {
          const total = calculateTotal(item);
          return {
            id: item.id,
            code: item.resumen_items?.codigo || `ICH-${item.id.slice(0, 4).toUpperCase()}`,
            clientName: item.cliente_nombre || 'Cliente',
            clientEmail: item.cliente_email || undefined,
            clientPhone: item.cliente_telefono || undefined,
            eventType: item.tipo_evento || 'Evento',
            date: item.fecha_evento || 'Por definir',
            zone: item.lugar_evento || 'Caracas',
            packageTitle: item.paquete_nombre || 'Paquete Ceremonial',
            guests: item.numero_invitados || 50,
            totalUsd: total,
            status: item.estado === 'confirmado' ? 'confirmed' : item.estado === 'en_prep' ? 'in_prep' : 'pending',
            statusLabel:
              item.estado === 'confirmado'
                ? 'Confirmado'
                : item.estado === 'en_prep'
                ? 'En Preparación'
                : item.estado === 'presupuesto_enviado'
                ? 'Presupuesto Enviado'
                : 'En Revisión',
            createdAt: new Date(item.creado_en).toLocaleDateString('es-VE'),
            adicionales: item.adicionales || [],
            resumenItems: item.resumen_items || {},
            notas: item.notas_adicionales || '',
            tipoMontaje: item.tipo_montaje || '',
          };
        });
        setSupabaseBookings(mapped);
      } else {
        setSupabaseBookings([]);
      }
    } catch (err) {
      console.warn('Error al leer de Supabase:', err);
      setSupabaseBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseBookings();
  }, []);

  const allBookings = supabaseBookings.length > 0 ? supabaseBookings : bookings;
  const userBookings = user
    ? allBookings.filter(
        (b) => b.clientEmail && b.clientEmail.toLowerCase() === user.email?.toLowerCase()
      )
    : [];
  const displayBookings = filterOnlyMine && user ? userBookings : allBookings;

  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const currentSelected = selectedBooking || displayBookings[0] || null;

  // Clean phone number for WhatsApp
  const cleanPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    if (!digits.startsWith('58') && (digits.startsWith('412') || digits.startsWith('414') || digits.startsWith('424') || digits.startsWith('416') || digits.startsWith('426'))) {
      digits = '58' + digits;
    }
    return digits;
  };

  // Generate Quick WhatsApp message
  const getWhatsAppMessage = (b: BookingRecord) => {
    const lines = [
      `🍵 *ICHIN By AMSI | Propuesta y Presupuesto Oficial*`,
      `Hola *${b.clientName}*, un placer saludarte.`,
      ``,
      `Te compartimos la propuesta oficial y presupuesto para tu evento *${b.eventType}* con nuestro Carrito Ceremonial de Matcha & Cookies:`,
      ``,
      `📋 *Código de Reserva:* ${b.code}`,
      `📅 *Fecha y Hora:* ${b.date}`,
      `📍 *Locación:* ${b.zone}`,
      `👥 *Capacidad:* ${b.guests} tazas ceremoniales`,
      `🍵 *Paquete:* ${b.packageTitle}`,
      ``,
      `*DESGLOSE DE SERVICIOS INCLUIDOS:*`,
      `• Barra Ceremonial Matcha & Carrito Móvil (Insumos Uji Kioto + 2 Baristas)`,
      `• Personalización de Vasos: Vasos cristalinos con Logo / Monograma del Evento`,
      `• Personalización de Bebidas: Estación de Charms 3D, Dijes & Gemas de Cristal`,
      `• Pizarras de Bienvenida personalizadas con tus frases favoritas`,
      `• Mobiliario Exterior: Set de Toldos Sombrilla Riviera (Lona blanca con flecos)`,
      `• Mobiliario de Confort: Set de Mesas Altas Cocteleras & Mesas de Apoyo`,
      `• Sillas & Asientos: Set de Sillas Medallón Blancas y Taburetes Cocteleros`,
      `• Logística, Montaje y Ambientación en Caracas`,
      ``,
      `💰 *INVERSIÓN TOTAL ESTIMADA:* *$${(b.totalUsd || 1135).toLocaleString()} USD*`,
      ``,
      `*LA EXPERIENCIA INCLUYE:*`,
      `🎨 *PERSONALIZACIÓN:*`,
      `  • Vasos personalizados con logo / monograma del evento`,
      `  • Barra de dijes, charms coleccionables y gemas 3D para decorar las bebidas`,
      `  • Pizarra de bienvenida y cartelería con frases conmemorativas personalizadas`,
      ``,
      `⛱️ *MOBILIARIO EXCLUSIVO:*`,
      `  • Set de Toldos Sombrilla Riviera (Lona blanca con flecos estilo resort)`,
      `  • Set de Mesas Altas Cocteleras Blancas & Mesas Bajas de Apoyo`,
      `  • Set de Sillas Medallón Blancas & Taburetes Cocteleros Tapizados`,
      ``,
      `🍵 *SERVICIO CEREMONIAL MATCHA:*`,
      `  • Carrito artesanal japonés con marquesina curva y ambientación vegetal`,
      `  • 2 Baristas certificados en batido ceremonial con chasen tradicional`,
      `  • Matcha Uji grado ceremonial importado fresco de Kioto, Japón`,
      `  • Variedad de leches vegetales (avena, almendra, coco) y endulzantes orgánicos`,
      `  • Dispensador de cristal de bienvenida para degustación continua`,
      ``,
      `📌 *Condiciones de Reserva:*`,
      `• 50% de anticipo para congelar y reservar la fecha en agenda formal.`,
      `• 50% restante 48 horas previas al evento.`,
      `• Medios de pago: Zelle, Pago Móvil (tasa BCV), Banesco Panamá o Efectivo USD.`,
      ``,
      `¿Deseas formalizar la reserva para congelar la fecha en nuestra agenda? Quedamos a tu completa disposición.`,
    ];

    return lines.join('\n');
  };

  const getStatusBadge = (status: BookingRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7A8E77]/20 text-[#3C4A3C]">
            <span className="w-2 h-2 rounded-full bg-[#7A8E77]"></span>
            Confirmado
          </span>
        );
      case 'in_prep':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#B69C76]/25 text-[#455546]">
            <span className="w-2 h-2 rounded-full bg-[#B69C76]"></span>
            En Preparación
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F3EFE7] text-[#75786E]">
            <span className="w-2 h-2 rounded-full bg-[#99A996]"></span>
            En Revisión
          </span>
        );
    }
  };

  return (
    <div id="orders-screen-container" className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#F3EFE7] text-[#3C4A3C] text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-[#7A8E77]" />
            <span>Seguimiento de Eventos & Barra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C4A3C] font-editorial">
            Mis Reservas y Pedidos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSupabaseBookings}
            className="py-2.5 px-4 rounded-full bg-white border border-[#E6DFD4] text-[#3C4A3C] text-xs font-bold flex items-center gap-1.5 hover:bg-[#FAF8F4] transition-all shadow-2xs"
            title="Actualizar lista de reservas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7A8E77] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button
            type="button"
            onClick={onNewQuoteClick}
            className="py-2.5 px-5 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#384639] transition-all flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
            <span>Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Bookings List, Right Digital Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Bookings List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-[#75786E] px-1">
            <span>Eventos Registrados en Caracas ({displayBookings.length})</span>
            {supabaseBookings.length > 0 && (
              <span className="text-[10px] text-[#7A8E77] font-bold lowercase flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>sincronizado en tiempo real</span>
              </span>
            )}
          </div>

          {/* User Filter Tabs (if authenticated) */}
          {user && (
            <div className="flex items-center gap-2 bg-[#EAE5D9]/70 p-1 rounded-2xl border border-[#E6DFD4]">
              <button
                type="button"
                onClick={() => setFilterOnlyMine(false)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  !filterOnlyMine
                    ? 'bg-[#455546] text-white shadow-2xs'
                    : 'text-[#4A5A4B] hover:text-[#3C4A3C]'
                }`}
              >
                Todas las Reservas ({allBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterOnlyMine(true)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  filterOnlyMine
                    ? 'bg-[#455546] text-white shadow-2xs'
                    : 'text-[#4A5A4B] hover:text-[#3C4A3C]'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-[#B69C76]" />
                <span>Mis Reservas ({userBookings.length})</span>
              </button>
            </div>
          )}

          {/* Empty state if no bookings exist */}
          {displayBookings.length === 0 && (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#E6DFD4] space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F4] border border-[#E6DFD4] flex items-center justify-center mx-auto text-[#7A8E77]">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#3C4A3C] font-editorial">
                  {filterOnlyMine ? 'No tienes reservas con tu cuenta' : 'Bandeja de Reservas Vacía'}
                </h3>
                <p className="text-xs text-[#6A7869] max-w-md mx-auto leading-relaxed">
                  {filterOnlyMine 
                    ? `No tienes solicitudes registradas bajo ${user?.email || 'tu cuenta'}. Puedes cotizar un evento para verlo aquí.`
                    : 'Todavía no hay reservas registradas. Cuando un cliente o tú coticen un evento desde la web, aparecerá aquí en tiempo real para gestionar su estado y preparación.'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {filterOnlyMine && (
                  <button
                    onClick={() => setFilterOnlyMine(false)}
                    className="py-2 px-4 rounded-full border border-[#E6DFD4] text-xs font-bold text-[#3C4A3C] hover:bg-[#FAF8F4] transition-all"
                  >
                    Ver Todo
                  </button>
                )}
                <button
                  onClick={onNewQuoteClick}
                  className="py-2.5 px-6 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                >
                  Cotizar Primer Evento
                </button>
              </div>
            </div>
          )}

          {displayBookings.map((b) => {
            const isSelected = currentSelected?.id === b.id;
            return (
              <div
                key={b.id}
                id={`booking-card-${b.id}`}
                onClick={() => setSelectedBooking(b)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#455546] ring-2 ring-[#455546]/40 shadow-md'
                    : 'border-[#E6DFD4] hover:border-[#7A8E77]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-extrabold text-[#3C4A3C] bg-[#F3EFE7] px-2 py-0.5 rounded-md">
                        {b.code}
                      </span>
                      <span className="text-xs text-gray-400">{b.createdAt}</span>
                    </div>
                    <h3 className="font-bold text-base text-[#3C4A3C]">{b.clientName}</h3>
                    <p className="text-xs text-gray-500">{b.eventType}</p>
                    {b.clientEmail && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#455546]">
                        <Mail className="w-3 h-3 text-[#7A8E77]" />
                        <span className="truncate">{b.clientEmail}</span>
                      </div>
                    )}
                  </div>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#525B4F] bg-[#FAF8F4] p-3 rounded-2xl mb-3 border border-[#E6DFD4]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7A8E77]" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7A8E77]" />
                    <span className="truncate">{b.zone.split('/')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-[#455546]">
                    <span>${(b.totalUsd || 820).toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#3C4A3C] font-semibold pt-1">
                  <span>{b.packageTitle} ({b.guests} personas)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(b);
                        setIsBudgetModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#455546]/10 text-[#455546] hover:bg-[#455546] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Presupuesto</span>
                    </button>
                    <span className="text-[#B69C76] flex items-center gap-0.5 hover:underline">
                      Ver Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Active direct store orders if any */}
          {activeOrders.length > 0 && (
            <div className="mt-8 bg-white p-5 rounded-3xl border border-[#E6DFD4]">
              <h3 className="font-bold text-sm text-[#3C4A3C] uppercase tracking-wider mb-3">
                Órdenes de Mostrador / Carrito Diario
              </h3>
              <div className="divide-y divide-[#F3EFE7]">
                {activeOrders.map((order, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#3C4A3C]">{order.quantity}x {order.item.name}</span>
                      {order.customization?.milk && (
                        <span className="text-gray-500 block text-[11px]">
                          Leche: {order.customization.milk} | {order.customization.sweetener}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#7A8E77]">Selección Evento</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Booking Digital Ticket (5 Cols) or Empty Placeholder */}
        <div className="lg:col-span-5 sticky top-24">
          {currentSelected ? (
            <div className="bg-white rounded-3xl border border-[#E6DFD4] shadow-lg overflow-hidden">
              
              {/* Ticket Header */}
              <div className="bg-[#3C4A3D] p-6 text-white text-center relative">
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4BE9B] mb-1">
                  Comprobante Oficial de Reserva
                </div>
                <h3 className="text-xl font-bold tracking-tight font-editorial">
                  ICHIN By AMSI
                </h3>
                <p className="text-xs text-[#FAF8F4]/85 mt-0.5">
                  Caracas • Ceremonial Matcha Cart Service
                </p>

                {/* Perforated ticket divider circles */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#FAF8F4]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#FAF8F4]"></div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F3EFE7] pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Código Ticket</span>
                    <div className="font-mono font-black text-sm text-[#3C4A3C]">
                      {currentSelected.code}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Estado</span>
                    {isAdmin ? (
                      <div className="mt-1 flex items-center gap-1.5">
                        <select
                          value={currentSelected.status}
                          onChange={(e) => handleUpdateBookingStatus(currentSelected.id, e.target.value as any)}
                          className="text-xs font-bold bg-[#FAF8F4] border border-[#7A8E77] rounded-xl px-2 py-1 text-[#3C4A3C] focus:outline-none focus:ring-1 focus:ring-[#7A8E77] cursor-pointer shadow-2xs"
                          title="Cambiar estado como Administrador"
                        >
                          <option value="pending">En Revisión</option>
                          <option value="in_prep">En Preparación</option>
                          <option value="confirmed">Confirmado</option>
                        </select>
                      </div>
                    ) : (
                      <div>{getStatusBadge(currentSelected.status)}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Titular del Evento:</span>
                    <span className="font-bold text-[#3C4A3C]">{currentSelected.clientName}</span>
                  </div>

                  {currentSelected.clientEmail && (
                    <div className="flex justify-between items-center bg-[#FAF8F4] px-2.5 py-1.5 rounded-xl border border-[#E6DFD4]">
                      <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-[#7A8E77]" /> Correo:
                      </span>
                      <a
                        href={`mailto:${currentSelected.clientEmail}?subject=${encodeURIComponent(`Cotización ICHIN By AMSI - Reserva ${currentSelected.code}`)}`}
                        className="font-bold text-[#455546] hover:underline text-[11px] truncate max-w-[200px]"
                        title="Responder por correo al cliente"
                      >
                        {currentSelected.clientEmail}
                      </a>
                    </div>
                  )}

                  {currentSelected.clientPhone && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#7A8E77]" /> Teléfono:
                      </span>
                      <span className="font-semibold text-[#3C4A3C]">{currentSelected.clientPhone}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo de Celebración:</span>
                    <span className="font-bold text-[#3C4A3C]">{currentSelected.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha del Servicio:</span>
                    <span className="font-bold text-[#3C4A3C]">{currentSelected.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Locación:</span>
                    <span className="font-bold text-[#3C4A3C]">{currentSelected.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paquete Contratado:</span>
                    <span className="font-bold text-[#3C4A3C]">{currentSelected.packageTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacidad:</span>
                    <span className="font-bold text-[#3C4A3C]">{currentSelected.guests} tazas estimadas</span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* CAJA DE PRESUPUESTO FORMAL ESTIMADO                       */}
                {/* ========================================================= */}
                <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#E6DFD4] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#B69C76] tracking-wider block">
                        Presupuesto Formal Oficial
                      </span>
                      <span className="text-[11px] text-gray-500">Inversión completa estimada</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-[#455546] font-editorial">
                        ${(currentSelected.totalUsd || 820).toLocaleString()}{' '}
                        <span className="text-[10px] font-sans">USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Inclusiones Clave: Personalización & Mobiliario */}
                  <div className="space-y-1.5 text-[11px] text-[#525B4F] border-t border-[#E6DFD4]/60 pt-2.5">
                    <div className="flex items-start gap-1.5">
                      <span className="text-[#B69C76] font-bold">🎨</span>
                      <div>
                        <strong className="text-[#3C4A3C]">Personalización:</strong> Vasos con Logo/Monograma + Charms 3D & Gemas + Pizarras con tu frase
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-[#7A8E77] font-bold">⛱️</span>
                      <div>
                        <strong className="text-[#3C4A3C]">Mobiliario:</strong> Toldos Sombrilla Riviera + Mesas Cocteleras + Sillas Medallón & Taburetes
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <FileText className="w-4 h-4 text-[#D4BE9B]" />
                    <span>Generar Presupuesto Formal (PDF)</span>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* BOTONES DE RESPUESTA INMEDIATA                            */}
                {/* ========================================================= */}
                <div className="space-y-2 pt-1 border-t border-[#F3EFE7]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#75786E] block">
                    ⚡ Responder Inmediatamente
                  </span>

                  {/* WhatsApp Directo */}
                  <button
                    type="button"
                    onClick={() => {
                      const text = getWhatsAppMessage(currentSelected);
                      const phone = cleanPhoneForWhatsApp(currentSelected.clientPhone) || '584143260003';
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      WhatsApp a {currentSelected.clientName.split(' ')[0]}{' '}
                      {currentSelected.clientPhone ? `(+${cleanPhoneForWhatsApp(currentSelected.clientPhone)})` : ''}
                    </span>
                  </button>

                  {/* Correo Directo */}
                  {currentSelected.clientEmail && (
                    <a
                      href={`mailto:${currentSelected.clientEmail}?subject=${encodeURIComponent(
                        `Presupuesto Oficial ICHIN By AMSI - Reserva ${currentSelected.code} (${currentSelected.eventType})`
                      )}&body=${encodeURIComponent(getWhatsAppMessage(currentSelected))}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E6DFD4] hover:bg-[#FAF8F4] text-[#3C4A3C] text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-[#7A8E77]" />
                      <span>Responder por Correo ({currentSelected.clientEmail})</span>
                    </a>
                  )}

                  {/* Copiar texto de propuesta */}
                  <button
                    type="button"
                    onClick={() => {
                      const text = getWhatsAppMessage(currentSelected);
                      navigator.clipboard.writeText(text);
                      setCopiedQuickText(true);
                      setTimeout(() => setCopiedQuickText(false), 2500);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF8F4] hover:bg-[#F3EFE7] text-[#525B4F] text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#E6DFD4] transition-all cursor-pointer"
                  >
                    {copiedQuickText ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuickText ? '¡Texto copiado al portapapeles!' : 'Copiar texto formal de propuesta'}</span>
                  </button>
                </div>

                {/* Database Retention Stamp */}
                <div className="flex items-center gap-2 bg-[#455546]/10 px-3 py-2 rounded-xl border border-[#455546]/20 text-[11px] text-[#3C4A3C]">
                  <Database className="w-3.5 h-3.5 text-[#7A8E77] shrink-0" />
                  <span>Reserva sincronizada en la nube</span>
                </div>

                {/* Milestone Tracker */}
                <div className="pt-2 border-t border-[#F3EFE7]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#75786E] block mb-2">
                    Progreso Logístico
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#3C4A3C]">
                      <CheckCircle2 className="w-4 h-4 text-[#7A8E77]" />
                      <span>1. Solicitud y cotización registrada</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#3C4A3C]">
                      <CheckCircle2 className={`w-4 h-4 ${currentSelected.status !== 'pending' ? 'text-[#7A8E77]' : 'text-gray-300'}`} />
                      <span>2. Bloqueo de agenda y asignación de carrito</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#3C4A3C]">
                      <CheckCircle2 className={`w-4 h-4 ${currentSelected.status === 'confirmed' ? 'text-[#7A8E77]' : 'text-gray-300'}`} />
                      <span>3. Insumos frescos Uji y baristas confirmados</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-[#E6DFD4] p-8 sm:p-10 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4] flex items-center justify-center mx-auto text-[#7A8E77]">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-[#3C4A3C] font-editorial uppercase tracking-wider">
                  Comprobante Digital
                </h4>
                <p className="text-xs text-[#75786E] max-w-xs mx-auto leading-relaxed">
                  Cuando selecciones o se cree una nueva reserva para tu carrito de eventos, aquí se emitirá en tiempo real el ticket oficial con su código de pase digital.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal de Presupuesto Formal Oficial */}
      {currentSelected && (
        <BudgetProposalModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          booking={currentSelected}
          onSaveTotal={handleSaveBudgetTotal}
        />
      )}

    </div>
  );
};

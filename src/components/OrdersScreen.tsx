import React, { useState } from 'react';
import { BookingRecord, CartOrderItem } from '../types';
import { Clock, Calendar, MapPin, CheckCircle2, ChevronRight, QrCode, FileText, Sparkles, MessageCircle } from 'lucide-react';

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
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(bookings[0] || null);

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

        <button
          onClick={onNewQuoteClick}
          className="self-start sm:self-auto py-2.5 px-5 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#384639] transition-all flex items-center gap-2 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
          <span>Nueva Cotización</span>
        </button>
      </div>

      {/* Grid: Left Bookings List, Right Digital Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Bookings List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#75786E] px-1">
            Eventos Programados en Caracas ({bookings.length})
          </div>

          {bookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
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
                  <div className="flex items-center gap-1.5 font-bold text-[#7A8E77]">
                    <span>Cotización a Medida</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#3C4A3C] font-semibold pt-1">
                  <span>{b.packageTitle} ({b.guests} personas)</span>
                  <span className="text-[#B69C76] flex items-center gap-1 hover:underline">
                    Ver Ticket <ChevronRight className="w-3.5 h-3.5" />
                  </span>
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

        {/* Selected Booking Digital Ticket (5 Cols) */}
        {selectedBooking && (
          <div className="lg:col-span-5 sticky top-24">
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

                {/* Perforated ticket divider circles - blends with oat page background */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#FAF8F4]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#FAF8F4]"></div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F3EFE7] pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Código Ticket</span>
                    <div className="font-mono font-black text-sm text-[#3C4A3C]">
                      {selectedBooking.code}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Estado</span>
                    <div>{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Titular del Evento:</span>
                    <span className="font-bold text-[#3C4A3C]">{selectedBooking.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo de Celebración:</span>
                    <span className="font-bold text-[#3C4A3C]">{selectedBooking.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha del Servicio:</span>
                    <span className="font-bold text-[#3C4A3C]">{selectedBooking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Locación:</span>
                    <span className="font-bold text-[#3C4A3C]">{selectedBooking.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paquete Contratado:</span>
                    <span className="font-bold text-[#3C4A3C]">{selectedBooking.packageTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacidad:</span>
                    <span className="font-bold text-[#3C4A3C]">{selectedBooking.guests} tazas estimadas</span>
                  </div>
                </div>

                {/* Milestone Tracker */}
                <div className="pt-3 border-t border-[#F3EFE7]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#75786E] block mb-2">
                    Progreso Logístico
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#3C4A3C]">
                      <CheckCircle2 className="w-4 h-4 text-[#7A8E77]" />
                      <span>1. Solicitud y cotización registrada</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#3C4A3C]">
                      <CheckCircle2 className={`w-4 h-4 ${selectedBooking.status !== 'pending' ? 'text-[#7A8E77]' : 'text-gray-300'}`} />
                      <span>2. Bloqueo de agenda y asignación de carrito</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#3C4A3C]">
                      <CheckCircle2 className={`w-4 h-4 ${selectedBooking.status === 'confirmed' ? 'text-[#7A8E77]' : 'text-gray-300'}`} />
                      <span>3. Insumos frescos Uji y baristas confirmados</span>
                    </div>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#E6DFD4] flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg border border-[#E6DFD4] flex items-center justify-center text-[#3C4A3C]">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#B69C76] block">
                        Pase de Acceso ICHIN
                      </span>
                      <span className="text-xs font-black text-[#3C4A3C]">
                        Propuesta a Medida
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/584143260003?text=${encodeURIComponent(`Hola, quiero consultar el estado de mi reserva ${selectedBooking.code}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};

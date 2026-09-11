import React, { useState } from 'react';
import { CartOrderItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, Calendar, Sparkles, MapPin } from 'lucide-react';
import { CARACAS_ZONES } from '../data/eventPackages';
import { guardarPedidoCarritoSupabase } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartOrderItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [eventType, setEventType] = useState('Boda / Evento Privado');
  const [eventZone, setEventZone] = useState('Altamira / Country Club');
  const [eventDate, setEventDate] = useState('');
  const [tipPercentage, setTipPercentage] = useState<number>(0);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tipAmount = (subtotal * tipPercentage) / 100;
  const total = subtotal + tipAmount;

  const handleSendOrderWhatsApp = () => {
    if (items.length === 0) return;

    let itemsList = '';
    items.forEach((item, i) => {
      itemsList += `\n${i + 1}. *${item.quantity}x ${item.item.name}*`;
      if (item.customization?.milk) {
        itemsList += `\n   • Leche: ${item.customization.milk}`;
      }
      if (item.customization?.sweetener) {
        itemsList += `\n   • Endulzante: ${item.customization.sweetener}`;
      }
      if (item.customization?.iceLevel) {
        itemsList += `\n   • Hielo: ${item.customization.iceLevel}`;
      }
      if (item.customization?.extraShot) {
        itemsList += `\n   • Extra Shot Ceremonial (+3g)`;
      }
      if (item.customization?.coldFoam) {
        itemsList += `\n   • Cold Foam Botánica`;
      }
      if (item.customization?.charmPiece) {
        itemsList += `\n   • Dije / Charm Personalizado: ${item.customization.charmPiece} (+$1.00)`;
      }
      if (item.customization?.notes) {
        itemsList += `\n   • Nota: ${item.customization.notes}`;
      }
    });

    const msg = encodeURIComponent(
      `¡Hola ICHIN By AMSI! Me gustaría cotizar la presencia del Carrito Móvil para mi evento con esta selección de bebidas y repostería:\n` +
      itemsList +
      `\n\n• *Servicio:* Carrito Móvil ICHIN para Eventos Exclusivos` +
      `\n• *Tipo de Evento:* ${eventType}` +
      `\n• *Zona Caracas:* ${eventZone}` +
      (eventDate ? `\n• *Fecha tentativa:* ${eventDate}` : '') +
      `\n• *Contacto:* ${customerName || 'Anfitrión'}\n\n` +
      `¿Tienen disponibilidad en agenda para esta fecha? ¡Muchas gracias!`
    );

    // Guardar en Supabase (leads de AMSI CRM)
    guardarPedidoCarritoSupabase({
      nombre: customerName || 'Anfitrión Web',
      telefono: 'WhatsApp Directo',
      itemsResumen: items.map(it => `${it.quantity}x ${it.item.name}`).join(', '),
      totalItems: items.reduce((acc, it) => acc + it.quantity, 0),
    });

    window.open(`https://wa.me/584143260003?text=${msg}`, '_blank');
  };

  return (
    <div 
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="cart-drawer-panel"
        className="bg-[#FAF8F4] w-full sm:max-w-md h-full flex flex-col shadow-2xl border-l border-[#E6DFD4] animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E6DFD4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#455546]" />
            <div>
              <h3 className="font-bold text-base text-[#3C4A3C] leading-none font-editorial">
                Menú de tu Evento
              </h3>
              <span className="text-[10px] text-[#7A8E77] font-bold uppercase tracking-wider">
                Barra Móvil ICHIN • Caracas
              </span>
            </div>
            <span className="text-xs bg-[#F3EFE7] text-[#455546] px-2 py-0.5 rounded-full font-extrabold ml-1">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            id="close-cart-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3EFE7] text-[#455546] hover:bg-[#EAE4D8] flex items-center justify-center transition-all"
            aria-label="Cerrar bolsa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice: Exclusive for events */}
        <div className="bg-[#455546] text-[#FAF8F4] text-[11px] py-1.5 px-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#D4BE9B]" />
            <span>Servicio exclusivo para eventos y catering</span>
          </span>
          <span className="text-[#D4BE9B] font-bold text-[10px]">Exclusivo para eventos</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-[#F3EFE7] text-[#455546] flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 stroke-1 text-[#7A8E77]" />
              </div>
              <p className="font-bold text-sm text-[#3C4A3C] mb-1 font-editorial">Tu selección está vacía</p>
              <p className="text-xs max-w-xs text-[#6A7869] mb-4">
                Elige las bebidas matcha ceremoniales y los dulces y galletas artesanales que deseas servir en tu evento.
              </p>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#384639] transition-all"
              >
                Explorar Carta de Barra
              </button>
            </div>
          ) : (
            <>
              {items.map((cartItem, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3.5 border border-[#E6DFD4] flex items-start gap-3 shadow-2xs"
                >
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-[#3C4A3C] truncate">
                        {cartItem.item.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-gray-400 hover:text-red-600 p-0.5 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#7A8E77] font-bold">
                      Selección de Barra ICHIN
                    </div>

                    {/* Customizations summary tags */}
                    {cartItem.customization && (
                      <div className="mt-1 flex flex-wrap gap-1 text-[9px] text-[#525B4F]">
                        {cartItem.customization.milk && (
                          <span className="bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E6DFD4]">
                            {cartItem.customization.milk}
                          </span>
                        )}
                        {cartItem.customization.sweetener && (
                          <span className="bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E6DFD4]">
                            {cartItem.customization.sweetener}
                          </span>
                        )}
                        {cartItem.customization.iceLevel && (
                          <span className="bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E6DFD4]">
                            {cartItem.customization.iceLevel}
                          </span>
                        )}
                        {cartItem.customization.extraShot && (
                          <span className="bg-[#7A8E77]/15 text-[#3C4A3C] font-bold px-1.5 py-0.5 rounded">
                            +Shot
                          </span>
                        )}
                        {cartItem.customization.coldFoam && (
                          <span className="bg-[#B69C76]/15 text-[#3C4A3C] font-bold px-1.5 py-0.5 rounded">
                            +Foam
                          </span>
                        )}
                        {cartItem.customization.charmPiece && (
                          <span className="bg-[#B69C76]/20 text-[#3C4A3C] font-bold px-1.5 py-0.5 rounded border border-[#B69C76]/30">
                            ✨ {cartItem.customization.charmPiece} (+$1.00)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Controls */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-[#F3EFE7] px-2 py-0.5 rounded-full">
                        <button
                          onClick={() => onUpdateQuantity(idx, cartItem.quantity - 1)}
                          className="text-[#3C4A3C] hover:opacity-75"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#3C4A3C] min-w-[14px] text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, cartItem.quantity + 1)}
                          className="text-[#3C4A3C] hover:opacity-75"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-xs text-[#7A8E77]">
                        {cartItem.quantity} {cartItem.quantity === 1 ? 'porción' : 'porciones'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Event Details Card (NO DELIVERY - EVENT INFORMATION) */}
              <div className="bg-white p-4 rounded-2xl border border-[#E6DFD4] space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#3C4A3C] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7A8E77]" />
                    <span>Datos del Evento</span>
                  </div>
                  <span className="text-[10px] bg-[#7A8E77]/15 text-[#3C4A3C] px-2 py-0.5 rounded-full font-bold">
                    Caracas
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#7A8E77] mb-1">
                    Tipo de Celebración
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F4] border border-[#E6DFD4] rounded-xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                  >
                    <option value="Boda / Recepción">Boda / Recepción</option>
                    <option value="Corporativo / Brand Activation">Corporativo / Brand Activation</option>
                    <option value="Cumpleaños VIP">Cumpleaños VIP</option>
                    <option value="Brunch / Garden Party">Brunch / Garden Party</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#7A8E77] mb-1">
                    Zona del Evento en Caracas
                  </label>
                  <select
                    value={eventZone}
                    onChange={(e) => setEventZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F4] border border-[#E6DFD4] rounded-xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                  >
                    {CARACAS_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#7A8E77] mb-1">
                      Fecha Estimada
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F4] border border-[#E6DFD4] rounded-xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#7A8E77] mb-1">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Anfitrión / Empresa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F4] border border-[#E6DFD4] rounded-xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-[#6A7869] flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3 h-3 text-[#7A8E77] shrink-0" />
                  <span>El carrito se traslada e instala en tu locación con baristas y chasen en vivo.</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-[#E6DFD4] space-y-3">
            <div className="space-y-1 text-xs text-[#6A7869]">
              <div className="flex justify-between">
                <span>Selección total:</span>
                <span className="font-semibold text-[#3C4A3C]">{items.reduce((acc, i) => acc + i.quantity, 0)} ítems para el evento</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#3C4A3C] pt-1 border-t border-gray-100">
                <span className="font-editorial">Presupuesto para Evento:</span>
                <span className="text-[#B69C76] bg-[#B69C76]/15 px-2.5 py-0.5 rounded-full text-xs font-bold">Cotización a Medida</span>
              </div>
            </div>

            <div className="text-[10px] text-[#6A7869] bg-[#FAF8F4] p-2 rounded-xl border border-[#E6DFD4] text-center">
              🛡️ Servicio en vasos PET cristalinos premium (cero vidrio por seguridad en eventos).
            </div>

            <button
              id="checkout-whatsapp-btn"
              onClick={handleSendOrderWhatsApp}
              className="w-full py-3.5 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-md"
            >
              <span>Solicitar Carrito Móvil por WhatsApp</span>
              <Send className="w-4 h-4 text-[#B69C76]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

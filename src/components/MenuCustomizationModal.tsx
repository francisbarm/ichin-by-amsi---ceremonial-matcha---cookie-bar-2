import React, { useState } from 'react';
import { MenuItem, OrderCustomization } from '../types';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface MenuCustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customization: OrderCustomization) => void;
}

export const MenuCustomizationModal: React.FC<MenuCustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !item) return null;

  const isDrink = item.category === 'matcha' || item.category === 'specials';

  // Default states
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedMilk, setSelectedMilk] = useState<string>(
    item.availableMilks && item.availableMilks.length > 0 ? item.availableMilks[0] : 'Leche de Avena'
  );
  const [selectedSweetener, setSelectedSweetener] = useState<string>(
    item.sweetenerOptions && item.sweetenerOptions.length > 0 ? item.sweetenerOptions[0] : 'Sin Azúcar'
  );
  const [iceLevel, setIceLevel] = useState<'Normal' | 'Poco Hielo' | 'Sin Hielo' | 'Extra Frío'>('Normal');
  const [extraShot, setExtraShot] = useState<boolean>(false);
  const [coldFoam, setColdFoam] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Calculate unit price with add-ons (Milks included without surcharge)
  const milkSurcharge = 0;
  const extraShotSurcharge = extraShot ? 1.0 : 0;
  const coldFoamSurcharge = coldFoam ? 0.75 : 0;
  const unitPrice = item.price + milkSurcharge + extraShotSurcharge + coldFoamSurcharge;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart(item, quantity, {
      milk: isDrink ? selectedMilk : undefined,
      sweetener: isDrink ? selectedSweetener : undefined,
      iceLevel: isDrink ? iceLevel : undefined,
      extraShot: isDrink ? extraShot : undefined,
      coldFoam: isDrink ? coldFoam : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div 
      id="customization-modal-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        id="customization-modal-card"
        className="bg-[#FAF8F4] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 w-full bg-[#F3EFE7]">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3C4A3C]/95 via-[#3C4A3C]/30 to-transparent"></div>
          
          <button
            id="close-customization-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#3C4A3C] hover:bg-white flex items-center justify-center transition-all shadow-sm"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-[#7A8E77] text-white text-[10px] font-extrabold uppercase">
                {item.category === 'cookies' ? 'Bakery Artesanal' : 'Bebida Ceremonial'}
              </span>
              {item.matchaGrade && (
                <span className="text-[10px] text-[#FAF8F4]/90 font-medium">
                  {item.matchaGrade}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight font-editorial">{item.name}</h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <p className="text-xs sm:text-sm text-[#525B4F] leading-relaxed">
            {item.description}
          </p>

          {isDrink && (
            <>
              {/* Leche selector */}
              <div>
                <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-2">
                  Tipo de Leche / Base (Avena, Almendra, Coco o Descremada)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(item.availableMilks || ['Leche de Avena', 'Leche de Almendra', 'Leche de Coco', 'Leche Descremada']).map((milk) => {
                    const isSelected = selectedMilk === milk;
                    return (
                      <button
                        key={milk}
                        type="button"
                        onClick={() => setSelectedMilk(milk)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-[#455546] text-white border-[#455546] shadow-sm'
                            : 'bg-white text-[#3C4A3C] border-[#E6DFD4] hover:border-[#7A8E77]'
                        }`}
                      >
                        <span>{milk}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#B69C76]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endulzante selector */}
              <div>
                <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-2">
                  Nivel de Dulzor / Endulzante
                </label>
                <div className="flex flex-wrap gap-2">
                  {(item.sweetenerOptions || ['Sin Azúcar', 'Miel Pura', 'Agave Orgánico']).map((sweetener) => {
                    const isSelected = selectedSweetener === sweetener;
                    return (
                      <button
                        key={sweetener}
                        type="button"
                        onClick={() => setSelectedSweetener(sweetener)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-[#455546] text-white border-[#455546]'
                            : 'bg-white text-[#3C4A3C] border-[#E6DFD4] hover:border-[#7A8E77]'
                        }`}
                      >
                        {sweetener}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hielo */}
              <div>
                <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-2">
                  Nivel de Hielo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Normal', 'Poco Hielo', 'Sin Hielo', 'Extra Frío'] as const).map((level) => {
                    const isSelected = iceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIceLevel(level)}
                        className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#455546] text-white border-[#455546]'
                            : 'bg-white text-[#3C4A3C] border-[#E6DFD4] hover:border-[#7A8E77]'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add-ons upgrades */}
              <div className="pt-2 border-t border-[#E6DFD4]">
                <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-2">
                  Complementos Especiales
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setExtraShot(!extraShot)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      extraShot
                        ? 'bg-[#455546]/10 border-[#455546] text-[#3C4A3C]'
                        : 'bg-white border-[#E6DFD4] text-[#3C4A3C]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${extraShot ? 'bg-[#455546] border-[#455546] text-white' : 'border-gray-400'}`}>
                        {extraShot && <Check className="w-3 h-3" />}
                      </div>
                      <span>Doble Shot Matcha Ceremonial (+3g)</span>
                    </div>
                    <span className="font-bold text-[#7A8E77]">Incluido en Catering</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColdFoam(!coldFoam)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      coldFoam
                        ? 'bg-[#455546]/10 border-[#455546] text-[#3C4A3C]'
                        : 'bg-white border-[#E6DFD4] text-[#3C4A3C]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${coldFoam ? 'bg-[#455546] border-[#455546] text-white' : 'border-gray-400'}`}>
                        {coldFoam && <Check className="w-3 h-3" />}
                      </div>
                      <span>Cold Foam Cremosa de Vainilla</span>
                    </div>
                    <span className="font-bold text-[#7A8E77]">Opcional Barra</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notas especiales */}
          <div>
            <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1">
              Instrucciones Especiales
            </label>
            <input
              type="text"
              placeholder="Ej. Servir con pitillo de bambú, poco dulce..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E6DFD4] rounded-xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E6DFD4] flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center bg-[#F3EFE7] rounded-full p-1 border border-[#E6DFD4]">
            <button
              id="modal-minus-qty"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-white text-[#3C4A3C] flex items-center justify-center hover:bg-[#FAF8F4] transition-all shadow-xs"
              aria-label="Menos cantidad"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-[#3C4A3C]">{quantity}</span>
            <button
              id="modal-plus-qty"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-[#455546] text-white flex items-center justify-center hover:bg-[#384639] transition-all shadow-xs"
              aria-label="Más cantidad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            id="modal-confirm-add"
            onClick={handleConfirm}
            className="flex-1 py-3 px-6 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-md"
          >
            <span>Agregar a la Selección para Evento</span>
            <span className="text-[#D4BE9B] font-extrabold text-xs">
              {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

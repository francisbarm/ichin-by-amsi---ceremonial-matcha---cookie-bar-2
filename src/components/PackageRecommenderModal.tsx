import React, { useState, useId } from 'react';
import { EVENT_PACKAGES } from '../data/eventPackages';
import { X, Sparkles, Users, Clock, Coffee, Cookie, ArrowRight, CheckCircle2, Calculator } from 'lucide-react';

interface PackageRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation: (packageId: string, guestCount: number, eventType: string) => void;
}

const EVENT_OCCASIONS = [
  { id: 'boda', label: 'Boda / Ceremonia', typeName: 'Boda' },
  { id: 'corp', label: 'Corporativo / Lanzamiento', typeName: 'Corporativo / Brand Activation' },
  { id: 'cumple', label: 'Cumpleaños VIP', typeName: 'Cumpleaños VIP' },
  { id: 'brunch', label: 'Brunch & Social Gathering', typeName: 'Brunch & Social' },
];

export const PackageRecommenderModal: React.FC<PackageRecommenderModalProps> = ({
  isOpen,
  onClose,
  onApplyRecommendation,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState(EVENT_OCCASIONS[0]);
  const [guestCount, setGuestCount] = useState<number>(60);
  const [desiredHours, setDesiredHours] = useState<number>(3);
  const guestSliderId = useId();

  if (!isOpen) return null;

  // Algorithm to determine the best package
  let recommendedPackage = EVENT_PACKAGES[1]; // default ceremonial-luxury
  if (guestCount <= 40) {
    recommendedPackage = EVENT_PACKAGES[0]; // esencial-green
  } else if (guestCount > 40 && guestCount <= 100) {
    recommendedPackage = EVENT_PACKAGES[1]; // ceremonial-luxury
  } else {
    recommendedPackage = EVENT_PACKAGES[2]; // grand-exclusive
  }

  // Recommended drinks estimate (approx 1.25 drinks per guest for good hospitality)
  const estimatedDrinksNeeded = Math.round(guestCount * 1.25);
  const includedDrinks = recommendedPackage.includedDrinks;
  const drinksCoverage = Math.min(100, Math.round((includedDrinks / estimatedDrinksNeeded) * 100));

  const handleApply = () => {
    onApplyRecommendation(recommendedPackage.id, guestCount, selectedOccasion.typeName);
    onClose();
  };

  return (
    <div 
      id="package-recommender-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F4] text-[#3C4A3C] rounded-3xl shadow-2xl border border-[#E6DFD4] overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#455546] text-[#FAF8F4] px-6 py-5 flex items-center justify-between border-b border-[#4D5D4E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-[#D4BE9B]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-widest text-[#D4BE9B] font-bold">
                  Asistente Inteligente ICHIN
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-editorial text-white tracking-tight">
                Calculadora & Recomendador de Evento
              </h2>
            </div>
          </div>

          <button 
            id="close-recommender-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#FAF8F4]/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Step 1: Occasion */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#687C67] mb-2.5">
              1. Tipo de Celebración
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVENT_OCCASIONS.map((occ) => {
                const isSelected = selectedOccasion.id === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSelectedOccasion(occ)}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold text-center transition-all border ${
                      isSelected
                        ? 'bg-[#455546] text-[#FAF8F4] border-[#455546] shadow-xs'
                        : 'bg-white text-[#4A5A4B] border-[#E6DFD4] hover:border-[#7A8E77]'
                    }`}
                  >
                    {occ.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Guests & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F3EFE7] p-4 rounded-2xl border border-[#E6DFD4]">
            {/* Guest slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={guestSliderId} className="text-xs font-bold uppercase tracking-wider text-[#687C67] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Invitados Estimados
                </label>
                <span className="text-base font-bold text-[#3C4A3C] bg-white px-2.5 py-0.5 rounded-full border border-[#E6DFD4]">
                  {guestCount} pers.
                </span>
              </div>
              <input
                id={guestSliderId}
                type="range"
                min="15"
                max="220"
                step="5"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full h-2 bg-[#E6DFD4] rounded-lg appearance-none cursor-pointer accent-[#455546]"
              />
              <div className="flex justify-between text-[10px] text-[#7A8E77] mt-1 font-medium">
                <span>15 íntimo</span>
                <span>80 mediano</span>
                <span>200+ masivo</span>
              </div>
            </div>

            {/* Hours selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#687C67] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Tiempo de Servicio Sugerido
                </label>
                <span className="text-xs font-semibold text-[#3C4A3C]">
                  {desiredHours} Horas
                </span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((hr) => (
                  <button
                    key={hr}
                    type="button"
                    onClick={() => setDesiredHours(hr)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      desiredHours === hr
                        ? 'bg-[#455546] text-white border-[#455546]'
                        : 'bg-white text-[#4A5A4B] border-[#E6DFD4] hover:border-[#7A8E77]'
                    }`}
                  >
                    {hr}h
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#7A8E77] mt-1">
                Incluye 1 hora previa de montaje y preparación del carrito sin costo adicional.
              </p>
            </div>
          </div>

          {/* Step 3: Recommendation Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#7A8E77] shadow-sm relative overflow-hidden">
            {/* Top badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#7A8E77]/15 text-[#455546] border border-[#7A8E77]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5C705A]" />
                Paquete Recomendado para tu Escenario
              </span>
              {recommendedPackage.badge && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#B69C76] text-white">
                  {recommendedPackage.badge}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
              <h3 className="text-xl font-bold font-editorial text-[#3C4A3C]">
                {recommendedPackage.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-[#B69C76] bg-[#B69C76]/15 px-2.5 py-1 rounded-full">Cotización a Medida</span>
              </div>
            </div>

            <p className="text-xs text-[#6A7869] mb-4 leading-relaxed">
              {recommendedPackage.tagline}
            </p>

            {/* Metric badges */}
            <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
              <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-[#E6DFD4]">
                <Coffee className="w-4 h-4 mx-auto text-[#5C705A] mb-1" />
                <div className="text-xs font-black text-[#3C4A3C]">{recommendedPackage.includedDrinks} Bebidas</div>
                <div className="text-[10px] text-[#7A8E77]">
                  {drinksCoverage >= 100 ? '100% Cubierto' : `${drinksCoverage}% del estimado`}
                </div>
              </div>

              <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-[#E6DFD4]">
                <Cookie className="w-4 h-4 mx-auto text-[#B69C76] mb-1" />
                <div className="text-xs font-black text-[#3C4A3C]">
                  {recommendedPackage.includedCookies > 0 ? `${recommendedPackage.includedCookies} Dulces/Cookies` : 'Dulces Opcional'}
                </div>
                <div className="text-[10px] text-[#7A8E77]">Horneadas al día</div>
              </div>

              <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-[#E6DFD4]">
                <Users className="w-4 h-4 mx-auto text-[#5C705A] mb-1" />
                <div className="text-xs font-black text-[#3C4A3C]">{recommendedPackage.baristasCount} Barista(s)</div>
                <div className="text-[10px] text-[#7A8E77]">Servicio continuo</div>
              </div>
            </div>

            {/* Key features bullets */}
            <div className="space-y-1.5 border-t border-[#FAF5EE] pt-3">
              {recommendedPackage.features.slice(0, 3).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#4A5A4B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A8E77] mt-1.5 flex-shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#F3EFE7] border-t border-[#E6DFD4] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#6A7869] text-center sm:text-left">
            <span className="font-semibold text-[#3C4A3C]">Recomendación lista:</span> Podrás afinar extras, fecha y zona en el cotizador.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#E6DFD4] bg-white text-xs font-semibold text-[#6A7869] hover:bg-[#FAF8F4] transition-all"
            >
              Cerrar
            </button>
            <button
              id="apply-recommendation-cta"
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#455546] text-white text-xs font-bold tracking-wide hover:bg-[#384639] shadow-sm active:scale-95 transition-all"
            >
              <span>Continuar en Cotizador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

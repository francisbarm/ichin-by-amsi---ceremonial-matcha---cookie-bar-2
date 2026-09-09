import React, { useState, useId } from 'react';
import { EventQuoteState, EventPackage, BookingRecord } from '../types';
import { EVENT_PACKAGES, CARACAS_ZONES } from '../data/eventPackages';
import { 
  Sparkles, Check, Users, Clock, MapPin, Calendar, 
  Send, ChevronRight, ChevronLeft, ShieldCheck, 
  Coffee, Award, Heart, MessageCircle 
} from 'lucide-react';

interface EventQuoterScreenProps {
  onQuoteSubmitted: (newBooking: BookingRecord) => void;
  initialQuoteParams?: {
    packageId?: string;
    guestCount?: number;
    eventType?: 'Boda' | 'Corporativo / Brand Activation' | 'Cumpleaños VIP' | 'Pop-up Privado' | 'Brunch & Social';
  };
}

export const EventQuoterScreen: React.FC<EventQuoterScreenProps> = ({ 
  onQuoteSubmitted,
  initialQuoteParams 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [quoteState, setQuoteState] = useState<EventQuoteState>(() => ({
    eventType: (initialQuoteParams?.eventType as any) || 'Boda',
    guestCount: initialQuoteParams?.guestCount || 60,
    packageId: initialQuoteParams?.packageId || 'ceremonial-luxury',
    serviceHours: 3,
    extraDrinksCount: 0,
    includeArtisanalCookies: true,
    cookieCount: initialQuoteParams?.guestCount || 60,
    customBrandedCups: true,
    matchaColdFoamStation: false,
    signatureDrinkCreated: false,
    locationZone: 'Altamira / Country Club',
    specificAddress: '',
    eventDate: '2026-10-24',
    eventTime: '16:00',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    specialRequests: '',
    customSignagePhrase: 'GOOD HABITS, BETTER DAYS ♡',
    cupOption: 'pet_cristal',
  }));

  React.useEffect(() => {
    if (initialQuoteParams) {
      setQuoteState((prev) => ({
        ...prev,
        eventType: (initialQuoteParams.eventType as any) || prev.eventType,
        guestCount: initialQuoteParams.guestCount || prev.guestCount,
        packageId: initialQuoteParams.packageId || prev.packageId,
        cookieCount: initialQuoteParams.guestCount || prev.cookieCount,
      }));
    }
  }, [initialQuoteParams]);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedBooking, setSubmittedBooking] = useState<BookingRecord | null>(null);

  // Selected package
  const selectedPkg =
    EVENT_PACKAGES.find((p) => p.id === quoteState.packageId) || EVENT_PACKAGES[1];

  // Dynamic cost calculation math
  const basePrice = selectedPkg.basePrice;
  
  // Extra hours over included hours
  const extraHours = Math.max(0, quoteState.serviceHours - selectedPkg.includedHours);
  const extraHoursCost = extraHours * 55;

  // Extra cookies calculation if added separately
  const includedCookies = selectedPkg.includedCookies;
  const extraCookies = quoteState.includeArtisanalCookies
    ? Math.max(0, quoteState.cookieCount - includedCookies)
    : 0;
  const cookiesCost = extraCookies * 2.0;

  // Add-ons
  const customCupsCost = quoteState.customBrandedCups ? 45 : 0;
  const coldFoamCost = quoteState.matchaColdFoamStation ? 50 : 0;
  const signatureDrinkCost = quoteState.signatureDrinkCreated ? 40 : 0;

  // Extra drinks for guest count beyond package included ($8/bebida base)
  const neededDrinks = quoteState.guestCount;
  const extraDrinks = Math.max(0, neededDrinks - selectedPkg.includedDrinks);
  const extraDrinksCost = extraDrinks * 8.0;

  const subtotal =
    basePrice +
    extraHoursCost +
    cookiesCost +
    customCupsCost +
    coldFoamCost +
    signatureDrinkCost +
    extraDrinksCost;

  const travelFee = 0; // Included within Gran Caracas
  const grandTotal = Math.round(subtotal + travelFee);

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();

    const bookingCode = `ICH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: BookingRecord = {
      id: `bk-${Date.now()}`,
      code: bookingCode,
      clientName: quoteState.clientName.trim() || 'Cliente Distinguido',
      eventType: quoteState.eventType,
      date: quoteState.eventDate,
      zone: quoteState.locationZone,
      packageTitle: selectedPkg.name,
      guests: quoteState.guestCount,
      totalUsd: grandTotal,
      status: 'pending',
      statusLabel: 'En Revisión',
      createdAt: 'Hace un momento',
    };

    setSubmittedBooking(newRecord);
    setIsSubmitted(true);
    onQuoteSubmitted(newRecord);
  };

  const handleOpenWhatsApp = () => {
    const cupLabel = quoteState.customBrandedCups 
      ? 'Vasos Personalizados con Logo/Monograma' 
      : quoteState.cupOption === 'vidrio_solicitud' 
        ? 'Cristalería en Vidrio (Bajo Solicitud)' 
        : 'Vasos PET Cristalinos Premium';

    const text = encodeURIComponent(
      `¡Hola ICHIN By AMSI! Me gustaría reservar el carrito de matcha para mi evento.\n\n` +
      `• Evento: ${quoteState.eventType}\n` +
      `• Paquete: ${selectedPkg.name}\n` +
      `• Invitados: ${quoteState.guestCount}\n` +
      `• Frase en Pizarra: "${quoteState.customSignagePhrase || 'GOOD HABITS, BETTER DAYS ♡'}"\n` +
      `• Presentación: ${cupLabel}\n` +
      `• Fecha: ${quoteState.eventDate} a las ${quoteState.eventTime}\n` +
      `• Zona Caracas: ${quoteState.locationZone}\n` +
      `• Modalidad: Solicitud de Cotización a Medida\n` +
      `• Nombre de contacto: ${quoteState.clientName || 'Cliente'}\n` +
      `• Teléfono: ${quoteState.clientPhone || 'No especificado'}\n\n` +
      `¿Tienen disponibilidad para esta fecha? ¡Gracias!`
    );
    window.open(`https://wa.me/584143260003?text=${text}`, '_blank');
  };

  return (
    <div id="event-quoter-container" className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE7] border border-[#E6DFD4] text-[#3C4A3C] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
          <span>Cotizador Interactivo • Caracas</span>
        </div>

        <h1 
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3C4A3C] tracking-tight mb-3 font-editorial"
          style={{ letterSpacing: '-0.025em' }}
        >
          Lleva el Ritual del Matcha a tu Evento
        </h1>

        <p className="text-sm sm:text-base text-[#525B4F] font-normal leading-relaxed">
          Diseña una experiencia sensorial irrepetible. Cotiza en tiempo real nuestro carrito artesanal para bodas, activaciones de marca y reuniones privadas con cálculo transparente.
        </p>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 max-w-xl mx-auto">
          {[
            { step: 1, label: '1. Evento & Invitados' },
            { step: 2, label: '2. Paquete' },
            { step: 3, label: '3. Extras & Barra' },
            { step: 4, label: '4. Locación & Datos' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentStep === item.step
                  ? 'bg-[#455546] text-white shadow-sm ring-2 ring-[#7A8E77]'
                  : currentStep > item.step
                  ? 'bg-[#7A8E77]/20 text-[#3C4A3C]'
                  : 'bg-[#F3EFE7] text-[#75786E]'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white text-[#3C4A3C] font-black">
                {currentStep > item.step ? '✓' : item.step}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {isSubmitted && submittedBooking ? (
        /* Confirmation State */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#7A8E77] p-6 sm:p-10 text-center shadow-lg animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-[#7A8E77]/20 text-[#3C4A3C] flex items-center justify-center mx-auto mb-4 border border-[#7A8E77]">
            <Check className="w-8 h-8 text-[#3C4A3C]" />
          </div>

          <span className="text-[11px] font-black tracking-widest text-[#B69C76] uppercase">
            Cotización Generada Exitosamente
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3C4A3C] mt-1 mb-2 font-editorial">
            ¡Tu fecha ha sido reservada preliminarmente!
          </h2>

          <p className="text-xs sm:text-sm text-[#525B4F] mb-6">
            Hemos asignado el código de reserva <strong className="text-[#3C4A3C] font-black">{submittedBooking.code}</strong> para tu evento en <strong>{quoteState.locationZone}</strong> el <strong>{quoteState.eventDate}</strong>.
          </p>

          <div className="bg-[#FAF8F4] rounded-2xl p-4 border border-[#E6DFD4] text-left text-xs mb-6 space-y-2">
            <div className="flex justify-between border-b border-[#E6DFD4] pb-2">
              <span className="text-gray-500">Paquete:</span>
              <span className="font-bold text-[#3C4A3C]">{selectedPkg.name}</span>
            </div>
            <div className="flex justify-between border-b border-[#E6DFD4] pb-2">
              <span className="text-gray-500">Invitados estimados:</span>
              <span className="font-bold text-[#3C4A3C]">{quoteState.guestCount} personas</span>
            </div>
            <div className="flex justify-between border-b border-[#E6DFD4] pb-2">
              <span className="text-gray-500">Horas de servicio:</span>
              <span className="font-bold text-[#3C4A3C]">{quoteState.serviceHours} horas continuas</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-black">
              <span className="text-[#3C4A3C]">Presupuesto para Evento:</span>
              <span className="text-[#B69C76]">Cotización a Medida</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleOpenWhatsApp}
              className="py-3 px-6 rounded-full bg-[#455546] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#384639] transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-[#D4BE9B]" />
              <span>Confirmar vía WhatsApp Directo</span>
            </button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
              }}
              className="py-3 px-6 rounded-full bg-[#F3EFE7] text-[#3C4A3C] font-semibold text-xs hover:bg-[#E9E4DA] transition-all"
            >
              Crear otra cotización
            </button>
          </div>
        </div>
      ) : (
        /* Asymmetrical Split Screen Form (7 Cols Form + 5 Cols Sticky Calculator) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Step Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DFD4] shadow-sm">
            <form onSubmit={handleSubmitQuote}>
              
              {/* STEP 1: EVENT TYPE & GUESTS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#3C4A3C] mb-1 font-editorial">
                      1. Selecciona el Tipo de Evento
                    </h3>
                    <p className="text-xs text-[#525B4F]">
                      Personalizamos la estética y el ritmo de servicio según tu celebración.
                    </p>
                  </div>

                  {/* Event Type Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Boda', icon: '💍', label: 'Boda de Ensueño', desc: 'Mesa de bienvenida o recarga de energía' },
                      { id: 'Corporativo / Brand Activation', icon: '🏢', label: 'Lanzamiento / Corporativo', desc: 'Eventos de marca, moda y oficinas' },
                      { id: 'Cumpleaños VIP', icon: '🎂', label: 'Cumpleaños & Aniversario', desc: 'Celebraciones íntimas y chic' },
                      { id: 'Pop-up Privado', icon: '✨', label: 'Pop-up & Brunch en Casa', desc: 'Jardines, terrazas y fin de semana' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setQuoteState({ ...quoteState, eventType: type.id as any })}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          quoteState.eventType === type.id
                            ? 'bg-[#7A8E77]/10 border-[#455546] ring-2 ring-[#455546]/30'
                            : 'bg-white border-[#E6DFD4] hover:border-[#7A8E77]'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="font-bold text-sm text-[#3C4A3C]">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{type.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Guest Count Slider */}
                  <div className="bg-[#FAF8F4] rounded-2xl p-5 border border-[#E6DFD4]">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#3C4A3C] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#7A8E77]" />
                        <span>Número Estimado de Invitados</span>
                      </label>
                      <span className="text-2xl font-black text-[#3C4A3C]">
                        {quoteState.guestCount} <span className="text-xs font-normal text-gray-500">invitados</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min="20"
                      max="250"
                      step="5"
                      value={quoteState.guestCount}
                      onChange={(e) => setQuoteState({ ...quoteState, guestCount: Number(e.target.value) })}
                      className="w-full accent-[#455546] h-2 bg-[#E6DFD4] rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                      <span>20 íntimo</span>
                      <span>50 mediano</span>
                      <span>100 celebración</span>
                      <span>250+ gran evento</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-3 px-6 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#384639] transition-all"
                    >
                      <span>Siguiente: Elegir Paquete</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PACKAGE SELECTION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#3C4A3C] mb-1 font-editorial">
                      2. Selecciona el Paquete del Carrito
                    </h3>
                    <p className="text-xs text-[#525B4F]">
                      Todos incluyen el carrito artesanal, servicio en vasos PET cristalinos premium, baristas e insumos 100% ceremoniales.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {EVENT_PACKAGES.map((pkg) => {
                      const isSelected = quoteState.packageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setQuoteState({ ...quoteState, packageId: pkg.id })}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#7A8E77]/10 border-[#455546] ring-2 ring-[#455546]/30 shadow-sm'
                              : 'bg-white border-[#E6DFD4] hover:border-[#7A8E77]'
                          }`}
                        >
                          {pkg.badge && (
                            <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-[#B69C76] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                              {pkg.badge}
                            </span>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-base text-[#3C4A3C]">{pkg.name}</h4>
                              <p className="text-xs text-gray-500">{pkg.tagline}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-black uppercase text-[#B69C76] bg-[#B69C76]/15 px-2.5 py-1 rounded-full">Para Eventos</span>
                              <span className="text-[10px] text-gray-500 block mt-1">Base {pkg.includedHours}h de servicio</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#3C4A3C] bg-[#FAF8F4] p-2.5 rounded-xl mb-3 border border-[#E6DFD4]">
                            <div><strong>Bebidas:</strong> ~{pkg.includedDrinks} tazas</div>
                            <div><strong>Horas:</strong> {pkg.includedHours} horas</div>
                            <div><strong>Baristas:</strong> {pkg.baristasCount} certificado(s)</div>
                          </div>

                          <ul className="space-y-1 text-xs text-[#525B4F]">
                            {pkg.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-[#7A8E77] shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="py-3 px-5 rounded-full bg-[#F3EFE7] text-[#3C4A3C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#E9E4DA] transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="py-3 px-6 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#384639] transition-all"
                    >
                      <span>Siguiente: Extras & Barra</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DURATION & UPGRADES */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#3C4A3C] mb-1 font-editorial">
                      3. Horas de Servicio y Complementos VIP
                    </h3>
                    <p className="text-xs text-[#525B4F]">
                      Añade galletas artesanales recién horneadas, vasos personalizados y estaciones botánicas.
                    </p>
                  </div>

                  {/* Hours Selector */}
                  <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#E6DFD4]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#3C4A3C] block mb-2">
                      Horas de Barra Abierta
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 5].map((hr) => (
                        <button
                          key={hr}
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, serviceHours: hr })}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            quoteState.serviceHours === hr
                              ? 'bg-[#455546] text-white shadow-sm'
                              : 'bg-white text-[#3C4A3C] border border-[#E6DFD4] hover:border-[#7A8E77]'
                          }`}
                        >
                          {hr} Horas
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons Toggles */}
                  <div className="space-y-4">
                    {/* Custom Chalkboard Phrase */}
                    <div className="p-4 rounded-2xl border border-[#E6DFD4] bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-xs text-[#3C4A3C] flex items-center gap-1.5">
                          <span>🪧</span>
                          <span>Frase Personalizada para la Pizarra del Carrito (Incluida)</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#7A8E77] bg-[#FAF8F4] px-2 py-0.5 rounded-full">
                          Sin costo extra
                        </span>
                      </div>
                      <p className="text-[11px] text-[#525B4F] mb-2.5">
                        Personaliza la pizarra caballete A-frame con tu frase preferida, monograma de boda o bienvenida a tus invitados:
                      </p>
                      <input
                        type="text"
                        value={quoteState.customSignagePhrase || ''}
                        onChange={(e) => setQuoteState({ ...quoteState, customSignagePhrase: e.target.value })}
                        placeholder="Ej. GOOD HABITS, BETTER DAYS ♡ / Boda Sofía & Mateo"
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F4] border border-[#E6DFD4] text-xs font-semibold text-[#3C4A3C] focus:outline-none focus:ring-2 focus:ring-[#7A8E77]"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'GOOD HABITS, BETTER DAYS ♡',
                          'GOOD DRINKS, BRIGHTER DAYS ♡',
                          'BEBIDAS NATURALES PARA GRANDES IDEAS',
                          'BODA INOLVIDABLE 2026',
                        ].map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => setQuoteState({ ...quoteState, customSignagePhrase: phrase })}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-[#FAF8F4] hover:bg-[#F3EFE7] text-[#3C4A3C] border border-[#E6DFD4] transition-all"
                          >
                            {phrase}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Service Packaging / Cups Presentation */}
                    <div className="p-4 rounded-2xl border border-[#E6DFD4] bg-[#FAF8F4]">
                      <div className="font-bold text-xs text-[#3C4A3C] mb-1 flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>Protocolo de Vasos en Eventos (Cero Vidrio por Seguridad)</span>
                      </div>
                      <p className="text-[11px] text-[#525B4F] mb-3">
                        En eventos servimos en vasos plásticos PET cristalinos ultra-resistentes para evitar roturas y cortes en la pista o jardín. La cristalería en vidrio solo se habilita bajo solicitud previa.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, customBrandedCups: false, cupOption: 'pet_cristal' })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            !quoteState.customBrandedCups && quoteState.cupOption !== 'vidrio_solicitud'
                              ? 'bg-white border-[#455546] ring-2 ring-[#455546]/20 shadow-xs'
                              : 'bg-white/60 border-[#E6DFD4]'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#3C4A3C]">Vasos PET Cristal</div>
                          <div className="text-[10px] text-gray-500">Ultra-resistentes (Incluidos)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, customBrandedCups: true, cupOption: 'personalizados' })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            quoteState.customBrandedCups
                              ? 'bg-white border-[#B69C76] ring-2 ring-[#B69C76]/30 shadow-xs'
                              : 'bg-white/60 border-[#E6DFD4]'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#3C4A3C]">Vasos Personalizados</div>
                          <div className="text-[10px] text-[#B69C76] font-bold">Con logo o frase en foil</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, customBrandedCups: false, cupOption: 'vidrio_solicitud' })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            quoteState.cupOption === 'vidrio_solicitud'
                              ? 'bg-white border-[#7A8E77] ring-2 ring-[#7A8E77]/30 shadow-xs'
                              : 'bg-white/60 border-[#E6DFD4]'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#3C4A3C]">Cristalería en Vidrio</div>
                          <div className="text-[10px] text-gray-500">Solo bajo solicitud</div>
                        </button>
                      </div>
                    </div>

                    {/* Artisanal Cookies toggle */}
                    <div className="p-4 rounded-2xl border border-[#E6DFD4] bg-white flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="font-bold text-xs text-[#3C4A3C]">
                          Estación de Galletas & Dulces Finos
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Horneadas al día: Cookie Dulce de Leche, Doble Choco Fleur de Sel, Bombones Artesanales Finos, Trufas de Cacao y Red Velvet AMSI.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={quoteState.includeArtisanalCookies}
                        onChange={(e) => setQuoteState({ ...quoteState, includeArtisanalCookies: e.target.checked })}
                        className="w-5 h-5 accent-[#455546] rounded cursor-pointer"
                      />
                    </div>

                    {/* Cold Foam Bar */}
                    <div className="p-4 rounded-2xl border border-[#E6DFD4] bg-white flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="font-bold text-xs text-[#3C4A3C]">
                          Barra Especial Strawberry & Pistachio Cold Foam
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Espumas frías botánicas de fresa natural macerada y crema de pistacho tostado servidas en vivo.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={quoteState.matchaColdFoamStation}
                        onChange={(e) => setQuoteState({ ...quoteState, matchaColdFoamStation: e.target.checked })}
                        className="w-5 h-5 accent-[#455546] rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-3 px-5 rounded-full bg-[#F3EFE7] text-[#3C4A3C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#E9E4DA] transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="py-3 px-6 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#384639] transition-all"
                    >
                      <span>Siguiente: Datos & Locación</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION & CONTACT DETAILS */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-[#3C4A3C] mb-1 font-editorial">
                      4. Locación en Caracas y Datos de Contacto
                    </h3>
                    <p className="text-xs text-[#555A50]">
                      Traslado e instalación incluidos en toda la Gran Caracas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Zone Selector */}
                    <div>
                      <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1.5">
                        Zona de Caracas
                      </label>
                      <select
                        value={quoteState.locationZone}
                        onChange={(e) => setQuoteState({ ...quoteState, locationZone: e.target.value })}
                        className="w-full px-3.5 py-3 text-xs bg-white border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                      >
                        {CARACAS_ZONES.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1.5">
                        Fecha del Evento
                      </label>
                      <input
                        type="date"
                        required
                        value={quoteState.eventDate}
                        onChange={(e) => setQuoteState({ ...quoteState, eventDate: e.target.value })}
                        className="w-full px-3.5 py-3 text-xs bg-white border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                      />
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1.5">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Valeria Mendoza"
                        value={quoteState.clientName}
                        onChange={(e) => setQuoteState({ ...quoteState, clientName: e.target.value })}
                        className="w-full px-3.5 py-3 text-xs bg-white border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1.5">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 0414-3260003"
                        value={quoteState.clientPhone}
                        onChange={(e) => setQuoteState({ ...quoteState, clientPhone: e.target.value })}
                        className="w-full px-3.5 py-3 text-xs bg-white border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                      />
                    </div>
                  </div>

                  {/* Special notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1.5">
                      Dirección específica o comentarios
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Jardines de Quinta La Castellana, acceso para carrito por rampa..."
                      value={quoteState.specialRequests}
                      onChange={(e) => setQuoteState({ ...quoteState, specialRequests: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="py-3 px-5 rounded-full bg-[#F3EFE7] text-[#3C4A3C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#E9E4DA] transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="submit"
                      id="submit-quote-btn"
                      className="py-3.5 px-8 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#384639] shadow-md transition-all"
                    >
                      <Send className="w-4 h-4 text-[#D4BE9B]" />
                      <span>Confirmar & Reservar Fecha</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Sticky Real-Time Quotation Drawer / Panel (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-[#3C4A3D] text-[#FAF8F4] rounded-3xl p-6 border border-[#4D5D4E] shadow-xl relative overflow-hidden">
              
              {/* Gold decorative accent */}
              <div className="flex items-center justify-between pb-4 border-b border-[#4D5D4E] mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A8E77]"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4BE9B]">
                    Resumen en Vivo
                  </span>
                </div>
                <span className="text-[11px] text-[#FAF8F4]/80">
                  Caracas, VZLA
                </span>
              </div>

              {/* Event Badge */}
              <div className="mb-4">
                <span className="text-[10px] text-[#9BB098] font-bold uppercase">
                  {quoteState.eventType}
                </span>
                <h4 className="text-xl font-bold text-white font-editorial">
                  {selectedPkg.name}
                </h4>
                <div className="text-xs text-[#FAF8F4]/80 mt-0.5 flex items-center gap-2">
                  <span>{quoteState.guestCount} invitados</span>
                  <span>•</span>
                  <span>{quoteState.serviceHours} horas servicio</span>
                </div>
              </div>

              {/* Breakdown Line Items */}
              <div className="space-y-2.5 text-xs border-t border-[#4D5D4E] pt-4 mb-6">
                <div className="flex justify-between text-[#FAF8F4]/90">
                  <span>Paquete base ({selectedPkg.includedHours}h, {selectedPkg.includedDrinks} tazas)</span>
                  <span className="font-semibold text-white">Seleccionado</span>
                </div>

                {extraHours > 0 && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>+{extraHours}h extra de servicio</span>
                    <span className="font-semibold text-[#9BB098]">+{extraHours}h adicionales</span>
                  </div>
                )}

                {extraDrinks > 0 && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>+{extraDrinks} bebidas adicionales</span>
                    <span className="font-semibold text-[#9BB098]">+{extraDrinks} tazas</span>
                  </div>
                )}

                {quoteState.includeArtisanalCookies && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>Galletas y dulces finos ({quoteState.guestCount} un.)</span>
                    <span className="font-semibold text-[#9BB098]">
                      Estación Incluida
                    </span>
                  </div>
                )}

                {quoteState.customBrandedCups && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>Vasos con monograma personalizado</span>
                    <span className="font-semibold text-[#9BB098]">Personalizados</span>
                  </div>
                )}

                {quoteState.matchaColdFoamStation && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>Estación Strawberry Cold Foam</span>
                    <span className="font-semibold text-[#9BB098]">Incluida</span>
                  </div>
                )}

                <div className="flex justify-between text-[#FAF8F4]/90">
                  <span>Traslado y montaje en {quoteState.locationZone.split('/')[0]}</span>
                  <span className="font-bold text-[#9BB098]">INCLUIDO</span>
                </div>
              </div>

              {/* Grand Total Hero Display */}
              <div className="bg-[#344034] rounded-2xl p-4 border border-[#B69C76]/40 mb-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#D4BE9B] font-bold">
                    Presupuesto del Evento
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    Cotización a Medida
                  </span>
                </div>
                <div className="text-[10px] text-gray-300 mt-1">
                  Consulta disponibilidad y propuesta personalizada vía WhatsApp directo.
                </div>
              </div>

              {/* Direct WhatsApp trigger */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3 px-4 rounded-full bg-[#25D366] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1EBE5D] transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>Consultar Disponibilidad por WhatsApp</span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#FAF8F4]/70">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9BB098]" />
                <span>Disponibilidad sujeta a agenda de fines de semana</span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

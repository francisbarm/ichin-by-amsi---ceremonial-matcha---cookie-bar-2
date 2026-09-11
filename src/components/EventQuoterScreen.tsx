import React, { useState, useId } from 'react';
import { EventQuoteState, EventPackage, BookingRecord } from '../types';
import { EVENT_PACKAGES, CARACAS_ZONES } from '../data/eventPackages';
import { 
  Sparkles, Check, Users, Clock, MapPin, Calendar, 
  Send, ChevronRight, ChevronLeft, ShieldCheck, 
  Coffee, Award, Heart, MessageCircle, Mail,
  Printer, ChevronDown, ChevronUp, HelpCircle, CheckCircle2
} from 'lucide-react';
import { guardarCotizacionSupabase } from '../lib/supabase';
import { enviarCorreoCotizacionResend } from '../services/resendService';
import { enviarCotizacionWhatsApp } from '../services/whatsappService';
import { 
  MOTIVATIONAL_PHRASES, 
  PHRASE_CATEGORIES, 
  getPhrasesByCategory, 
  getRandomPhrase,
  MotivationalPhrase 
} from '../data/motivationalPhrases';

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
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stepVal = parseInt(params.get('step') || '1', 10);
      if (stepVal >= 1 && stepVal <= 4) return stepVal;
    }
    return 1;
  });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
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
    terraceFurniture: 'ninguno',
    drinkCharmsCustomization: false,
    drinkCharmsTheme: 'mix_sorpresa',
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

  // Motivational phrases state for chalkboard personalization
  const [phraseCategoryFilter, setPhraseCategoryFilter] = useState<'all' | 'bodas' | 'corporativo' | 'cumpleanos' | 'wellness' | 'social' | 'graduacion'>('all');
  const [phraseLangFilter, setPhraseLangFilter] = useState<'all' | 'es' | 'en'>('all');
  const [phraseSearchTerm, setPhraseSearchTerm] = useState<string>('');
  const [justAppliedPhrase, setJustAppliedPhrase] = useState<string | null>(null);

  // Auto-suggest phrase category based on event type
  React.useEffect(() => {
    if (quoteState.eventType === 'Boda') {
      setPhraseCategoryFilter('bodas');
    } else if (quoteState.eventType === 'Corporativo / Brand Activation') {
      setPhraseCategoryFilter('corporativo');
    } else if (quoteState.eventType === 'Cumpleaños VIP') {
      setPhraseCategoryFilter('cumpleanos');
    } else if (quoteState.eventType === 'Brunch & Social') {
      setPhraseCategoryFilter('social');
    }
  }, [quoteState.eventType]);

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

  // Charms / Personalización de Bebidas (+$1.00 por pieza/invitado)
  const charmsCost = quoteState.drinkCharmsCustomization ? quoteState.guestCount * 1.0 : 0;

  const subtotal =
    basePrice +
    extraHoursCost +
    cookiesCost +
    customCupsCost +
    coldFoamCost +
    signatureDrinkCost +
    extraDrinksCost +
    charmsCost;

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

    const getFurnitureLabel = (furniture?: string) => {
      if (furniture === 'lounge_completo') return 'Montaje Lounge Completo (Toldos Riviera + Mesas Altas + Taburetes Blancos + Sillas Medallón)';
      if (furniture === 'mesas_altas') return 'Set de Mesas Altas Cocteleras & Taburetes Blancos';
      if (furniture === 'toldos_sombrilla') return 'Set de Toldos Sombrilla Riviera (Lona blanca con flecos)';
      return '';
    };

    const getCharmsThemeLabel = (theme?: string) => {
      if (theme === 'ositos_teddy') return 'Colección Ositos Teddy Kawaii & Bear Hug';
      if (theme === 'halloween') return 'Colección Spooky Cute Fantasmitas (Halloween/Otoño)';
      if (theme === 'navidad') return 'Colección Navideña (Santa, Renos & Pinos)';
      if (theme === 'mini_foodie') return 'Colección Mini Foodie & Mystery Bag (Donas & Boba)';
      if (theme === 'glow_animals') return 'Colección Animalitos Fluorescentes (Glow in the Dark)';
      if (theme === 'gemas_cristal') return 'Estación Gemas 3D & Cristales Autoadhesivos';
      return 'Mix Sorpresa de Charms & Dijs Coleccionables';
    };

    const furnitureText = getFurnitureLabel(quoteState.terraceFurniture);
    const charmsText = quoteState.drinkCharmsCustomization 
      ? `Personalización de Bebidas: ${getCharmsThemeLabel(quoteState.drinkCharmsTheme)} (${quoteState.guestCount} pzs x $1 = +$${quoteState.guestCount})`
      : '';

    // Guardar asíncronamente en Supabase (tabla ichin_cotizaciones y leads de AMSI CRM)
    guardarCotizacionSupabase({
      cliente_nombre: quoteState.clientName.trim() || 'Cliente Distinguido',
      cliente_telefono: quoteState.clientPhone.trim() || 'No especificado',
      cliente_email: quoteState.clientEmail.trim() || undefined,
      tipo_evento: quoteState.eventType,
      fecha_evento: `${quoteState.eventDate} ${quoteState.eventTime}`,
      lugar_evento: quoteState.locationZone,
      numero_invitados: quoteState.guestCount,
      paquete_nombre: selectedPkg.name,
      tipo_montaje: quoteState.setupColorTheme || 'Barra Estándar',
      adicionales: [
        quoteState.includeCookies ? `Cookies artesanales (${selectedPkg.cookieCount})` : '',
        quoteState.coldFoamBar ? 'Barra de Espumas Frías' : '',
        quoteState.signatureDrink ? 'Bebida de Autor Exclusiva' : '',
        quoteState.customBrandedCups ? 'Vasos Personalizados con Logo' : '',
        furnitureText ? `Mobiliario: ${furnitureText}` : '',
        charmsText ? charmsText : '',
      ].filter(Boolean),
      notas_adicionales: `Frase en pizarra: "${quoteState.customSignagePhrase}". Código: ${bookingCode}`,
      resumen_items: {
        codigo: bookingCode,
        bebidasBase: selectedPkg.drinksCount,
        horas: quoteState.serviceHours,
        opcionVasos: quoteState.cupOption,
        mobiliario: quoteState.terraceFurniture || 'ninguno',
        charms: quoteState.drinkCharmsCustomization ? quoteState.drinkCharmsTheme : 'no',
      },
    });

    // Enviar correo de confirmación de cotización vía Resend
    if (quoteState.clientEmail && quoteState.clientEmail.includes('@')) {
      enviarCorreoCotizacionResend({
        toEmail: quoteState.clientEmail.trim(),
        clientName: quoteState.clientName.trim() || 'Cliente Distinguido',
        bookingCode: bookingCode,
        packageName: selectedPkg.name,
        guestCount: quoteState.guestCount,
        eventDate: quoteState.eventDate,
        eventTime: quoteState.eventTime,
        locationZone: quoteState.locationZone,
        setupTheme: quoteState.setupColorTheme,
        terraceFurniture: furnitureText || undefined,
        drinkCharms: charmsText || undefined,
        addons: [
          quoteState.includeCookies ? `Cookies artesanales horneadas al día (${selectedPkg.cookieCount})` : '',
          quoteState.coldFoamBar ? 'Estación de Espumas Frías (Matcha Cold Foam)' : '',
          quoteState.signatureDrink ? 'Bebida de Autor Exclusiva del Evento' : '',
          quoteState.customBrandedCups ? 'Vasos Personalizados con Logo/Monograma' : '',
          furnitureText ? `Mobiliario de Terraza: ${furnitureText}` : '',
          charmsText ? charmsText : '',
        ].filter(Boolean),
        signagePhrase: quoteState.customSignagePhrase,
      });
    }

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

    const furnitureText = 
      quoteState.terraceFurniture === 'lounge_completo'
        ? 'Montaje Lounge Completo (Toldos Riviera + Mesas Altas + Taburetes + Sillas Medallón)'
        : quoteState.terraceFurniture === 'mesas_altas'
        ? 'Set de Mesas Altas Cocteleras & Taburetes Blancos'
        : quoteState.terraceFurniture === 'toldos_sombrilla'
        ? 'Set de Toldos Sombrilla Riviera (Lona blanca con flecos)'
        : '';

    const getCharmsThemeLabel = (theme?: string) => {
      if (theme === 'ositos_teddy') return 'Colección Ositos Teddy Kawaii & Bear Hug';
      if (theme === 'halloween') return 'Colección Spooky Cute Fantasmitas (Halloween/Otoño)';
      if (theme === 'navidad') return 'Colección Navideña (Santa, Renos & Pinos)';
      if (theme === 'mini_foodie') return 'Colección Mini Foodie & Mystery Bag (Donas & Boba)';
      if (theme === 'glow_animals') return 'Colección Animalitos Fluorescentes (Glow in the Dark)';
      if (theme === 'gemas_cristal') return 'Estación Gemas 3D & Cristales Autoadhesivos';
      return 'Mix Sorpresa de Charms & Dijs Coleccionables';
    };

    const charmsText = quoteState.drinkCharmsCustomization 
      ? `Personalización de Bebidas: ${getCharmsThemeLabel(quoteState.drinkCharmsTheme)} (${quoteState.guestCount} pzs x $1 = +$${quoteState.guestCount})`
      : '';

    // Guardar en Supabase y abrir WhatsApp oficial
    guardarCotizacionSupabase({
      cliente_nombre: quoteState.clientName.trim() || 'Cliente WhatsApp Directo',
      cliente_telefono: quoteState.clientPhone.trim() || 'No especificado',
      cliente_email: quoteState.clientEmail.trim() || undefined,
      tipo_evento: quoteState.eventType,
      fecha_evento: `${quoteState.eventDate} ${quoteState.eventTime}`,
      lugar_evento: quoteState.locationZone,
      numero_invitados: quoteState.guestCount,
      paquete_nombre: selectedPkg.name,
      tipo_montaje: quoteState.setupColorTheme || 'Barra Estándar',
      adicionales: [
        quoteState.includeCookies ? `Cookies artesanales (${selectedPkg.cookieCount})` : '',
        quoteState.coldFoamBar ? 'Barra de Espumas Frías' : '',
        quoteState.signatureDrink ? 'Bebida de Autor Exclusiva' : '',
        quoteState.customBrandedCups ? 'Vasos Personalizados con Logo' : '',
        furnitureText ? `Mobiliario: ${furnitureText}` : '',
        charmsText ? charmsText : '',
      ].filter(Boolean),
      notas_adicionales: `Contacto WhatsApp Directo. Pizarra: "${quoteState.customSignagePhrase || 'GOOD HABITS, BETTER DAYS ♡'}"`,
      resumen_items: {
        tipo: 'whatsapp_directo',
        bebidas: selectedPkg.drinksCount,
        mobiliario: quoteState.terraceFurniture || 'ninguno',
        charms: quoteState.drinkCharmsCustomization ? quoteState.drinkCharmsTheme : 'no',
      },
    });

    enviarCotizacionWhatsApp({
      clientName: quoteState.clientName.trim() || 'Cliente',
      clientPhone: quoteState.clientPhone.trim() || 'No especificado',
      clientEmail: quoteState.clientEmail.trim() || undefined,
      bookingCode: submittedBooking?.code || `ICH-${Math.floor(1000 + Math.random() * 9000)}`,
      eventType: quoteState.eventType,
      packageName: selectedPkg.name,
      guestCount: quoteState.guestCount,
      eventDate: quoteState.eventDate,
      eventTime: quoteState.eventTime,
      locationZone: quoteState.locationZone,
      customSignagePhrase: quoteState.customSignagePhrase,
      cupOptionLabel: cupLabel,
      terraceFurnitureLabel: furnitureText || undefined,
      charmsCustomizationLabel: charmsText || undefined,
    });
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
            {quoteState.terraceFurniture && quoteState.terraceFurniture !== 'ninguno' && (
              <div className="flex justify-between border-b border-[#E6DFD4] pb-2">
                <span className="text-gray-500">Mobiliario de Terraza:</span>
                <span className="font-bold text-[#455546]">
                  {quoteState.terraceFurniture === 'lounge_completo'
                    ? 'Lounge Completo (Toldos + Mesas Altas + Sillas)'
                    : quoteState.terraceFurniture === 'mesas_altas'
                    ? 'Mesas Altas Cocteleras & Taburetes'
                    : 'Toldos Sombrilla Riviera'}
                </span>
              </div>
            )}
            {quoteState.drinkCharmsCustomization && (
              <div className="flex justify-between border-b border-[#E6DFD4] pb-2">
                <span className="text-gray-500">Charms & Dijs en Bebidas (+$1/pz):</span>
                <span className="font-bold text-[#455546]">
                  {quoteState.guestCount} piezas ({quoteState.drinkCharmsTheme === 'ositos_teddy' ? 'Ositos Teddy' : quoteState.drinkCharmsTheme === 'halloween' ? 'Spooky Cute' : quoteState.drinkCharmsTheme === 'navidad' ? 'Navidad' : quoteState.drinkCharmsTheme === 'mini_foodie' ? 'Mini Foodie' : quoteState.drinkCharmsTheme === 'glow_animals' ? 'Glow in Dark' : quoteState.drinkCharmsTheme === 'gemas_cristal' ? 'Gemas 3D' : 'Mix Sorpresa'})
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-sm font-black">
              <span className="text-[#3C4A3C]">Presupuesto para Evento:</span>
              <span className="text-[#B69C76]">Cotización a Medida</span>
            </div>
          </div>

          {quoteState.clientEmail && (
            <div className="bg-[#EBF3EA] border border-[#BACFBA] rounded-2xl p-3 text-center text-xs text-[#2E432E] flex items-center justify-center gap-2 mb-6">
              <Mail className="w-4 h-4 text-[#7A8E77]" />
              <span>Copia de la propuesta enviada a <strong>{quoteState.clientEmail}</strong> vía Resend.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleOpenWhatsApp}
              className="py-3 px-6 rounded-full bg-[#455546] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#384639] transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-[#D4BE9B]" />
              <span>Confirmar vía WhatsApp Directo</span>
            </button>

            <button
              onClick={() => window.print()}
              className="py-3 px-5 rounded-full bg-white border border-[#455546] text-[#3C4A3C] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#FAF8F4] transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#455546]" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
              }}
              className="py-3 px-5 rounded-full bg-[#F3EFE7] text-[#3C4A3C] font-semibold text-xs hover:bg-[#E9E4DA] transition-all"
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
                    {/* Custom Chalkboard Phrase with Extensive Categorized Bilingual Presets */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-[#E6DFD4] bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs sm:text-sm text-[#3C4A3C] flex items-center gap-1.5">
                          <span className="text-base">🪧</span>
                          <span>Frase Motivacional para la Pizarra del Carrito</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#455546] bg-[#FAF8F4] border border-[#D4C4AA] px-2.5 py-0.5 rounded-full">
                          ✦ Incluida sin costo
                        </span>
                      </div>
                      <p className="text-[11px] text-[#525B4F] leading-relaxed">
                        Personaliza la pizarra caballete A-frame que colocamos en la entrada del carrito. Selecciona entre nuestras frases motivacionales por evento en <strong>Español e Inglés</strong>, o escribe tu propio monograma o dedicatoria:
                      </p>

                      {/* Main input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={quoteState.customSignagePhrase || ''}
                          onChange={(e) => {
                            setQuoteState({ ...quoteState, customSignagePhrase: e.target.value });
                            setJustAppliedPhrase(null);
                          }}
                          placeholder="Ej. GOOD HABITS, BETTER DAYS ♡ / Boda Sofía & Mateo"
                          className="w-full py-2.5 px-3.5 pr-10 rounded-xl bg-[#FAF8F4] border border-[#E6DFD4] text-xs font-semibold text-[#3C4A3C] focus:outline-none focus:ring-2 focus:ring-[#7A8E77]"
                        />
                        {quoteState.customSignagePhrase && (
                          <button
                            type="button"
                            onClick={() => setQuoteState({ ...quoteState, customSignagePhrase: '' })}
                            className="absolute right-3 top-2.5 text-xs text-[#9BB098] hover:text-[#455546]"
                            title="Borrar frase"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filter Controls: Category + Language + Randomizer */}
                      <div className="pt-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {/* Language selector */}
                          <div className="flex items-center gap-1 bg-[#FAF8F4] p-1 rounded-xl border border-[#E6DFD4]">
                            <button
                              type="button"
                              onClick={() => setPhraseLangFilter('all')}
                              className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                                phraseLangFilter === 'all'
                                  ? 'bg-[#455546] text-white shadow-xs'
                                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
                              }`}
                            >
                              🌐 Ambos
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhraseLangFilter('es')}
                              className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                                phraseLangFilter === 'es'
                                  ? 'bg-[#455546] text-white shadow-xs'
                                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
                              }`}
                            >
                              🇪🇸 Español
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhraseLangFilter('en')}
                              className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                                phraseLangFilter === 'en'
                                  ? 'bg-[#455546] text-white shadow-xs'
                                  : 'text-[#525B4F] hover:text-[#3C4A3C]'
                              }`}
                            >
                              🇺🇸 English
                            </button>
                          </div>

                          {/* Quick Randomizer */}
                          <button
                            type="button"
                            onClick={() => {
                              const rnd = getRandomPhrase(phraseCategoryFilter, phraseLangFilter);
                              setQuoteState({ ...quoteState, customSignagePhrase: rnd.phrase });
                              setJustAppliedPhrase(rnd.id);
                              setTimeout(() => setJustAppliedPhrase(null), 2500);
                            }}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[#EDE7DC] hover:bg-[#D4C4AA]/70 text-[#3C4A3C] border border-[#D4C4AA] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>🎲</span>
                            <span>Frase Aleatoria</span>
                          </button>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          {PHRASE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setPhraseCategoryFilter(cat.id as any)}
                              className={`text-[10px] px-2.5 py-1 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-1 ${
                                phraseCategoryFilter === cat.id
                                  ? 'bg-[#7A8E77] text-white shadow-xs font-bold'
                                  : 'bg-[#FAF8F4] text-[#525B4F] border border-[#E6DFD4] hover:bg-[#F3EFE7]'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{phraseLangFilter === 'en' ? cat.labelEn : cat.labelEs}</span>
                            </button>
                          ))}
                        </div>

                        {/* Keyword search filter */}
                        <input
                          type="text"
                          value={phraseSearchTerm}
                          onChange={(e) => setPhraseSearchTerm(e.target.value)}
                          placeholder="🔍 Filtrar frases por palabra clave (ej. amor, matcha, focus, risas)..."
                          className="w-full py-1.5 px-3 rounded-lg bg-[#FAF8F4] border border-[#E6DFD4] text-[10px] text-[#3C4A3C] placeholder-[#9BB098] focus:outline-none focus:ring-1 focus:ring-[#7A8E77]"
                        />
                      </div>

                      {/* Filtered Motivational Phrases Grid */}
                      <div className="max-h-44 overflow-y-auto pr-1 space-y-1.5 rounded-xl border border-[#E6DFD4] p-2 bg-[#FAF8F4]/60">
                        {getPhrasesByCategory(phraseCategoryFilter, phraseLangFilter)
                          .filter((p) => 
                            !phraseSearchTerm.trim() || 
                            p.phrase.toLowerCase().includes(phraseSearchTerm.toLowerCase()) ||
                            p.categoryLabel.toLowerCase().includes(phraseSearchTerm.toLowerCase())
                          )
                          .map((item) => {
                            const isSelected = quoteState.customSignagePhrase === item.phrase;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setQuoteState({ ...quoteState, customSignagePhrase: item.phrase });
                                  setJustAppliedPhrase(item.id);
                                  setTimeout(() => setJustAppliedPhrase(null), 2500);
                                }}
                                className={`w-full text-left p-2 rounded-lg text-[11px] transition-all flex items-center justify-between gap-2 border ${
                                  isSelected
                                    ? 'bg-[#455546] text-white border-[#455546] font-semibold shadow-xs'
                                    : 'bg-white hover:bg-[#F3EFE7] text-[#3C4A3C] border-[#E6DFD4]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <span className="text-xs shrink-0">{item.icon}</span>
                                  <span className="truncate italic">"{item.phrase}"</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF8F4] text-[#6A7869] border border-[#E6DFD4]'
                                  }`}>
                                    {item.lang === 'es' ? 'ES' : 'EN'}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] text-[#A3E635]">✓</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {/* Live Mini-Chalkboard Preview */}
                      <div className="mt-2 p-3 rounded-xl bg-[#2B342B] border-2 border-[#525B4F] text-center shadow-inner">
                        <div className="text-[9px] font-bold text-[#D4BE9B] uppercase tracking-widest mb-1">
                          Pizarra de Bienvenida • Vista Previa
                        </div>
                        <p className="text-[#FAF8F4] font-serif text-xs sm:text-sm font-bold tracking-wide italic">
                          "{quoteState.customSignagePhrase || 'GOOD HABITS, BETTER DAYS ♡'}"
                        </p>
                        <div className="text-[9px] text-[#9BB098] mt-1 tracking-widest uppercase">
                          ICHIN BY AMSI • CEREMONIAL MATCHA
                        </div>
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

                    {/* NUEVO: MOBILIARIO DE TERRAZA, TOLDOS Y MESAS ALTAS */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-[#E6DFD4] bg-[#FAF8F4] space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#3C4A3C] flex items-center gap-1.5 uppercase tracking-wider">
                            <span>☀️</span>
                            <span>Mobiliario de Terraza & Toldos Lounge (Opcional)</span>
                          </div>
                          <p className="text-[11px] text-[#525B4F] mt-0.5">
                            Ambientación chic para exteriores, vistas al Ávila y jardines en Caracas.
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#7A8E77]/20 text-[#3C4A3C] text-[10px] font-bold uppercase tracking-wider shrink-0">
                          AMSI Lounge • Terrazas
                        </span>
                      </div>

                      {/* Tarjeta con Foto Real del Montaje */}
                      <div className="relative rounded-xl overflow-hidden border border-[#E6DFD4] group h-40">
                        <img
                          src="/branding/mobiliario-toldos-terrazas-vip.jpg"
                          alt="Montaje de Terraza con Toldos Sombrilla y Mesas Altas"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3">
                          <span className="text-[10px] font-bold text-[#D4BE9B] uppercase tracking-widest">Montaje en Terraza con Vista al Ávila</span>
                          <span className="text-white text-xs font-semibold">Toldos Riviera con flecos, mesas altas cocteleras, taburetes y mesas con sillas medallón</span>
                        </div>
                      </div>

                      {/* Opciones de Mobiliario */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, terraceFurniture: 'ninguno' })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            quoteState.terraceFurniture === 'ninguno' || !quoteState.terraceFurniture
                              ? 'bg-white border-[#455546] ring-2 ring-[#455546]/20 shadow-xs'
                              : 'bg-white/60 border-[#E6DFD4]'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#3C4A3C]">Solo Barra Móvil</div>
                          <div className="text-[10px] text-gray-500">Sin mobiliario exterior</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, terraceFurniture: 'toldos_sombrilla' })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            quoteState.terraceFurniture === 'toldos_sombrilla'
                              ? 'bg-white border-[#B69C76] ring-2 ring-[#B69C76]/30 shadow-xs'
                              : 'bg-white/60 border-[#E6DFD4]'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#3C4A3C]">Toldos Sombrilla Riviera</div>
                          <div className="text-[10px] text-[#B69C76] font-bold">Lona blanca & flecos chic</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, terraceFurniture: 'mesas_altas' })}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            quoteState.terraceFurniture === 'mesas_altas'
                              ? 'bg-white border-[#7A8E77] ring-2 ring-[#7A8E77]/30 shadow-xs'
                              : 'bg-white/60 border-[#E6DFD4]'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#3C4A3C]">Mesas Altas + Taburetes</div>
                          <div className="text-[10px] text-[#7A8E77] font-bold">Estaciones cocteleras blancas</div>
                        </button>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setQuoteState({ ...quoteState, terraceFurniture: 'lounge_completo' })}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                            quoteState.terraceFurniture === 'lounge_completo'
                              ? 'bg-[#EBF3EA] border-[#7A8E77] ring-2 ring-[#7A8E77]/30 shadow-xs'
                              : 'bg-white/80 border-[#E6DFD4]'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-[#3C4A3C]">✨ Montaje Lounge Completo de Terraza</div>
                            <div className="text-[10px] text-[#525B4F]">Toldos Riviera + Mesas Altas + Taburetes + Mesas Bajas y Sillas Medallón</div>
                          </div>
                          <span className="text-[10px] font-bold text-[#455546] bg-white px-2 py-0.5 rounded-full border border-[#E6DFD4] shrink-0">
                            Pack Lounge VIP
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* NUEVO: ESTACIÓN DE CHARMS & PERSONALIZACIÓN DE BEBIDAS (+$1.00 / PIEZA) */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-[#E6DFD4] bg-white space-y-4 shadow-2xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex-1 pr-2">
                          <div className="font-bold text-xs text-[#3C4A3C] flex items-center gap-1.5 uppercase tracking-wider">
                            <span>✨</span>
                            <span>Barra de Charms & Personalización de Bebidas</span>
                          </div>
                          <p className="text-[11px] text-[#525B4F] mt-0.5">
                            Dijs coleccionables, figuritas temáticas y gemas 3D para que cada invitado decore su vaso como recuerdo.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-[#B69C76]/20 text-[#3C4A3C] text-[11px] font-extrabold tracking-wide shrink-0 border border-[#B69C76]/30">
                            +$1.00 / pieza
                          </span>
                          <input
                            type="checkbox"
                            checked={quoteState.drinkCharmsCustomization}
                            onChange={(e) => setQuoteState({ ...quoteState, drinkCharmsCustomization: e.target.checked })}
                            className="w-5 h-5 accent-[#455546] rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Photo Collage / Showcase of Charms */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <div className="group relative rounded-xl overflow-hidden aspect-square border border-[#E6DFD4]">
                          <img src="/branding/charms/charms-ositos-kawaii.jpg" alt="Ositos Kawaii" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">Ositos</div>
                        </div>
                        <div className="group relative rounded-xl overflow-hidden aspect-square border border-[#E6DFD4]">
                          <img src="/branding/charms/charms-halloween-fantasmitas.jpg" alt="Fantasmitas Spooky" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">Fantasmitas</div>
                        </div>
                        <div className="group relative rounded-xl overflow-hidden aspect-square border border-[#E6DFD4]">
                          <img src="/branding/charms/charms-navidad-festivo.jpg" alt="Navidad" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">Navidad</div>
                        </div>
                        <div className="group relative rounded-xl overflow-hidden aspect-square border border-[#E6DFD4]">
                          <img src="/branding/charms/charms-mini-foodie.jpg" alt="Mini Foodie" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">Mini Foodie</div>
                        </div>
                        <div className="group relative rounded-xl overflow-hidden aspect-square border border-[#E6DFD4]">
                          <img src="/branding/charms/charms-glow-animals.jpg" alt="Glow Animals" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">Glow Noche</div>
                        </div>
                        <div className="group relative rounded-xl overflow-hidden aspect-square border border-[#E6DFD4]">
                          <img src="/branding/charms/charms-gemas-cristales.jpg" alt="Gemas 3D" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">Gemas 3D</div>
                        </div>
                      </div>

                      {/* Theme Selector if active */}
                      {quoteState.drinkCharmsCustomization ? (
                        <div className="p-3 bg-[#FAF8F4] rounded-xl border border-[#E6DFD4] space-y-2 animate-in fade-in duration-200">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3C4A3C]">
                            Selecciona la Colección Temática para tu Evento:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              { id: 'mix_sorpresa', label: 'Mix Sorpresa de Temporada', desc: 'Surtido variado para que cada invitado elija' },
                              { id: 'ositos_teddy', label: 'Ositos Teddy Kawaii & Bear Hug', desc: 'Perfecto para bodas, baby showers y aniversarios' },
                              { id: 'halloween', label: 'Spooky Cute Fantasmitas', desc: 'Edición especial Halloween y fiestas de octubre' },
                              { id: 'navidad', label: 'Navidad & Festividades', desc: 'Santa, renos, pinos y bastones de caramelo' },
                              { id: 'mini_foodie', label: 'Mini Foodie & Mystery Bag', desc: 'Mini donitas, bubble tea, croissants y pasteles' },
                              { id: 'glow_animals', label: 'Animalitos Fluorescentes (Glow)', desc: 'Brillan en la oscuridad para fiestas nocturnas' },
                              { id: 'gemas_cristal', label: 'Gemas 3D & Cristales Autoadhesivos', desc: 'Diseños de brillo y diamantes para el vaso' },
                            ].map((theme) => {
                              const isSelected = quoteState.drinkCharmsTheme === theme.id;
                              return (
                                <button
                                  key={theme.id}
                                  type="button"
                                  onClick={() => setQuoteState({ ...quoteState, drinkCharmsTheme: theme.id as any })}
                                  className={`p-2 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? 'bg-white border-[#455546] ring-2 ring-[#455546]/20 shadow-xs'
                                      : 'bg-white/60 border-[#E6DFD4] hover:bg-white'
                                  }`}
                                >
                                  <div className="font-bold text-[11px] text-[#3C4A3C]">{theme.label}</div>
                                  <div className="text-[10px] text-gray-500">{theme.desc}</div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#455546] border-t border-[#E6DFD4]">
                            <span>Inversión adicional:</span>
                            <span>{quoteState.guestCount} piezas × $1.00 = +${quoteState.guestCount}.00 USD</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#7A8E77] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Marca la casilla arriba para activar la personalización de bebidas a $1 por pieza.</span>
                        </div>
                      )}
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

                  {/* Email Field (Resend Integration) */}
                  <div>
                    <label className="block text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#7A8E77]" />
                        <span>Correo Electrónico (Para recibir propuesta formal)</span>
                      </span>
                      <span className="text-[10px] text-[#7A8E77] font-normal lowercase">vía Resend</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Ej. valeria@gmail.com"
                      value={quoteState.clientEmail}
                      onChange={(e) => setQuoteState({ ...quoteState, clientEmail: e.target.value })}
                      className="w-full px-3.5 py-3 text-xs bg-white border border-[#E6DFD4] rounded-2xl focus:outline-none focus:border-[#7A8E77] text-[#3C4A3C]"
                    />
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

                {quoteState.terraceFurniture && quoteState.terraceFurniture !== 'ninguno' && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>Mobiliario de Terraza</span>
                    <span className="font-semibold text-[#D4BE9B]">
                      {quoteState.terraceFurniture === 'lounge_completo'
                        ? 'Lounge Completo'
                        : quoteState.terraceFurniture === 'mesas_altas'
                        ? 'Mesas Altas + Taburetes'
                        : 'Toldos Riviera'}
                    </span>
                  </div>
                )}

                {quoteState.drinkCharmsCustomization && (
                  <div className="flex justify-between text-[#FAF8F4]/90">
                    <span>Personalización Charms ({quoteState.guestCount} pzs x $1)</span>
                    <span className="font-semibold text-[#D4BE9B]">
                      +${quoteState.guestCount}
                    </span>
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

      {/* SECTION: GUÍA TÉCNICA & REQUERIMIENTOS DE MONTAJE */}
      <div className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-[#E6DFD4] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DFD4] gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B69C76]">
              Ficha de Operaciones & Logística
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#3C4A3C] font-editorial">
              Requerimientos Técnicos para tu Locación en Caracas
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FAF8F4] text-xs font-semibold text-[#525B4F] border border-[#E6DFD4] w-fit">
            Instalación Llave en Mano
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#7A8E77]/15 text-[#3C4A3C] flex items-center justify-center font-bold mb-3">
              ⚡
            </div>
            <h4 className="font-bold text-xs text-[#3C4A3C] mb-1">Toma Eléctrica 110V</h4>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              1 toma corriente estándar a menos de 10 metros del área de montaje. Consumo eficiente menor a 15A.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#7A8E77]/15 text-[#3C4A3C] flex items-center justify-center font-bold mb-3">
              📐
            </div>
            <h4 className="font-bold text-xs text-[#3C4A3C] mb-1">Dimensiones</h4>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              Superficie plana mínima de 2.00m de ancho × 1.50m de fondo. Apto para salones, quintas y jardines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#7A8E77]/15 text-[#3C4A3C] flex items-center justify-center font-bold mb-3">
              ⏱️
            </div>
            <h4 className="font-bold text-xs text-[#3C4A3C] mb-1">Puntualidad de Montaje</h4>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              Llegada del equipo 60 a 90 minutos antes del inicio. Desmontaje en 45 minutos al terminar el servicio.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#7A8E77]/15 text-[#3C4A3C] flex items-center justify-center font-bold mb-3">
              ✨
            </div>
            <h4 className="font-bold text-xs text-[#3C4A3C] mb-1">Charms & Toldos Riviera</h4>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              Montaje integrado de sombrillas Riviera, mesas altas, taburetes y estación interactiva de dijs ($1/pz).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: PREGUNTAS FRECUENTES (FAQ) */}
      <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#E6DFD4] shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B69C76]">
            Respuestas Claras para Anfitriones
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#3C4A3C] font-editorial mt-1">
            Preguntas Frecuentes
          </h3>
          <p className="text-xs text-[#6A7869] mt-2">
            Todo lo que necesitas saber para coordinar la experiencia sensorial de ICHIN en tu evento.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {[
            {
              q: '¿Qué requerimientos técnicos necesita el carrito en la locación?',
              a: 'Solo requerimos una toma de corriente estándar de 110V y un espacio plano de al menos 2.0 x 1.5 metros. Si tu evento es al aire libre, nuestro equipo cuenta con sombrillas Riviera y extensiones para exteriores para proteger la estación del sol.',
            },
            {
              q: '¿Cómo funciona la personalización de bebidas con Charms y Gemas a $1 por pieza?',
              a: 'Es una experiencia interactiva viral: cada invitado se acerca a la barra y recibe su bebida decorada con un dije coleccionable (ositos kawaii, fantasmitas spooky, motivos navideños, mini foodie, animalitos glow) o gemas 3D brillantes en su vaso. El dije se convierte en un recuerdo físico inolvidable de tu evento y solo cuesta $1 adicional por pieza.',
            },
            {
              q: '¿Cómo se coordina el servicio de toldos sombrilla Riviera y mesas altas?',
              a: 'Puedes agregarlo directamente en el cotizador en el Paso 3. Nuestro equipo logístico transporta, arma y desmonta las sombrillas de lona blanca con flecos chic, las mesas altas de cóctel y los taburetes blancos en tu terraza o jardín junto con la barra.',
            },
            {
              q: '¿Tienen opciones para invitados veganos o con intolerancia a la lactosa?',
              a: '¡Por supuesto! Todos nuestros paquetes incluyen leches vegetales prémium (avena barista, almendra y leche de coco) y leche deslactosada sin ningún recargo adicional. También disponemos de endulzantes naturales como miel pura y agave.',
            },
            {
              q: '¿Con cuánta anticipación debo reservar la fecha de mi evento en Caracas?',
              a: 'Recomendamos congelar la fecha con al menos 2 a 3 semanas de anticipación, especialmente para eventos en viernes, sábados o domingos, ya que mantenemos un límite de reservas por día para garantizar excelencia absoluta.',
            },
            {
              q: '¿Cuáles son los métodos de pago aceptados para confirmar la reserva?',
              a: 'Solicitamos un 50% de anticipo para apartar la fecha en nuestra agenda oficial, y el 50% restante el día del evento previo a la apertura de la barra. Aceptamos Zelle, Pago Móvil / Transferencia nacional en bolívares a tasa oficial del BCV, y efectivo en divisa.',
            },
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-[#E6DFD4] overflow-hidden transition-all bg-[#FAF8F4]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-[#F3EFE7] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#3C4A3C]">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#7A8E77] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-[#525B4F] leading-relaxed border-t border-[#E6DFD4]/60 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

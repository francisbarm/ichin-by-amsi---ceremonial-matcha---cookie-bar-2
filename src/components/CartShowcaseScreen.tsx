import React, { useState } from 'react';
import { Sparkles, Check, Heart, ShieldCheck, ArrowRight, Lightbulb, Droplets, Leaf, Eye } from 'lucide-react';
import { 
  MOTIVATIONAL_PHRASES, 
  PHRASE_CATEGORIES, 
  getPhrasesByCategory, 
  getRandomPhrase 
} from '../data/motivationalPhrases';

interface CartShowcaseScreenProps {
  onGoToQuoter: () => void;
  onGoToMenu: () => void;
}

interface Hotspot {
  id: string;
  title: string;
  tagline: string;
  x: number; // percentage
  y: number; // percentage
  description: string;
  icon: string;
}

export const CartShowcaseScreen: React.FC<CartShowcaseScreenProps> = ({
  onGoToQuoter,
  onGoToMenu,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string>('dispenser');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [customPhrase, setCustomPhrase] = useState<string>('GOOD HABITS, BETTER DAYS ♡');
  const [showcaseCategory, setShowcaseCategory] = useState<'all' | 'bodas' | 'corporativo' | 'cumpleanos' | 'wellness' | 'social' | 'graduacion'>('all');
  const [showcaseLang, setShowcaseLang] = useState<'all' | 'es' | 'en'>('all');

  const hotspots: Hotspot[] = [
    {
      id: 'canopy',
      title: 'Marquesina Ovalada con Aro LED Cálido',
      tagline: 'Iluminación cenital 2700K para resaltar el servicio de noche y tarde',
      x: 50,
      y: 13,
      icon: 'light',
      description:
        'Estructura oval suspendida en verde matcha salvia con perfil de iluminación perimetral cálida. Brinda un resplandor acogedor e hipnótico en jardines, salones y terrazas de Caracas.',
    },
    {
      id: 'sign-natural',
      title: 'Letrero: "Bebidas Naturales para Grandes Ideas"',
      tagline: 'Filosofía botánica y bienestar en cada evento',
      x: 12,
      y: 31,
      icon: 'sparkle',
      description:
        'Placa tipográfica lateral distintiva del carrito, recordando el poder energizante limpio del té verde ceremonial japonés para inspirar grandes momentos.',
    },
    {
      id: 'dispenser',
      title: 'Dispensador de Cristal Ceremonial',
      tagline: 'Matcha Uji continuo con grifo de acero inoxidable',
      x: 53,
      y: 44,
      icon: 'droplet',
      description:
        'Depósito de vidrio transparente sobre base de madera de roble con grifo antigoteo. Permite servir tragos de bienvenida "Welcome Matcha" al instante sin generar colas.',
    },
    {
      id: 'menu-board',
      title: 'Pizarra de Menú del Carrito',
      tagline: 'Opciones ceremoniales visibles para tus invitados',
      x: 69,
      y: 31,
      icon: 'list',
      description:
        'Panel tipográfico con listado de especialidades (Matcha Clásico, Latte Vainilla, Strawberry Matcha, Iced Latte y Selección de Bakery). Se puede adaptar con nombres conmemorativos para tu evento.',
    },
    {
      id: 'quote-gooddrinks',
      title: 'Placa: "Good Drinks, Brighter Days ♡"',
      tagline: 'Sello de optimismo y hospitalidad de lujo',
      x: 84,
      y: 38,
      icon: 'heart',
      description:
        'Frase icónica rotulada en caligrafía artesanal que decora el lateral del carrito y se convierte en el fondo fotográfico predilecto de los invitados.',
    },
    {
      id: 'chalkboard',
      title: 'Pizarra A-Frame Personalizable',
      tagline: '¡Personaliza tu evento con tus frases preferidas!',
      x: 17,
      y: 78,
      icon: 'chalk',
      description:
        'Caballete de madera con pizarra negra donde escribimos caligrafiadas tus frases favoritas, monogramas de boda o dedicatorias especiales ("Good Habits, Better Days").',
    },
    {
      id: 'fluted-body',
      title: 'Mueble Acanalado Verde Salvia & Rueda Halo',
      tagline: 'Diseño arquitectónico contemporáneo con luz de piso',
      x: 56,
      y: 74,
      icon: 'cart',
      description:
        'Frontal con relieve acanalado verde matcha, encimera blanca de cuarzo y rueda estilizada con aro de luz LED continuo. 100% móvil y autónomo.',
    },
  ];

  const currentSpot = hotspots.find((h) => h.id === activeHotspot) || hotspots[0];

  return (
    <div id="cart-showcase-container" className="py-6 sm:py-12 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE7] border border-[#E6DFD4] text-[#455546] text-xs font-bold uppercase tracking-wider mb-3">
          <Leaf className="w-3.5 h-3.5 text-[#7A8E77]" />
          <span>Ingeniería Estética & Hospitalidad Exclusiva</span>
        </div>

        <h1 
          id="cart-title"
          className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#3C4A3C] tracking-tight mb-2 font-editorial"
          style={{ letterSpacing: '-0.025em' }}
        >
          El Carrito Móvil ICHIN By AMSI
        </h1>

        <div className="inline-block text-sm sm:text-base font-bold text-[#B69C76] tracking-wider uppercase mb-3">
          “Bebidas Naturales para Grandes Ideas”
        </div>

        <p className="text-xs sm:text-base text-[#6A7869] font-normal leading-relaxed max-w-2xl mx-auto">
          Diseñado para transformar bodas, lanzamientos y celebraciones en Caracas en un santuario botánico de matcha ceremonial en vivo. Mueble artesanal con iluminación LED, baristas expertos y personalización total.
        </p>

        {/* Catchphrases pills from physical cart */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
          <span className="px-3.5 py-1.5 rounded-full bg-[#455546] text-white text-[11px] sm:text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
            "Bebidas Naturales para Grandes Ideas"
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E6DFD4] text-[#3C4A3C] text-[11px] sm:text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-[#B69C76]" />
            "Good Drinks, Brighter Days ♡"
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#FAF8F4] border border-[#E6DFD4] text-[#3C4A3C] text-[11px] sm:text-xs font-semibold tracking-wide flex items-center gap-1.5">
            <span>🪧</span>
            "Good Habits, Better Days ♡"
          </span>
        </div>
      </div>

      {/* Main Interactive Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-12">
        
        {/* Real Photography Stage with Hotspots (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-5 border border-[#E6DFD4] shadow-sm relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A8E77]">
              Fotografía Oficial del Carrito & Hotspots
            </span>
            <span className="text-[11px] text-[#6A7869] bg-[#F3EFE7] px-2.5 py-1 rounded-full font-medium">
              Toca los puntos dorados
            </span>
          </div>

          {/* Real Photo Canvas with Hotspot Overlays */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#E6DFD4] select-none shadow-inner bg-[#F3EFE7]">
            
            <img 
              src="/branding/cart-showcase.jpg" 
              alt="Carrito Insignia ICHIN By AMSI" 
              className="w-full h-full object-cover"
            />

            {/* Subtle Gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Interactive Hotspot Trigger Buttons */}
            {hotspots.map((spot) => {
              const isSelected = spot.id === activeHotspot;
              return (
                <button
                  key={spot.id}
                  id={`hotspot-${spot.id}`}
                  onClick={() => setActiveHotspot(spot.id)}
                  style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                  aria-label={spot.title}
                >
                  <span className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isSelected ? 'bg-[#B69C76]' : 'bg-[#7A8E77]'
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-6 w-6 sm:h-7 sm:w-7 items-center justify-center text-[11px] font-extrabold shadow-lg border-2 ${
                        isSelected
                          ? 'bg-[#455546] text-white border-[#B69C76]'
                          : 'bg-white text-[#455546] border-[#455546]'
                      }`}
                    >
                      {spot.id === 'dispenser' ? '🍵' : spot.id === 'chalkboard' ? '✎' : '✦'}
                    </span>
                  </span>
                </button>
              );
            })}

          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#6A7869] px-1">
            <span>Solo para bodas, activaciones de marca y eventos privados en Caracas</span>
            <span className="font-semibold text-[#455546]">100% Autónomo</span>
          </div>

        </div>

        {/* Hotspot Detailed Information Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Active Highlight Info */}
          <div 
            id="hotspot-detail-card"
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#B69C76]/50 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7A8E77]/10 rounded-bl-full pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B69C76]/20 text-[#6C5430] text-[10px] font-extrabold uppercase tracking-wider">
                Detalle Seleccionado
              </span>
              <span className="text-xs text-[#6A7869]">
                {hotspots.findIndex((h) => h.id === activeHotspot) + 1} de {hotspots.length}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#3C4A3C] mb-1 font-editorial">
              {currentSpot.title}
            </h3>

            <p className="text-xs font-semibold text-[#6C5430] mb-2.5">
              {currentSpot.tagline}
            </p>

            <p className="text-xs sm:text-sm text-[#6A7869] leading-relaxed mb-4">
              {currentSpot.description}
            </p>

            {/* Feature bullets */}
            <div className="bg-[#FAF8F4] rounded-2xl p-3.5 border border-[#E6DFD4] mb-4">
              <div className="text-xs font-bold text-[#3C4A3C] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#7A8E77]" />
                <span>Ventajas en Locación</span>
              </div>
              <ul className="text-xs text-[#6A7869] space-y-1">
                <li>• No requiere obras ni instalaciones fijas en la locación.</li>
                <li>• Tiempo de montaje: 45 minutos antes de la llegada de invitados.</li>
                <li>• Ruedas engomadas de alta amortiguación para proteger suelos delicados.</li>
              </ul>
            </div>

            {/* Quick switcher buttons */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E6DFD4]">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setActiveHotspot(h.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeHotspot === h.id
                      ? 'bg-[#455546] text-white'
                      : 'bg-[#F3EFE7] text-[#4A5A4B] hover:bg-[#EAE4D8]'
                  }`}
                >
                  {h.title.split(' ')[0]} {h.title.split(' ')[1]}
                </button>
              ))}
            </div>

          </div>

          {/* Cart Specifications Grid */}
          <div className="bg-[#F3EFE7]/90 rounded-3xl p-5 sm:p-6 border border-[#E6DFD4]">
            <h4 className="text-xs font-bold text-[#3C4A3C] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7A8E77]" />
              <span>Ficha Técnica & Requerimientos</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#E6DFD4]">
                <span className="text-[#7A8E77] block text-[9px] uppercase font-bold">Dimensiones</span>
                <span className="font-semibold text-[#3C4A3C]">1.80m largo × 0.85m</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#E6DFD4]">
                <span className="text-[#7A8E77] block text-[9px] uppercase font-bold">Altura Total</span>
                <span className="font-semibold text-[#3C4A3C]">2.10m con marquesina</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#E6DFD4]">
                <span className="text-[#7A8E77] block text-[9px] uppercase font-bold">Energía Eléctrica</span>
                <span className="font-semibold text-[#3C4A3C]">110V estándar (o batería)</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#E6DFD4]">
                <span className="text-[#7A8E77] block text-[9px] uppercase font-bold">Capacidad</span>
                <span className="font-semibold text-[#3C4A3C]">Hasta 250 tazas/hora</span>
              </div>
            </div>

            {/* Direct Quoting Trigger Button */}
            <div className="mt-4">
              <button
                id="showcase-quote-btn"
                onClick={onGoToQuoter}
                className="w-full py-3 px-5 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Cotizar Carrito para mi Evento</span>
                <ArrowRight className="w-4 h-4 text-[#D4BE9B]" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION: PERSONALIZA TU EVENTO CON TUS FRASES PREFERIDAS */}
      <div className="bg-[#FAF8F4] rounded-3xl p-5 sm:p-8 border border-[#E6DFD4] shadow-sm mb-12">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#455546]/10 text-[#455546] text-xs font-bold uppercase tracking-wider mb-2">
            <span>✎ Personalización Exclusiva</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#3C4A3C] font-editorial">
            Personaliza tu Evento con tus Frases Preferidas
          </h2>
          <p className="text-xs sm:text-sm text-[#6A7869] mt-2">
            El carrito incluye pizarras de madera y caballetes donde escribimos a mano tus frases favoritas, monogramas de boda o la bienvenida para tus invitados.
          </p>
        </div>

        {/* Live Phrase Input & Categorized Bilingual Presets */}
        <div className="max-w-3xl mx-auto mb-8 bg-white p-4 sm:p-6 rounded-3xl border border-[#E6DFD4] shadow-sm space-y-4">
          <div className="text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3C4A3C] mb-1">
              Prueba en tiempo real cómo lucirá tu frase en la pizarra del carrito:
            </label>
            <p className="text-[11px] text-[#6A7869]">
              Escribe lo que desees o explora nuestras frases motivacionales recomendadas por tipo de evento en <strong>Español e Inglés</strong>:
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="Escribe aquí tu frase (ej. GOOD HABITS, BETTER DAYS ♡)"
              className="w-full py-3 px-4 pr-10 rounded-2xl bg-[#FAF8F4] border-2 border-[#7A8E77] text-[#3C4A3C] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#455546] text-center"
            />
            {customPhrase && (
              <button
                type="button"
                onClick={() => setCustomPhrase('')}
                className="absolute right-3 top-3 text-sm text-[#9BB098] hover:text-[#455546]"
                title="Limpiar"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: Language Selector & Randomizer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E6DFD4]">
            {/* Language filter */}
            <div className="flex items-center gap-1 bg-[#FAF8F4] p-1 rounded-xl border border-[#E6DFD4]">
              <button
                type="button"
                onClick={() => setShowcaseLang('all')}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                  showcaseLang === 'all'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'text-[#525B4F] hover:text-[#3C4A3C]'
                }`}
              >
                🌐 Ambos
              </button>
              <button
                type="button"
                onClick={() => setShowcaseLang('es')}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                  showcaseLang === 'es'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'text-[#525B4F] hover:text-[#3C4A3C]'
                }`}
              >
                🇪🇸 Español
              </button>
              <button
                type="button"
                onClick={() => setShowcaseLang('en')}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                  showcaseLang === 'en'
                    ? 'bg-[#455546] text-white shadow-xs'
                    : 'text-[#525B4F] hover:text-[#3C4A3C]'
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Randomizer */}
            <button
              type="button"
              onClick={() => {
                const rnd = getRandomPhrase(showcaseCategory, showcaseLang);
                setCustomPhrase(rnd.phrase);
              }}
              className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-[#EDE7DC] hover:bg-[#D4C4AA]/70 text-[#3C4A3C] border border-[#D4C4AA] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>🎲</span>
              <span>Probar Frase Aleatoria</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {PHRASE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setShowcaseCategory(cat.id as any)}
                className={`text-[11px] px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-1 ${
                  showcaseCategory === cat.id
                    ? 'bg-[#7A8E77] text-white shadow-xs font-bold'
                    : 'bg-[#FAF8F4] text-[#525B4F] border border-[#E6DFD4] hover:bg-[#F3EFE7]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{showcaseLang === 'en' ? cat.labelEn : cat.labelEs}</span>
              </button>
            ))}
          </div>

          {/* Horizontal scrollable pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-h-36 overflow-y-auto p-2 bg-[#FAF8F4] rounded-2xl border border-[#E6DFD4]">
            {getPhrasesByCategory(showcaseCategory, showcaseLang).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCustomPhrase(item.phrase)}
                className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  customPhrase === item.phrase
                    ? 'bg-[#455546] text-white border-[#455546] font-bold shadow-xs'
                    : 'bg-white text-[#525B4F] border-[#E6DFD4] hover:border-[#7A8E77] hover:bg-[#F8F6F0]'
                }`}
              >
                <span>{item.icon}</span>
                <span>"{item.phrase}"</span>
                <span className={`text-[8px] px-1 rounded uppercase font-bold ${
                  customPhrase === item.phrase ? 'bg-white/20 text-white' : 'bg-[#FAF8F4] text-[#7A8E77]'
                }`}>
                  {item.lang}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Realistic Wooden Chalkboard & Signboard Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Simulated A-Frame Chalkboard */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#EDE7DC] border-4 border-[#D4C4AA] shadow-md flex flex-col items-center">
            <div className="text-[10px] font-bold text-[#6A7869] uppercase tracking-wider mb-2">
              Pizarra Caballete A-Frame de Entrada
            </div>
            <div className="w-full max-w-xs aspect-[3/4] bg-[#222822] rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-inner border-4 border-[#3D473D] relative overflow-hidden">
              <div className="absolute top-3 w-8 h-1 bg-[#888]/40 rounded-full"></div>
              <p className="text-[#FAF8F4] font-serif text-lg sm:text-xl font-bold tracking-widest leading-relaxed drop-shadow-sm uppercase">
                {customPhrase || 'TU FRASE AQUÍ ♡'}
              </p>
              <div className="mt-4 text-[#D4BE9B] text-xs tracking-widest">
                ICHIN BY AMSI
              </div>
            </div>
            <span className="text-[11px] text-[#7A8E77] mt-3 italic text-center">
              Incluido en todos nuestros paquetes de eventos
            </span>
          </div>

          {/* Cart Menu Signboard */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E6DFD4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#7A8E77] uppercase tracking-wider mb-2">
                Menú en Barra & Bebidas
              </div>
              <div className="bg-[#FAF8F4] p-4 rounded-xl border border-[#E6DFD4] mb-3">
                <div className="text-center font-bold text-[#3C4A3C] text-sm border-b border-[#E6DFD4] pb-2 mb-2 font-editorial">
                  {customPhrase || 'GOOD DRINKS, BRIGHTER DAYS ♡'}
                </div>
                <div className="space-y-1.5 text-xs text-[#4A5A4B]">
                  <div className="flex justify-between">
                    <span>Matcha Clásico Frío</span>
                    <span className="font-semibold text-[#7A8E77]">Ceremonial Kioto</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matcha Latte Vainilla</span>
                    <span className="font-semibold text-[#7A8E77]">Vainilla Natural</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strawberry Matcha (Fresa)</span>
                    <span className="font-semibold text-[#7A8E77]">Fresa Macerada</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cookies & Dulces Finos</span>
                    <span className="font-semibold text-[#7A8E77]">Horneadas al Día</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#6A7869]">
                Tus invitados disfrutarán de servicio continuo batido al instante frente a ellos con chasen de bambú.
              </p>
            </div>

            <button
              onClick={onGoToQuoter}
              className="mt-4 w-full py-2.5 px-4 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#384639] transition-all"
            >
              Configurar mi frase en el cotizador
            </button>
          </div>
        </div>

        {/* Curated Bilingual Event Signage Gallery */}
        <div className="mt-8 pt-8 border-t border-[#E6DFD4]">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8E77] bg-white px-3 py-1 rounded-full border border-[#D4C4AA]">
              Inspiración para tu Evento
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#3C4A3C] mt-2 font-editorial">
              Frases Más Solicitadas por Tipo de Celebración
            </h3>
            <p className="text-xs text-[#6A7869] mt-1">
              Haz clic en cualquiera de estas frases en español o inglés para verla en la pizarra en tiempo real:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: '💍',
                category: 'Bodas & Compromisos',
                categoryEn: 'Weddings & Romance',
                phraseEs: 'El amor es la mejor pausa del día ♡',
                phraseEn: 'All you need is love & ceremonial matcha ♡',
                tag: 'Boda / Wedding',
              },
              {
                icon: '💡',
                category: 'Corporativo & Tech',
                categoryEn: 'Corporate & Focus',
                phraseEs: 'BEBIDAS NATURALES PARA GRANDES IDEAS 💡',
                phraseEn: 'NATURAL DRINKS FOR BRIGHT MINDS 💡',
                tag: 'Brand Activation',
              },
              {
                icon: '🎂',
                category: 'Cumpleaños VIP',
                categoryEn: 'Birthdays & Parties',
                phraseEs: 'Celebrar la vida es el mejor hábito 🥂',
                phraseEn: 'Cheers to another year of glowing brighter ✨',
                tag: 'Fiesta Privada',
              },
              {
                icon: '🧘',
                category: 'Bienestar & Zen',
                categoryEn: 'Wellness & Mindfulness',
                phraseEs: 'Pausa consciente, mente en calma 🌿',
                phraseEn: 'Peace of mind in every single sip 🌿',
                tag: 'Retiros & Yoga',
              },
              {
                icon: '🌸',
                category: 'Brunch & Social',
                categoryEn: 'Brunch & Friends',
                phraseEs: 'El matcha nos une, la amistad nos llena ♡',
                phraseEn: 'Matcha made in heaven with best friends ♡',
                tag: 'Baby & Bridal Shower',
              },
              {
                icon: '🎓',
                category: 'Graduación & Éxito',
                categoryEn: 'Milestones & Success',
                phraseEs: 'El esfuerzo de hoy es el triunfo de mañana ✨',
                phraseEn: 'The future belongs to those who believe in dreams 🎓',
                tag: 'Celebración de Logros',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-[#E6DFD4] shadow-xs hover:border-[#7A8E77] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{card.icon}</span>
                      <span className="text-xs font-bold text-[#3C4A3C]">{card.category}</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#7A8E77] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E6DFD4]">
                      {card.tag}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8C988B] mb-2">{card.categoryEn}</div>

                  {/* ES Phrase */}
                  <div className="p-2 rounded-xl bg-[#FAF8F4] border border-[#E6DFD4] mb-2">
                    <div className="text-[9px] font-bold text-[#7A8E77] uppercase flex items-center justify-between mb-0.5">
                      <span>🇪🇸 Español</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPhrase(card.phraseEs);
                          window.scrollTo({ top: 900, behavior: 'smooth' });
                        }}
                        className="text-[9px] text-[#455546] font-bold underline hover:text-[#7A8E77]"
                      >
                        Aplicar
                      </button>
                    </div>
                    <p className="text-[11px] font-serif text-[#3C4A3C] italic font-semibold">
                      "{card.phraseEs}"
                    </p>
                  </div>

                  {/* EN Phrase */}
                  <div className="p-2 rounded-xl bg-[#FAF8F4] border border-[#E6DFD4]">
                    <div className="text-[9px] font-bold text-[#7A8E77] uppercase flex items-center justify-between mb-0.5">
                      <span>🇺🇸 English</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPhrase(card.phraseEn);
                          window.scrollTo({ top: 900, behavior: 'smooth' });
                        }}
                        className="text-[9px] text-[#455546] font-bold underline hover:text-[#7A8E77]"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[11px] font-serif text-[#3C4A3C] italic font-semibold">
                      "{card.phraseEn}"
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-[#E6DFD4]">
                  <span className="text-[10px] text-[#6A7869]">Rotulada a mano en tiza</span>
                  <span className="text-[10px] font-bold text-[#455546]">Gratis en tu paquete</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: SERVICIO EN VASOS PET CRISTALINOS & VASOS PERSONALIZADOS */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E6DFD4] shadow-sm mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#7A8E77]/15 text-[#455546] text-[10px] font-bold uppercase tracking-wider">
              Protocolo & Presentación en Eventos
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3C4A3C] mt-1.5 font-editorial">
              Servicio en Vasos PET Cristalinos & Vasos Personalizados
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#5C705A] bg-[#FAF8F4] px-3 py-1.5 rounded-full border border-[#E6DFD4]">
            100% Seguro para Bodas & Fiestas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#455546] text-white flex items-center justify-center text-base mb-3">
              🛡️
            </div>
            <h3 className="font-bold text-sm text-[#3C4A3C] mb-1">Cero Vidrio por Seguridad</h3>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              En eventos no se sirve en vidrio para evitar accidentes y roturas en pista de baile y áreas verdes. Servimos exclusivamente en vasos plásticos PET cristalinos ultra-resistentes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#B69C76] text-white flex items-center justify-center text-base mb-3">
              ✨
            </div>
            <h3 className="font-bold text-sm text-[#3C4A3C] mb-1">Vasos Personalizados VIP</h3>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              Podemos personalizar los vasos con el monograma de tu boda, iniciales, logo o la frase que elijas. Los invitados se llevarán un recuerdo exclusivo de tu celebración.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
            <div className="w-9 h-9 rounded-xl bg-[#7A8E77] text-white flex items-center justify-center text-base mb-3">
              🍸
            </div>
            <h3 className="font-bold text-sm text-[#3C4A3C] mb-1">Cristalería Solo a Solicitud</h3>
            <p className="text-xs text-[#6A7869] leading-relaxed">
              Si tu evento cuenta con protocolo formal de mesa y requieres cristalería de vidrio tradicional, podemos habilitarla únicamente previa solicitud y coordinación logística.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: MOBILIARIO DE TERRAZA & TOLDOS LOUNGE */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E6DFD4] shadow-sm mb-12 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#B69C76]/15 text-[#8C6D3F] text-[10px] font-bold uppercase tracking-wider">
              Nuevo Servicio Complementario • Caracas
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3C4A3C] mt-1.5 font-editorial">
              Mobiliario de Terraza, Toldos Riviera & Mesas Altas
            </h2>
          </div>
          <button
            onClick={onGoToQuoter}
            className="py-2 px-5 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#384639] transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <span>Cotizar con Mobiliario</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4BE9B]" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Photo with Lightbox Trigger */}
          <div 
            onClick={() => setLightboxImage('/branding/mobiliario-toldos-terrazas-vip.jpg')}
            className="lg:col-span-7 group relative rounded-2xl overflow-hidden aspect-[16/10] border border-[#E6DFD4] cursor-pointer shadow-md"
          >
            <img 
              src="/branding/mobiliario-toldos-terrazas-vip.jpg" 
              alt="Montaje de Terraza con Toldos Sombrilla y Mesas Altas con vista al Ávila" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B] tracking-widest">Terraza & Mirador Caracas</span>
              <span className="text-white text-base sm:text-lg font-bold">Montaje Riviera Chic frente al Ávila</span>
              <span className="text-white/80 text-xs mt-1">Haz clic para ampliar la fotografía</span>
            </div>
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#D4BE9B]" />
              <span>Ver Foto</span>
            </div>
          </div>

          {/* Feature List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
              <div className="font-bold text-xs text-[#3C4A3C] flex items-center gap-2 mb-1">
                <span>⛱️</span>
                <span>Toldos Sombrilla Riviera</span>
              </div>
              <p className="text-xs text-[#6A7869] leading-relaxed">
                Sombrillas de lona blanca con flecos bohemios de diseño resort. Protegen del sol en exteriores y brindan una estética impecable para fotos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
              <div className="font-bold text-xs text-[#3C4A3C] flex items-center gap-2 mb-1">
                <span>🥂</span>
                <span>Mesas Altas Cocteleras & Taburetes</span>
              </div>
              <p className="text-xs text-[#6A7869] leading-relaxed">
                Estaciones de pie con taburetes altos blancos para degustar matcha y galletas mientras los invitados conversan dinámicamente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6DFD4]">
              <div className="font-bold text-xs text-[#3C4A3C] flex items-center gap-2 mb-1">
                <span>✨</span>
                <span>Salas Lounge & Mesas Bajas</span>
              </div>
              <p className="text-xs text-[#6A7869] leading-relaxed">
                Mesas circulares con sillas medallón blancas y esferas cromadas plateadas para ambientar miradores y jardines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: BARRA DE CHARMS, DIJES Y GEMAS PERSONALIZADAS ($1 / PIEZA) */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E6DFD4] shadow-sm mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B69C76]/15 text-[#3C4A3C] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#B69C76]/25">
              <span>✨</span>
              <span>Tendencia Viral en Caracas • $1 por pieza</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-[#3C4A3C] font-editorial">
              Barra de Charms, Dijs & Gemas para Vasos
            </h3>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <button
              onClick={onGoToQuoter}
              className="py-2.5 px-5 rounded-full bg-[#455546] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#384639] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Cotizar con Charms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#525B4F] max-w-3xl mb-6 leading-relaxed">
          Transforma cada bebida en una pieza interactiva de diseño. Tus invitados eligen dijs coleccionables en mini elásticas para el vaso o aplican gemas de cristal 3D como distintivo personalizado y recuerdo para llevar a casa.
        </p>

        {/* Gallery of Charms Collections */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-ositos-kawaii.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-ositos-kawaii.jpg" 
              alt="Charms Ositos Kawaii y Bear Hug" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Bodas & Cumpleaños</span>
              <span className="text-white text-xs font-semibold">Colección Ositos & Bear Hug</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-halloween-fantasmitas.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-halloween-fantasmitas.jpg" 
              alt="Fantasmitas Spooky Cute" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Edición Halloween</span>
              <span className="text-white text-xs font-semibold">Fantasmitas Spooky Cute</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-navidad-festivo.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-navidad-festivo.jpg" 
              alt="Colección Navideña" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Temporada Decembrina</span>
              <span className="text-white text-xs font-semibold">Navidad & Figuras Festivas</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-gemas-cristales.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-gemas-cristales.jpg" 
              alt="Gemas y Cristales 3D" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Bling & Estilo</span>
              <span className="text-white text-xs font-semibold">Gemas 3D & Cristales Adhesivos</span>
            </div>
          </div>
        </div>

        {/* Secondary Charm Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-mini-foodie.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-mini-foodie.jpg" 
              alt="Mini Foodie y Boba" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Mystery Bags</span>
              <span className="text-white text-xs font-semibold">Mini Foodie & Donuts</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-glow-animals.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-glow-animals.jpg" 
              alt="Glow in the Dark Animals" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Efecto Nocturno</span>
              <span className="text-white text-xs font-semibold">Animalitos Fluorescentes</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/charms/charms-gummy-bears-cristal.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/charms-gummy-bears-cristal.jpg" 
              alt="Gummy Bears Cristalinos" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Color Pop</span>
              <span className="text-white text-xs font-semibold">Ositos Gummy Cristal</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/charms/bakery-toppers-calabaza.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img 
              src="/branding/charms/bakery-toppers-calabaza.jpg" 
              alt="Toppers de Calabaza Pastelería" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Bakery & Cupcakes</span>
              <span className="text-white text-xs font-semibold">Toppers Calabazas de Otoño</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-world events photo showcase banner with user's official photographs */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E6DFD4] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B69C76]">
              Galería Editorial Oficial
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#3C4A3C] font-editorial">
              Experiencias Reales con ICHIN By AMSI
            </h3>
          </div>
          <p className="text-xs text-[#6A7869] max-w-md mt-1 md:mt-0">
            Fotografía de alta gama capturada en bodas, torneos, activaciones y pop-ups privados en Caracas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setLightboxImage('/branding/cart-lifestyle.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img
              src="/branding/cart-lifestyle.jpg"
              alt="Lifestyle en Evento Caracas"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Eventos en Locación</span>
              <span className="text-white text-sm font-semibold">El Carrito en Vivo & Amigos</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/cups-collection.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img
              src="/branding/cups-collection.jpg"
              alt="Colección de Vasos"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Merchandising & Vasos</span>
              <span className="text-white text-sm font-semibold">Vasos Monogramados con Sello</span>
            </div>
          </div>

          <div 
            onClick={() => setLightboxImage('/branding/cookies-packaging.jpg')}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#E6DFD4] cursor-pointer"
          >
            <img
              src="/branding/cookies-packaging.jpg"
              alt="Packaging de Cookies"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] uppercase font-bold text-[#D4BE9B]">Bakery Artesanal</span>
              <span className="text-white text-sm font-semibold">Cookies & Dulces Finos</span>
            </div>
          </div>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2 text-sm font-bold flex items-center gap-1"
            >
              ✕ Cerrar
            </button>
            <img 
              src={lightboxImage} 
              alt="Detalle en grande" 
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
};

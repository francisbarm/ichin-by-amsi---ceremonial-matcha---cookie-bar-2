import React, { useState } from 'react';
import { MenuItem, OrderCustomization } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { MenuCustomizationModal } from './MenuCustomizationModal';
import { PackageRecommenderModal } from './PackageRecommenderModal';
import { Sparkles, Plus, SlidersHorizontal, Heart, Leaf, Coffee, Calculator, ArrowRight, CheckCircle2, Shield, Eye } from 'lucide-react';

interface MenuScreenProps {
  onAddToCart: (item: MenuItem, quantity: number, customization?: OrderCustomization) => void;
  onOpenCart: () => void;
  cartCount: number;
  onGoToQuoterWithPackage?: (packageId: string, guests: number, eventType: string) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  onAddToCart,
  onOpenCart,
  cartCount,
  onGoToQuoterWithPackage,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'matcha' | 'specials' | 'cookies'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);
  const [activeBrandingImage, setActiveBrandingImage] = useState<string | null>(null);

  // Filter items
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.category === 'cookies') {
      // Cookies can be quick-added directly
      onAddToCart(item, 1);
    } else {
      // Drinks open customization to choose milk & sweetness
      setSelectedItemForModal(item);
    }
  };

  const handleApplyRecommendation = (packageId: string, guestCount: number, eventType: string) => {
    if (onGoToQuoterWithPackage) {
      onGoToQuoterWithPackage(packageId, guestCount, eventType);
    }
  };

  return (
    <div id="menu-screen-container" className="py-4 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Renovated Editorial Hero Banner — Soft Sage & Wabi-Sabi Oat */}
      <div 
        id="menu-hero-card"
        className="relative rounded-3xl bg-[#455546] text-[#FAF8F4] p-5 sm:p-10 mb-8 overflow-hidden shadow-lg border border-[#556756]"
      >
        {/* Organic ambient light accents inspired by the Matcha Station reference */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#8FA28C]/25 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#C8AF8A]/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Main Hero Copy (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4BE9B] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4BE9B]" />
              <span>Barra Móvil Ceremonial para Eventos Exclusivos</span>
            </div>

            <h1 
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 font-editorial"
              style={{ letterSpacing: '-0.025em' }}
            >
              Bebidas Naturales para Grandes Ideas
            </h1>

            <p className="text-xs sm:text-base text-[#FAF8F4]/90 font-normal leading-relaxed mb-5 max-w-xl">
              Matcha ceremonial japonés de primera cosecha batido al momento con chasen de bambú, selección de pastelería fina, bombones artesanales y galletas horneadas al día. Llevamos nuestro carrito insignia a bodas, lanzamientos de marca y celebraciones VIP en Caracas.
            </p>

            {/* Quick stats / trust chips */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-[#FAF8F4]/90 font-medium pt-3 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-[#9CB098]" />
                100% Ceremonial Uji
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#D4BE9B]" />
                Avena, Almendra, Coco, Descremada
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#D4BE9B]" />
                Bakery & Chocolates Finos
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <span>🛡️</span>
                Vasos PET Cristalinos (Cero Vidrio)
              </span>
            </div>
          </div>

          {/* Interactive Recommender & Visual Showcase Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            
            {/* Real Cart / Aesthetic Photo Card */}
            <div 
              onClick={() => setActiveBrandingImage('/branding/matcha-station-aesthetic.jpg')}
              className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/20 shadow-md group cursor-pointer"
            >
              <img 
                src="/branding/matcha-station-aesthetic.jpg" 
                alt="Estación Ceremonial Matcha Station" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#D4BE9B] tracking-widest block">
                      Estación Ceremonial ICHIN
                    </span>
                    <span className="text-white text-xs font-bold leading-tight">
                      “Matcha Station • Pura Serenidad Japonesa”
                    </span>
                  </div>
                  <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Actionable Event Calculator Card */}
            <div className="bg-[#FAF8F4] text-[#3C4A3C] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DFD4] relative">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#687C67]">
                  <Calculator className="w-3.5 h-3.5" />
                  Calculadora de Eventos
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#B69C76]/20 text-[#455546] border border-[#B69C76]/40">
                  Catering Caracas
                </span>
              </div>
              <h3 className="font-editorial text-base sm:text-lg font-bold text-[#3C4A3C] mb-1 leading-snug">
                ¿Planeas una boda o activación de marca?
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6A7869] mb-3 leading-relaxed">
                Bebidas ceremoniales y repostería fina con carrito artesanal e iluminación para tus invitados.
              </p>
              <button
                id="hero-open-recommender-btn"
                type="button"
                onClick={() => setIsRecommenderOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#455546] text-[#FAF8F4] text-xs font-bold hover:bg-[#384639] transition-all shadow-sm active:scale-98"
              >
                <span>Calcular Paquete Recomendado</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4BE9B]" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Value Proposition Highlights Bar */}
      <div 
        id="value-proposition-strip"
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 text-xs text-[#4A5A4B]"
      >
        <div className="flex items-center gap-3 bg-white/85 p-3.5 rounded-2xl border border-[#E6DFD4] shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#7A8E77]/15 text-[#5C705A] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#3C4A3C]">Matcha Uji Auténtico</div>
            <div className="text-[#6A7869] text-[11px]">Batido con chasen de bambú frente a tus invitados</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/85 p-3.5 rounded-2xl border border-[#E6DFD4] shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#B69C76]/15 text-[#8F7450] flex items-center justify-center flex-shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#3C4A3C]">Cookies & Chocolates Finos</div>
            <div className="text-[#6A7869] text-[11px]">Horneados al día con dulce de leche, trufas y bombones</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/85 p-3.5 rounded-2xl border border-[#E6DFD4] shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#455546]/10 text-[#455546] flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#3C4A3C]">Solo Eventos & Catering</div>
            <div className="text-[#6A7869] text-[11px]">Exclusivo para eventos privados, bodas y marcas</div>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            id="cat-all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-[#455546] text-white shadow-xs'
                : 'bg-white text-[#4A5A4B] border border-[#E6DFD4] hover:border-[#7A8E77]'
            }`}
          >
            Todos los Productos
          </button>

          <button
            id="cat-matcha"
            onClick={() => setActiveCategory('matcha')}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all ${
              activeCategory === 'matcha'
                ? 'bg-[#455546] text-white shadow-xs'
                : 'bg-white text-[#4A5A4B] border border-[#E6DFD4] hover:border-[#7A8E77]'
            }`}
          >
            Bebidas Matcha
          </button>

          <button
            id="cat-specials"
            onClick={() => setActiveCategory('specials')}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all ${
              activeCategory === 'specials'
                ? 'bg-[#455546] text-white shadow-xs'
                : 'bg-white text-[#4A5A4B] border border-[#E6DFD4] hover:border-[#7A8E77]'
            }`}
          >
            Especialidades de Barra
          </button>

          <button
            id="cat-cookies"
            onClick={() => setActiveCategory('cookies')}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all ${
              activeCategory === 'cookies'
                ? 'bg-[#455546] text-white shadow-xs'
                : 'bg-white text-[#4A5A4B] border border-[#E6DFD4] hover:border-[#7A8E77]'
            }`}
          >
            Bakery & Dulces de Autor
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px]">
          <input
            id="search-menu-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar matcha, cookie, dulce..."
            className="w-full pl-3.5 pr-8 py-2 text-xs bg-white border border-[#E6DFD4] rounded-full focus:outline-none focus:border-[#7A8E77] shadow-2xs text-[#3C4A3C]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Menu Cards Grid */}
      <div id="menu-items-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`menu-card-${item.id}`}
            onClick={() => setSelectedItemForModal(item)}
            className="group bg-white rounded-3xl border border-[#E6DFD4] p-4 flex flex-col justify-between hover:shadow-md hover:border-[#7A8E77] transition-all cursor-pointer relative"
          >
            {/* Badges */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
              {item.isSignature && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#B69C76] text-white text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                  Firma ICHIN
                </span>
              )}
              {item.isPopular && !item.isSignature && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#455546] text-white text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                  Favorito de Barra
                </span>
              )}
            </div>

            {/* Image Box */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F3EFE7] mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-base text-[#3C4A3C] leading-snug group-hover:text-[#2A362A]">
                  {item.name}
                </h3>
                <span className="text-[10px] font-bold text-[#5C705A] bg-[#FAF8F4] border border-[#E6DFD4] px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                  Para Eventos
                </span>
              </div>

              <p className="text-xs text-[#6A7869] font-normal leading-relaxed line-clamp-2 mb-3">
                {item.description}
              </p>

              {/* Specs Pill */}
              <div className="mt-auto flex items-center justify-between text-[10px] text-[#829081] border-t border-[#F3EFE7] pt-3">
                <span>{item.calories || 'Artesanal'}</span>
                <span className="font-semibold text-[#455546]">
                  {item.category === 'cookies' ? 'Horneado Diario AMSI' : 'Uji Ceremonial'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                id={`btn-customize-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemForModal(item);
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[#F3EFE7] text-[#455546] hover:bg-[#EAE4D8] transition-all text-xs font-semibold flex items-center justify-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Personalizar</span>
              </button>

              <button
                id={`btn-quickadd-${item.id}`}
                onClick={(e) => handleQuickAdd(item, e)}
                className="w-9 h-9 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all flex items-center justify-center shadow-xs active:scale-90"
                aria-label={`Agregar ${item.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Official Branding & High-End Photography Gallery Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E6DFD4] shadow-sm mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE7] border border-[#E6DFD4] text-[#455546] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-[#B69C76]" />
              <span>Identidad Visual & Packaging Oficial</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3C4A3C] font-editorial">
              Universo de Marca ICHIN By AMSI
            </h2>
          </div>
          <p className="text-xs text-[#6A7869] max-w-md mt-1 md:mt-0">
            Cada elemento, vaso, empaque y montaje ceremonial ha sido concebido bajo un estándar de hospitalidad estética serena.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Matcha Station Aesthetic Reference */}
          <div 
            onClick={() => setActiveBrandingImage('/branding/matcha-station-aesthetic.jpg')}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E6DFD4] bg-[#FAF8F4] flex flex-col hover:border-[#7A8E77] transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src="/branding/matcha-station-aesthetic.jpg" 
                alt="Matcha Station Ceremonial" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-bold text-[#B69C76] uppercase tracking-wider">Estética Ceremonial</div>
              <div className="font-bold text-xs text-[#3C4A3C]">Matcha Station Minimal</div>
              <p className="text-[11px] text-[#6A7869] mt-0.5 line-clamp-1">Chasen de bambú, cerámica gres y tonos suaves</p>
            </div>
          </div>

          {/* Card 2: Cups Collection */}
          <div 
            onClick={() => setActiveBrandingImage('/branding/cups-collection.jpg')}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E6DFD4] bg-[#FAF8F4] flex flex-col hover:border-[#7A8E77] transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src="/branding/cups-collection.jpg" 
                alt="Colección Oficial de Vasos" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-bold text-[#B69C76] uppercase tracking-wider">Colección de Vasos</div>
              <div className="font-bold text-xs text-[#3C4A3C]">Vasos & Lemas para Eventos</div>
              <p className="text-[11px] text-[#6A7869] mt-0.5 line-clamp-1">"Modo ICHIN", "Matcha &gt; Drama", "Pausa. Respira."</p>
            </div>
          </div>

          {/* Card 3: Cookies & Packaging */}
          <div 
            onClick={() => setActiveBrandingImage('/branding/cookies-packaging.jpg')}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E6DFD4] bg-[#FAF8F4] flex flex-col hover:border-[#7A8E77] transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src="/branding/cookies-packaging.jpg" 
                alt="Packaging de Cookies AMSI" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-bold text-[#B69C76] uppercase tracking-wider">Packaging AMSI</div>
              <div className="font-bold text-xs text-[#3C4A3C]">Cajas & Sleeves de Cookies</div>
              <p className="text-[11px] text-[#6A7869] mt-0.5 line-clamp-1">Cajas de regalo individuales y carrier para 2-4 piezas</p>
            </div>
          </div>

          {/* Card 4: The Mobile Cart */}
          <div 
            onClick={() => setActiveBrandingImage('/branding/cart-showcase.jpg')}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E6DFD4] bg-[#FAF8F4] flex flex-col hover:border-[#7A8E77] transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src="/branding/cart-showcase.jpg" 
                alt="Carrito Móvil ICHIN" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-bold text-[#B69C76] uppercase tracking-wider">El Carrito Insignia</div>
              <div className="font-bold text-xs text-[#3C4A3C]">Equipamiento & Staff</div>
              <p className="text-[11px] text-[#6A7869] mt-0.5 line-clamp-1">Marquesina LED, dispensador de cristal y uniformes</p>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Bar on Mobile when cart has items */}
      {cartCount > 0 && (
        <div 
          id="mobile-floating-cart-bar"
          className="fixed bottom-4 left-4 right-4 z-40 sm:hidden bg-[#455546] text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-[#B69C76]/40 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#B69C76] text-white flex items-center justify-center text-xs font-bold">
              {cartCount}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight font-editorial">Menú para tu Evento</span>
              <span className="text-[10px] text-[#FAF8F4]/80">Barra Móvil ICHIN Caracas</span>
            </div>
          </div>

          <button
            id="mobile-view-cart-btn"
            onClick={onOpenCart}
            className="px-4 py-2 rounded-full bg-[#FAF8F4] text-[#3C4A3C] text-xs font-bold uppercase tracking-wider hover:bg-[#F3EFE7] transition-all"
          >
            Ver Detalle
          </button>
        </div>
      )}

      {/* Customization Modal */}
      <MenuCustomizationModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={(item, qty, cust) => onAddToCart(item, qty, cust)}
      />

      {/* Intelligent Package Recommender Modal */}
      <PackageRecommenderModal
        isOpen={isRecommenderOpen}
        onClose={() => setIsRecommenderOpen(false)}
        onApplyRecommendation={handleApplyRecommendation}
      />

      {/* Fullscreen Image Preview Lightbox */}
      {activeBrandingImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveBrandingImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveBrandingImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2 text-sm font-bold flex items-center gap-1"
            >
              ✕ Cerrar
            </button>
            <img 
              src={activeBrandingImage} 
              alt="Preview de Branding" 
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
};

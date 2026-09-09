import React from 'react';
import { Logo } from './Logo';
import { ScreenType } from '../types';
import { MapPin, Phone, Instagram, Clock, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (screen: ScreenType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="app-footer" className="bg-[#3C4A3D] text-[#FAF8F4] border-t border-[#4D5D4E] mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#4D5D4E]">
          
          {/* Col 1: Brand & Bio (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Logo variant="white" onClick={() => onNavigate('menu')} />
            
            <p className="text-xs text-[#FAF8F4]/80 leading-relaxed max-w-sm">
              Santuario de matcha ceremonial y pastelería artesanal sobre ruedas. Llevamos la pausa verde japonesa a bodas exclusivas, activaciones corporativas y eventos privados en Caracas.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-[11px] font-handwriting text-xl text-[#D4BE9B]">
                "Good Habits, Better Days ♡"
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4BE9B]">
              Explorar
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F4]/90">
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-[#9BB098] transition-colors"
                >
                  • Carta & Bebidas Naturales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quoter')}
                  className="hover:text-[#9BB098] transition-colors"
                >
                  • Cotizador de Bodas & Eventos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cart-showcase')}
                  className="hover:text-[#9BB098] transition-colors"
                >
                  • Ficha del Carrito Móvil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('orders')}
                  className="hover:text-[#9BB098] transition-colors"
                >
                  • Estado de Mis Reservas
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Coverage in Caracas & Concierge (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4BE9B]">
              Cobertura & Contacto Caracas
            </h4>
            
            <div className="space-y-2 text-xs text-[#FAF8F4]/90">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#9BB098] shrink-0 mt-0.5" />
                <span>Altamira, Las Mercedes, Country Club, La Castellana, El Hatillo y toda la Gran Caracas.</span>
              </div>

              <a 
                href="https://wa.me/584143260003" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 hover:text-[#D4BE9B] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#9BB098] shrink-0" />
                <span>Concierge & WhatsApp: 0414-3260003 (+58 414 326 0003)</span>
              </a>

              <div className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-[#9BB098] shrink-0" />
                <span>@ichin.ve | by AMSI</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[10px] text-[#D4BE9B] font-bold tracking-wider uppercase">
                Matcha Importado 100% Ceremonial de Uji
              </span>
            </div>
          </div>

        </div>

        {/* Subfooter */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FAF8F4]/60 gap-3">
          <div>
            © {new Date().getFullYear()} ICHIN By AMSI. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Bebidas Naturales para Mentes Despiertas</span>
            <span>•</span>
            <span>Caracas, Venezuela</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

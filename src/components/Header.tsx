import React, { useState, useRef, useEffect } from 'react';
import { ScreenType } from '../types';
import { Logo } from './Logo';
import { ShoppingBag, Calendar, Coffee, Sparkles, Clock, QrCode, User as UserIcon, LogOut, ChevronDown, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenQr?: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenQr,
  onOpenAuth,
}) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-40 w-full bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#E6DFD4] transition-all"
    >
      {/* Top micro-announcement banner */}
      <div 
        id="top-editorial-bar"
        className="bg-[#455546] text-[#FAF8F4] text-[11px] font-medium tracking-wider uppercase py-1.5 px-4 text-center flex items-center justify-center gap-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#9CB098] animate-pulse"></span>
        <span>ICHIN by/ Amsi • Caracas • Carrito Móvil para Bodas, Activaciones y Eventos Privados</span>
        <span className="hidden md:inline-block opacity-60">|</span>
        <span className="hidden md:inline-block text-[#D6C4A5] font-semibold">
          Ceremonial Uji Grade Matcha
        </span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-3 sm:gap-6">
          
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Logo 
              variant="full" 
              onClick={() => onNavigate('menu')} 
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-1.5 bg-[#F3EFE7]/90 p-1.5 rounded-full border border-[#E6DFD4] shrink-0">
            <button
              id="nav-btn-menu"
              onClick={() => onNavigate('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                currentScreen === 'menu'
                  ? 'bg-[#455546] text-white shadow-sm'
                  : 'text-[#4A5A4B] hover:text-[#384639] hover:bg-[#FAF8F4]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Carta & Pedidos</span>
            </button>

            <button
              id="nav-btn-quoter"
              onClick={() => onNavigate('quoter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all relative ${
                currentScreen === 'quoter'
                  ? 'bg-[#455546] text-white shadow-sm'
                  : 'text-[#4A5A4B] hover:text-[#384639] hover:bg-[#FAF8F4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
              <span>Cotizar Evento</span>
              <span className="bg-[#B69C76] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
                VIP
              </span>
            </button>

            <button
              id="nav-btn-cart-showcase"
              onClick={() => onNavigate('cart-showcase')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                currentScreen === 'cart-showcase'
                  ? 'bg-[#455546] text-white shadow-sm'
                  : 'text-[#4A5A4B] hover:text-[#384639] hover:bg-[#FAF8F4]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#889B85]"></span>
              <span>El Carrito Móvil</span>
            </button>

            <button
              id="nav-btn-orders"
              onClick={() => onNavigate('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                currentScreen === 'orders'
                  ? 'bg-[#455546] text-white shadow-sm'
                  : 'text-[#4A5A4B] hover:text-[#384639] hover:bg-[#FAF8F4]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mis Reservas</span>
            </button>
          </nav>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Booking CTA */}
            <button
              id="header-cta-quote"
              onClick={() => onNavigate('quoter')}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-transparent border-1.5 border-[#455546] text-[#455546] hover:bg-[#455546] hover:text-white transition-all text-xs font-bold tracking-wider uppercase"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reservar Fecha</span>
            </button>

            {/* QR Code / Mobile View button */}
            {onOpenQr && (
              <button
                id="header-open-qr-btn"
                onClick={onOpenQr}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4] transition-all text-xs font-bold shadow-xs active:scale-95"
                title="Ver en tu Celular (0414-3260003)"
              >
                <QrCode className="w-4 h-4 text-[#7A8E77]" />
                <span className="hidden sm:inline">Ver en Móvil</span>
                <span className="text-[9px] bg-[#B69C76] text-white px-1.5 py-0.5 rounded-full font-black">
                  QR
                </span>
              </button>
            )}

            {/* Admin Finance & Inventory Panel Button - SOLO PARA ADMINISTRADORA */}
            {(isAdmin || (typeof window !== 'undefined' && localStorage.getItem('ichin_admin_pin_unlocked') === 'true')) && (
              <button
                id="header-finance-btn"
                onClick={() => onNavigate('admin-finance')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#E6DFD4] text-xs font-bold transition-all shadow-xs active:scale-95 ${
                  currentScreen === 'admin-finance'
                    ? 'bg-[#455546] text-white'
                    : 'bg-white text-[#455546] hover:bg-[#FAF8F4]'
                }`}
                title="Panel de Administradora (Gastos, Ventas e Inventario)"
              >
                <DollarSign className="w-3.5 h-3.5 text-[#B69C76]" />
                <span className="hidden lg:inline">Finanzas & Stock</span>
                <span className="text-[9px] bg-[#B69C76] text-white px-1.5 py-0.5 rounded-full font-black">
                  Admin
                </span>
              </button>
            )}

            {/* User Authentication Menu / Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#EAE5D9] hover:bg-[#E0D9CB] border border-[#E6DFD4] text-[#3C4A3C] transition-all active:scale-95 shadow-2xs"
                  aria-label="Menú de usuario"
                >
                  <div className="w-7 h-7 rounded-full bg-[#455546] text-[#FAF8F4] text-xs font-bold flex items-center justify-center shadow-xs">
                    {(profile?.fullName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline max-w-[100px] truncate">
                    {profile?.fullName?.split(' ')[0] || 'Anfitrión'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#7A8E77] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#FAF8F4] rounded-2xl border border-[#E6DFD4] shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-[#E6DFD4]/70">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#3C4A3C] truncate">
                          {profile?.fullName || 'Anfitrión'}
                        </p>
                        {isAdmin && (
                          <span className="text-[9px] bg-[#B69C76] text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7A8E77] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#4A5A4B] hover:bg-[#EAE5D9] flex items-center gap-2.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#7A8E77]" />
                        <span>Mis Reservas & Eventos</span>
                      </button>

                      {(isAdmin || (typeof window !== 'undefined' && localStorage.getItem('ichin_admin_pin_unlocked') === 'true')) && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('admin-finance');
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-[#4A5A4B] hover:bg-[#EAE5D9] flex items-center gap-2.5 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#B69C76]" />
                          <span>Panel de Finanzas & Stock</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('quoter');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#4A5A4B] hover:bg-[#EAE5D9] flex items-center gap-2.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#B69C76]" />
                        <span>Nueva Cotización VIP</span>
                      </button>
                    </div>

                    <div className="border-t border-[#E6DFD4]/70 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white border border-[#E6DFD4] text-[#455546] hover:bg-[#FAF8F4] hover:border-[#7A8E77] transition-all text-xs font-bold shadow-2xs active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#7A8E77]" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              id="open-cart-button"
              onClick={onOpenCart}
              className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#455546] text-white hover:bg-[#384639] transition-all shadow-sm active:scale-95"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 text-[#FAF8F4]" />
              {cartCount > 0 && (
                <span 
                  id="cart-badge-count"
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-[#B69C76] text-white rounded-full border-2 border-[#FAF8F4] animate-bounce"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div id="mobile-nav-bar" className="flex md:hidden items-center justify-between pb-3 pt-1 border-t border-[#E6DFD4]/60 gap-1 overflow-x-auto no-scrollbar">
          <button
            id="mobile-nav-menu"
            onClick={() => onNavigate('menu')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-full text-center text-[11px] font-bold whitespace-nowrap transition-all ${
              currentScreen === 'menu'
                ? 'bg-[#455546] text-white'
                : 'text-[#4A5A4B] bg-[#F3EFE7]'
            }`}
          >
            Carta
          </button>
          <button
            id="mobile-nav-quoter"
            onClick={() => onNavigate('quoter')}
            className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-full text-center text-[11px] font-bold whitespace-nowrap transition-all ${
              currentScreen === 'quoter'
                ? 'bg-[#455546] text-white'
                : 'text-[#4A5A4B] bg-[#F3EFE7]'
            }`}
          >
            Cotizar
          </button>
          <button
            id="mobile-nav-cart"
            onClick={() => onNavigate('cart-showcase')}
            className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-full text-center text-[11px] font-bold whitespace-nowrap transition-all ${
              currentScreen === 'cart-showcase'
                ? 'bg-[#455546] text-white'
                : 'text-[#4A5A4B] bg-[#F3EFE7]'
            }`}
          >
            El Carrito
          </button>
          <button
            id="mobile-nav-orders"
            onClick={() => onNavigate('orders')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-full text-center text-[11px] font-bold whitespace-nowrap transition-all ${
              currentScreen === 'orders'
                ? 'bg-[#455546] text-white'
                : 'text-[#4A5A4B] bg-[#F3EFE7]'
            }`}
          >
            Reservas
          </button>
          {(isAdmin || (typeof window !== 'undefined' && localStorage.getItem('ichin_admin_pin_unlocked') === 'true')) && (
            <button
              id="mobile-nav-finance"
              onClick={() => onNavigate('admin-finance')}
              className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-full text-center text-[11px] font-bold whitespace-nowrap transition-all ${
                currentScreen === 'admin-finance'
                  ? 'bg-[#455546] text-white'
                  : 'text-[#4A5A4B] bg-[#F3EFE7]'
              }`}
            >
              Finanzas
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

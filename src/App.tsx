/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType, MenuItem, OrderCustomization, CartOrderItem, BookingRecord } from './types';
import { INITIAL_BOOKINGS } from './data/eventPackages';
import { Header } from './components/Header';
import { MenuScreen } from './components/MenuScreen';
import { EventQuoterScreen } from './components/EventQuoterScreen';
import { CartShowcaseScreen } from './components/CartShowcaseScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { CartDrawer } from './components/CartDrawer';
import { MobileQrModal } from './components/MobileQrModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('menu');
  const [cartItems, setCartItems] = useState<CartOrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [initialQuoteParams, setInitialQuoteParams] = useState<{
    packageId?: string;
    guestCount?: number;
    eventType?: 'Boda' | 'Corporativo / Brand Activation' | 'Cumpleaños VIP' | 'Pop-up Privado' | 'Brunch & Social';
  } | undefined>(undefined);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (item: MenuItem, quantity: number, customization?: OrderCustomization) => {
    // Calculate single unit price with possible milk/shot upgrades
    const milkSurcharge = customization?.milk && (customization.milk.includes('Avena') || customization.milk.includes('Almendra')) ? 0.5 : 0;
    const shotSurcharge = customization?.extraShot ? 1.0 : 0;
    const foamSurcharge = customization?.coldFoam ? 0.75 : 0;
    const charmSurcharge = customization?.charmPiece && customization.charmPiece !== 'Sin Charm' ? 1.0 : 0;
    const unitPrice = item.price + milkSurcharge + shotSurcharge + foamSurcharge + charmSurcharge;
    const subtotal = unitPrice * quantity;

    const newCartItem: CartOrderItem = {
      item,
      quantity,
      customization,
      subtotal,
    };

    setCartItems((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const singleUnitPrice = item.subtotal / item.quantity;
      item.quantity = newQty;
      item.subtotal = singleUnitPrice * newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleQuoteSubmitted = (newBooking: BookingRecord) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleGoToQuoterWithPackage = (packageId: string, guestCount: number, eventType: string) => {
    setInitialQuoteParams({
      packageId,
      guestCount,
      eventType: eventType as any,
    });
    setCurrentScreen('quoter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="ichin-app-root" className="min-h-screen bg-[#FAF8F4] text-[#3C4A3C] flex flex-col antialiased">
      {/* Top Header & Navigation */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQr={() => setIsQrModalOpen(true)}
      />

      {/* Main Screen Body */}
      <main className="flex-1">
        {currentScreen === 'menu' && (
          <MenuScreen
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onGoToQuoterWithPackage={handleGoToQuoterWithPackage}
          />
        )}

        {currentScreen === 'quoter' && (
          <EventQuoterScreen
            onQuoteSubmitted={handleQuoteSubmitted}
            initialQuoteParams={initialQuoteParams}
          />
        )}

        {currentScreen === 'cart-showcase' && (
          <CartShowcaseScreen
            onGoToQuoter={() => {
              setCurrentScreen('quoter');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToMenu={() => {
              setCurrentScreen('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'orders' && (
          <OrdersScreen
            bookings={bookings}
            activeOrders={cartItems}
            onNewQuoteClick={() => {
              setCurrentScreen('quoter');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Slide-over Shopping Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Mobile QR Code & Phone Preview Modal */}
      <MobileQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

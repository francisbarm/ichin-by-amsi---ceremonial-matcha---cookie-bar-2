export type ScreenType = 'menu' | 'quoter' | 'cart-showcase' | 'orders';

export interface MenuItem {
  id: string;
  name: string;
  category: 'matcha' | 'cookies' | 'specials';
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  isSignature?: boolean;
  calories?: string;
  matchaGrade?: string;
  availableMilks?: string[];
  sweetenerOptions?: string[];
}

export interface OrderCustomization {
  milk?: string;
  sweetener?: string;
  iceLevel?: 'Normal' | 'Poco Hielo' | 'Sin Hielo' | 'Extra Frío';
  extraShot?: boolean;
  coldFoam?: boolean;
  charmPiece?: string;
  notes?: string;
}

export interface CartOrderItem {
  item: MenuItem;
  quantity: number;
  customization?: OrderCustomization;
  subtotal: number;
}

export interface EventPackage {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  basePrice: number;
  guestCountMin: number;
  guestCountMax: number;
  includedHours: number;
  includedDrinks: number;
  includedCookies: number;
  baristasCount: number;
  features: string[];
  recommendedFor: string;
}

export interface EventQuoteState {
  eventType: 'Boda' | 'Corporativo / Brand Activation' | 'Cumpleaños VIP' | 'Pop-up Privado' | 'Brunch & Social';
  guestCount: number;
  packageId: string;
  serviceHours: number;
  extraDrinksCount: number;
  includeArtisanalCookies: boolean;
  cookieCount: number;
  customBrandedCups: boolean;
  matchaColdFoamStation: boolean;
  signatureDrinkCreated: boolean;
  locationZone: string;
  specificAddress: string;
  eventDate: string;
  eventTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests: string;
  customSignagePhrase?: string;
  cupOption?: 'pet_cristal' | 'personalizados' | 'vidrio_solicitud';
  terraceFurniture?: 'ninguno' | 'toldos_sombrilla' | 'mesas_altas' | 'lounge_completo';
  drinkCharmsCustomization?: boolean;
  drinkCharmsTheme?: 'mix_sorpresa' | 'ositos_teddy' | 'halloween' | 'navidad' | 'mini_foodie' | 'glow_animals' | 'gemas_cristal';
}

export interface BookingRecord {
  id: string;
  code: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType: string;
  date: string;
  zone: string;
  packageTitle: string;
  guests: number;
  totalUsd: number;
  status: 'confirmed' | 'in_prep' | 'pending';
  statusLabel: string;
  createdAt: string;
}


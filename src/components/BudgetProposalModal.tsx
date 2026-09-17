import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { BookingRecord } from '../types';
import { EVENT_PACKAGES } from '../data/eventPackages';

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface BudgetProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord;
  onSaveTotal?: (bookingId: string, totalUsd: number, items: BudgetItem[]) => Promise<void>;
}

export const BudgetProposalModal: React.FC<BudgetProposalModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSaveTotal,
}) => {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Parse items from booking or generate defaults
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>(
    'Incluye 3 horas de servicio continuo con carrito ceremonial móvil, 2 baristas uniformados, vajilla de lujo, leches vegetales y endulzantes orgánicos.'
  );

  // Initialize budget items based on booking package and addons
  // Initialize budget items ensuring personalization, toldos, mesas, and sillas are included
  useEffect(() => {
    if (!booking) return;

    const initialItems: BudgetItem[] = [];
    const pkg =
      EVENT_PACKAGES.find(
        (p) => p.name.toLowerCase() === (booking.packageTitle || '').toLowerCase()
      ) || EVENT_PACKAGES[1];

    const basePrice = pkg.basePrice || 820;

    // 1. Paquete principal de Matcha Bar
    initialItems.push({
      id: 'pkg-base',
      description: `Servicio de Barra Ceremonial: ${pkg.name} (${booking.guests || 60} tazas estimadas, 2 baristas y vajilla)`,
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice,
    });

    // 2. Personalización de Vasos con Logo
    initialItems.push({
      id: 'addon-vasos',
      description: 'Personalización de Vasos: Vasos cristalinos con Logo / Monograma Foil del Evento',
      quantity: 1,
      unitPrice: 65,
      total: 65,
    });

    // 3. Personalización de Bebidas (Charms & Gemas 3D)
    const guestQty = booking.guests || 60;
    initialItems.push({
      id: 'addon-charms',
      description: `Personalización de Bebidas: Estación de Charms 3D, Dijes Coleccionables & Gemas de Cristal (${guestQty} piezas)`,
      quantity: guestQty,
      unitPrice: 1.0,
      total: Math.round(guestQty * 1.0),
    });

    // 4. Pizarras y Señalética Personalizada
    initialItems.push({
      id: 'addon-pizarras',
      description: 'Cartelería & Pizarras de Bienvenida personalizadas con frase o nombres del evento',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });

    // 5. Toldos Sombrilla Riviera
    initialItems.push({
      id: 'addon-toldos',
      description: 'Mobiliario de Exterior: Set de Toldos Sombrilla Riviera (Lona blanca con flecos estilo resort)',
      quantity: 1,
      unitPrice: 65,
      total: 65,
    });

    // 6. Mesas Cocteleras y de Apoyo
    initialItems.push({
      id: 'addon-mesas',
      description: 'Mobiliario: Set de Mesas Altas Cocteleras Blancas & Mesas Bajas de Apoyo',
      quantity: 1,
      unitPrice: 60,
      total: 60,
    });

    // 7. Sillas Medallón y Taburetes
    initialItems.push({
      id: 'addon-sillas',
      description: 'Sillas & Asientos: Set de Sillas Medallón Blancas y Taburetes Cocteleros Tapizados',
      quantity: 1,
      unitPrice: 65,
      total: 65,
    });

    // 8. Logística y Montaje
    initialItems.push({
      id: 'logistica',
      description: `Montaje, ambientación vegetal e iluminación en locación (${booking.zone || 'Caracas'})`,
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });

    setItems(initialItems);
  }, [booking]);

  if (!isOpen || !booking) return null;

  // Financial calculations
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  // Format Venezuelan phone number for WhatsApp
  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    if (!digits.startsWith('58') && (digits.startsWith('412') || digits.startsWith('414') || digits.startsWith('424') || digits.startsWith('416') || digits.startsWith('426'))) {
      digits = '58' + digits;
    }
    return digits;
  };

  const whatsappPhone = cleanPhone(booking.clientPhone);

  // Quick preset adder
  const handleAddPreset = (type: 'toldos' | 'mesas' | 'sillas' | 'vasos' | 'charms' | 'lounge') => {
    if (type === 'toldos') {
      setItems([
        ...items,
        {
          id: `toldos-${Date.now()}`,
          description: 'Set de Toldos Sombrilla Riviera (Lona blanca con flecos)',
          quantity: 1,
          unitPrice: 65,
          total: 65,
        },
      ]);
    } else if (type === 'mesas') {
      setItems([
        ...items,
        {
          id: `mesas-${Date.now()}`,
          description: 'Set de Mesas Altas Cocteleras Blancas & Mesas de Apoyo',
          quantity: 1,
          unitPrice: 60,
          total: 60,
        },
      ]);
    } else if (type === 'sillas') {
      setItems([
        ...items,
        {
          id: `sillas-${Date.now()}`,
          description: 'Set de Sillas Medallón Blancas y Taburetes Cocteleros',
          quantity: 1,
          unitPrice: 65,
          total: 65,
        },
      ]);
    } else if (type === 'vasos') {
      setItems([
        ...items,
        {
          id: `vasos-${Date.now()}`,
          description: 'Vasos personalizados con Logo / Monograma Foil del Evento',
          quantity: 1,
          unitPrice: 65,
          total: 65,
        },
      ]);
    } else if (type === 'charms') {
      const q = booking.guests || 60;
      setItems([
        ...items,
        {
          id: `charms-${Date.now()}`,
          description: `Estación de Charms 3D, Dijes & Gemas para vasos (${q} pzs)`,
          quantity: q,
          unitPrice: 1.0,
          total: q,
        },
      ]);
    } else if (type === 'lounge') {
      setItems([
        ...items,
        {
          id: `lounge-${Date.now()}`,
          description: 'Montaje Lounge Completo: Toldos Riviera + Mesas Altas + Sillas Medallón y Taburetes',
          quantity: 1,
          unitPrice: 180,
          total: 180,
        },
      ]);
    }
  };

  // Generate WhatsApp formatted text
  const generateWhatsAppMessage = () => {
    const lines = [
      `🍵 *ICHIN By AMSI | Propuesta y Presupuesto Oficial*`,
      `Hola *${booking.clientName}*, un placer saludarte.`,
      ``,
      `Adjuntamos la cotización formal detallada para tu evento con nuestro Carrito Ceremonial de Matcha & Cookies:`,
      ``,
      `📋 *Código de Reserva:* ${booking.code}`,
      `🎉 *Celebración:* ${booking.eventType}`,
      `📅 *Fecha y Hora:* ${booking.date}`,
      `📍 *Locación:* ${booking.zone}`,
      `👥 *Capacidad:* ${booking.guests} tazas ceremoniales`,
      `🍵 *Paquete:* ${booking.packageTitle}`,
      ``,
      `*DESGLOSE DE SERVICIOS:*`,
      ...items.map(
        (it) =>
          `• ${it.description}: ${it.total > 0 ? `$${it.total.toLocaleString()} USD` : 'Incluido'}`
      ),
      discount > 0 ? `• Descuento Especial: -$${discount} USD` : '',
      ``,
      `💰 *INVERSIÓN TOTAL:* *$${grandTotal.toLocaleString()} USD*`,
      ``,
      `*LA EXPERIENCIA INCLUYE:*`,
      `🎨 *PERSONALIZACIÓN:*`,
      `  • Vasos personalizados con logo / monograma del evento`,
      `  • Barra de dijes, charms coleccionables y gemas 3D para decorar cada bebida`,
      `  • Pizarra de bienvenida y cartelería con frases conmemorativas personalizadas`,
      ``,
      `⛱️ *MOBILIARIO EXCLUSIVO DE TERRAZA & JARDÍN:*`,
      `  • Toldos Sombrilla Riviera (Lona blanca con flecos estilo resort)`,
      `  • Set de Mesas Altas Cocteleras & Mesas Bajas de Apoyo`,
      `  • Set de Sillas Medallón Blancas & Taburetes Cocteleros Tapizados`,
      ``,
      `🍵 *SERVICIO CEREMONIAL MATCHA:*`,
      `  • Carrito móvil artesanal japonés con marquesina y decoración vegetal`,
      `  • 2 Baristas certificados en batido ceremonial con chasen tradicional`,
      `  • Matcha Uji grado ceremonial importado fresco de Kioto, Japón`,
      `  • Variedad de leches vegetales (avena, almendra, coco) y endulzantes orgánicos`,
      `  • Dispensador de cristal de bienvenida para degustación continua`,
      ``,
      `📌 *Condiciones de Reserva:*`,
      `• 50% de anticipo para congelar y reservar la fecha en agenda formal.`,
      `• 50% restante 48 horas previas al evento.`,
      `• Formas de pago: Zelle, Pago Móvil (tasa BCV), Banesco Panamá o Efectivo USD en Caracas.`,
      ``,
      `¿Deseas que congelemos tu fecha en la agenda oficial? Quedamos a tu entera orden para cualquier ajuste o detalle adicional.`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  // Open WhatsApp directly
  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const target = whatsappPhone || '584143260003';
    const url = `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Open Email mailto
  const handleOpenEmail = () => {
    const subject = `Presupuesto Oficial ICHIN By AMSI - Reserva ${booking.code} (${booking.eventType})`;
    const text = generateWhatsAppMessage();
    const mailto = `mailto:${booking.clientEmail || ''}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(text)}`;
    window.open(mailto, '_blank');
  };

  // Copy proposal text
  const handleCopyText = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Print PDF
  const handlePrint = () => {
    window.print();
  };

  // Handle Save in Supabase
  const handleSaveBudget = async () => {
    if (!onSaveTotal) return;
    try {
      setSaving(true);
      await onSaveTotal(booking.id, grandTotal, items);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Add line item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `custom-${Date.now()}`,
        description: 'Servicio adicional personalizado',
        quantity: 1,
        unitPrice: 50,
        total: 50,
      },
    ]);
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof BudgetItem, val: any) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(val) || 0 : it.quantity;
          const price = field === 'unitPrice' ? Number(val) || 0 : it.unitPrice;
          updated.total = Math.round(qty * price);
        }
        return updated;
      })
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-[#FAF8F4] rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:rounded-none print:m-0 print:max-w-full">
        
        {/* Top Header / Action Toolbar (Hidden when printing) */}
        <div className="px-6 py-4 bg-[#455546] text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#D4BE9B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase font-editorial">
                Generador de Presupuesto Oficial
              </h3>
              <p className="text-[11px] text-[#D4BE9B]">
                ICHIN By AMSI • Comprobante Proforma N° {booking.code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="py-1.5 px-3 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guardar PDF / Imprimir</span>
            </button>

            <button
              onClick={handleCopyText}
              type="button"
              className="py-1.5 px-3 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copiar texto formal para WhatsApp o Instagram"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors ml-1 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Instant Response Bar (WhatsApp & Email Direct Buttons) */}
        <div className="bg-[#EFECE4] border-b border-[#E0D9CB] px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3C4A3C]">
            <Sparkles className="w-4 h-4 text-[#7A8E77]" />
            <span>Responder Inmediatamente al Cliente:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp Direct Response */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-none py-2 px-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                WhatsApp {booking.clientPhone ? `(+${whatsappPhone})` : 'al Cliente'}
              </span>
            </button>

            {/* Email Direct Response */}
            {booking.clientEmail && (
              <button
                type="button"
                onClick={handleOpenEmail}
                className="flex-1 sm:flex-none py-2 px-4 rounded-full bg-[#455546] hover:bg-[#384639] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#D4BE9B]" />
                <span>Correo ({booking.clientEmail.split('@')[0]})</span>
              </button>
            )}

            {/* Save in Supabase Button */}
            {onSaveTotal && (
              <button
                type="button"
                onClick={handleSaveBudget}
                disabled={saving}
                className="py-2 px-4 rounded-full bg-white border border-[#D9D0C3] hover:bg-[#FAF8F4] text-[#3C4A3C] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">Guardado en Base de Datos</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-3.5 h-3.5 text-[#7A8E77]" />
                    <span>{saving ? 'Guardando...' : 'Guardar Total en DB'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENTO FORMAL IMPRIMIBLE / PDF (DISEÑO EDITORIAL DE LUJO)             */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-10 space-y-8 print:p-8" id="formal-budget-document">
          
          {/* Header Membrete */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#E6DFD4] pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#455546]/10 text-[#455546] text-xs font-bold uppercase tracking-wider mb-2">
                <span>AMSI Group Caracas • Ceremonial Division</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#3C4A3C] font-editorial tracking-tight">
                ICHIN By AMSI
              </h1>
              <p className="text-xs text-[#75786E] font-medium tracking-wide">
                Ceremonial Matcha Bar & Artisanal Cookie Cart Service
              </p>
              <div className="text-[11px] text-[#8C9288] pt-1">
                <span>Caracas, Venezuela • </span>
                <span className="font-bold text-[#455546]">@ichin.matcha</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E6DFD4] shadow-2xs text-right min-w-[200px] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B69C76] tracking-wider block">
                Presupuesto Oficial Proforma
              </span>
              <div className="text-2xl font-black text-[#3C4A3C] font-editorial">
                N° {booking.code}
              </div>
              <div className="text-xs text-[#75786E]">
                Fecha: <span className="font-bold text-[#3C4A3C]">{new Date().toLocaleDateString('es-VE')}</span>
              </div>
              <div className="text-[11px] text-[#7A8E77] font-semibold">
                Validez: 7 días continuos
              </div>
            </div>
          </div>

          {/* Client & Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#E6DFD4] shadow-2xs text-xs">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8E77] block">
                Datos del Cliente
              </span>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Titular / Empresa:</span>
                <span className="font-bold text-[#3C4A3C]">{booking.clientName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Teléfono:</span>
                <span className="font-semibold text-[#3C4A3C]">{booking.clientPhone || 'No especificado'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Correo Electrónico:</span>
                <span className="font-semibold text-[#3C4A3C]">{booking.clientEmail || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8E77] block">
                Detalles del Evento
              </span>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Celebración:</span>
                <span className="font-bold text-[#3C4A3C]">{booking.eventType}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Fecha y Hora:</span>
                <span className="font-bold text-[#3C4A3C]">{booking.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Locación:</span>
                <span className="font-bold text-[#3C4A3C]">{booking.zone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Capacidad Estimada:</span>
                <span className="font-bold text-[#3C4A3C]">{booking.guests} tazas de servicio</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#75786E]">
                Desglose de Servicios & Experiencia
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-[#455546] hover:text-[#2d382e] flex items-center gap-1 cursor-pointer print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Ítem Personalizado</span>
              </button>
            </div>

            {/* Quick Add Presets: Personalización, Toldos, Mesas, Sillas */}
            <div className="flex flex-wrap items-center gap-1.5 print:hidden bg-[#FAF8F4] p-2.5 rounded-2xl border border-[#E6DFD4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8E77] mr-1">
                Incluir Adicionales:
              </span>
              <button
                type="button"
                onClick={() => handleAddPreset('toldos')}
                className="py-1 px-2.5 rounded-full bg-white border border-[#E6DFD4] hover:border-[#7A8E77] text-[#3C4A3C] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                + Toldos Riviera ($65)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('mesas')}
                className="py-1 px-2.5 rounded-full bg-white border border-[#E6DFD4] hover:border-[#7A8E77] text-[#3C4A3C] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                + Mesas Cocteleras ($60)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('sillas')}
                className="py-1 px-2.5 rounded-full bg-white border border-[#E6DFD4] hover:border-[#7A8E77] text-[#3C4A3C] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                + Sillas Medallón ($65)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('vasos')}
                className="py-1 px-2.5 rounded-full bg-white border border-[#E6DFD4] hover:border-[#7A8E77] text-[#3C4A3C] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                + Vasos Personalizados ($65)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('charms')}
                className="py-1 px-2.5 rounded-full bg-white border border-[#E6DFD4] hover:border-[#7A8E77] text-[#3C4A3C] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                + Charms & Gemas 3D ($1/pza)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('lounge')}
                className="py-1 px-2.5 rounded-full bg-[#455546]/10 border border-[#455546]/20 hover:bg-[#455546] hover:text-white text-[#455546] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                ✨ Pack Lounge Completo ($180)
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E6DFD4] bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F4] border-b border-[#E6DFD4] text-[11px] uppercase font-bold tracking-wider text-[#7A8E77]">
                    <th className="py-3 px-4">Descripción del Servicio</th>
                    <th className="py-3 px-3 text-center w-20">Cant.</th>
                    <th className="py-3 px-3 text-right w-28">P. Unit ($)</th>
                    <th className="py-3 px-4 text-right w-28">Total ($)</th>
                    <th className="py-3 px-2 w-8 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                          className="w-full bg-transparent font-medium text-[#3C4A3C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#7A8E77] rounded px-1 -mx-1"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleUpdateItem(it.id, 'quantity', e.target.value)}
                          className="w-14 text-center bg-transparent font-medium text-[#3C4A3C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#7A8E77] rounded"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={it.unitPrice}
                          onChange={(e) => handleUpdateItem(it.id, 'unitPrice', e.target.value)}
                          className="w-20 text-right bg-transparent font-medium text-[#3C4A3C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#7A8E77] rounded"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#3C4A3C]">
                        ${it.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center print:hidden">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(it.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Notes Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Notes & Commercial Terms */}
            <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-[#E6DFD4] shadow-2xs space-y-3 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8E77] block">
                Términos y Condiciones Comerciales
              </span>
              <ul className="space-y-1.5 text-[11px] text-[#525B4F] leading-relaxed list-disc list-inside">
                <li>
                  <strong>Reserva y Bloqueo de Fecha:</strong> Anticipo del 50% al aprobar esta cotización.
                </li>
                <li>
                  <strong>Liquidación:</strong> 50% restante a ser cancelado 48 horas previas al evento.
                </li>
                <li>
                  <strong>Llegada Técnica:</strong> El equipo arriba 1 hora antes de la hora pautada para montaje y calibración.
                </li>
                <li>
                  <strong>Métodos de Pago:</strong> Zelle, Pago Móvil (Tasa oficial BCV), Banesco Panamá o Efectivo USD en Caracas.
                </li>
              </ul>

              <div className="pt-2 border-t border-gray-100">
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Observaciones Adicionales
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-[11px] text-[#525B4F] p-2 bg-[#FAF8F4] border border-[#E6DFD4] rounded-xl focus:outline-none focus:border-[#7A8E77]"
                />
              </div>
            </div>

            {/* Right Totals Card */}
            <div className="md:col-span-5 bg-[#455546] text-white p-6 rounded-2xl shadow-md space-y-3 print:bg-gray-100 print:text-[#3C4A3C] print:border print:border-gray-300">
              <div className="flex justify-between text-xs text-white/80 print:text-gray-600">
                <span>Subtotal de Servicios:</span>
                <span className="font-bold">${subtotal.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-between items-center text-xs text-white/80 print:text-gray-600">
                <span>Descuento Especial:</span>
                <div className="flex items-center gap-1">
                  <span>-$</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-16 bg-white/20 text-white font-bold text-right px-1.5 py-0.5 rounded focus:outline-none print:text-[#3C4A3C] print:bg-white"
                  />
                  <span>USD</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/20 print:border-gray-300 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#D4BE9B] print:text-[#7A8E77] block">
                    TOTAL PRESUPUESTO
                  </span>
                  <span className="text-[10px] text-white/70 print:text-gray-500">
                    Montaje + Servicio Completo
                  </span>
                </div>
                <div className="text-3xl font-black font-editorial text-[#D4BE9B] print:text-[#3C4A3C]">
                  ${grandTotal.toLocaleString()} <span className="text-xs font-sans">USD</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-white/70 text-center print:text-gray-500">
                <span>Precios expresados en dólares americanos (USD). Tasa BCV para pagos en bolívares.</span>
              </div>
            </div>

          </div>

          {/* Footer Signature & Approval Stamp */}
          <div className="pt-8 border-t border-[#E6DFD4] flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left text-xs text-[#75786E]">
            <div>
              <div className="font-bold text-[#3C4A3C] uppercase tracking-wider">
                ICHIN By AMSI • Ceremonial Operations
              </div>
              <div className="text-[11px]">
                Dirección de Eventos & Barra Móvil • Caracas, Venezuela
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F4] px-4 py-2 rounded-xl border border-[#E6DFD4]">
              <ShieldCheck className="w-4 h-4 text-[#7A8E77]" />
              <span className="text-[11px] font-bold text-[#3C4A3C]">
                Presupuesto Oficial Certificado AMSI Group
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar for Mobile / Extra action */}
        <div className="p-4 bg-[#F2EFE9] border-t border-[#E6DFD4] flex flex-wrap justify-between items-center gap-3 print:hidden">
          <span className="text-xs text-[#6A7869]">
            💡 Al pulsar <strong>WhatsApp</strong>, se abrirá el chat con el cliente con el texto del presupuesto ya redactado.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="py-2 px-5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-full bg-white border border-[#D9D0C3] text-[#3C4A3C] hover:bg-[#FAF8F4] text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

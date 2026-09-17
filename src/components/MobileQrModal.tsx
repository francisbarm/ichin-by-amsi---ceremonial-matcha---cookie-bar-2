import React, { useState } from 'react';
import { X, QrCode, Send, Copy, Check, Smartphone } from 'lucide-react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [connMode, setConnMode] = useState<'tunnel' | 'wifi'>('tunnel');

  if (!isOpen) return null;

  // Local IP & Direct Cloudflare HTTPS Link (No Interstitial Warning)
  const localUrl = 'http://172.31.0.228:3000';
  const tunnelUrl = 'https://clan-tab-important-biz.trycloudflare.com';
  const activeUrl = connMode === 'tunnel' ? tunnelUrl : localUrl;
  const qrImageSrc = connMode === 'tunnel' ? '/branding/qr-mobile-preview.png' : '/branding/qr-local-preview.png';

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `🍵 *ICHIN by/ Amsi — Ceremonial Matcha & Cookie Bar*\n\n` +
      `¡Hola! Te comparto el enlace directo a nuestra web interactiva:\n\n` +
      `👉 ${tunnelUrl}\n\n` +
      `✨ Bar de matcha ceremonial japonés y pastelería fina para eventos exclusivos en Caracas.`
    );
    window.open(`https://wa.me/584143260003?text=${text}`, '_blank');
  };

  return (
    <div 
      id="mobile-qr-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="mobile-qr-card"
        className="bg-[#FAF8F4] w-full max-w-md rounded-3xl border border-[#E6DFD4] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 relative flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-[#3C4A3C] border border-[#E6DFD4] hover:bg-[#F3EFE7] flex items-center justify-center transition-all shadow-sm"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#455546] text-[#FAF8F4] text-[10px] font-bold uppercase tracking-wider mb-2">
          <Smartphone className="w-3 h-3 text-[#B69C76]" />
          <span>Vista Móvil en Tiempo Real</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#3C4A3C] font-editorial mb-1">
          Escanea el Código QR
        </h3>

        <p className="text-xs text-[#525B4F] max-w-xs mb-3 leading-relaxed">
          Apunta la cámara de tu teléfono móvil a este código para abrir y probar la app de ICHIN by/ Amsi.
        </p>

        {/* Selector de Modo de Conexión: 4G/LTE vs Wi-Fi Local */}
        <div className="w-full grid grid-cols-2 p-1 bg-[#EAE5D9] rounded-2xl mb-3 text-xs font-bold border border-[#DDD5C3]">
          <button
            type="button"
            onClick={() => setConnMode('tunnel')}
            className={`py-2 px-3 rounded-xl transition-all ${
              connMode === 'tunnel'
                ? 'bg-[#364437] text-white shadow-sm'
                : 'text-[#4A5A4B] hover:text-[#232724]'
            }`}
          >
            Datos Móviles 4G / Web
          </button>
          <button
            type="button"
            onClick={() => setConnMode('wifi')}
            className={`py-2 px-3 rounded-xl transition-all ${
              connMode === 'wifi'
                ? 'bg-[#364437] text-white shadow-sm'
                : 'text-[#4A5A4B] hover:text-[#232724]'
            }`}
          >
            Misma Red Wi-Fi
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#7A8E77]/30 shadow-inner mb-3 flex flex-col items-center">
          <img 
            key={qrImageSrc}
            src={qrImageSrc} 
            alt="Código QR para Móvil" 
            className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
          />
          <span className="text-[10px] font-bold text-[#7A8E77] tracking-wider uppercase mt-2">
            {connMode === 'tunnel' ? 'ICHIN • Enlace Público (4G / Wi-Fi)' : 'ICHIN • Red Wi-Fi Local (Sin avisos)'}
          </span>
        </div>

        {/* Guía Importante si está en modo túnel */}
        {connMode === 'tunnel' && (
          <div className="w-full bg-[#EAE5D9]/70 p-2.5 rounded-xl border border-[#DDD5C3] text-[11px] text-[#455546] text-left mb-3 flex items-start gap-2">
            <span className="text-base leading-none">✨</span>
            <p className="leading-snug">
              Conexión directa global vía <strong className="text-[#364437] font-bold">Cloudflare CDN</strong>. Abre directamente sin pantallas intermedias ni advertencias.
            </p>
          </div>
        )}

        {/* Direct WhatsApp Button to User's Phone */}
        <button
          id="send-whatsapp-preview-btn"
          onClick={handleSendWhatsApp}
          className="w-full py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 mb-2.5"
        >
          <Send className="w-4 h-4" />
          <span>Enviar Link a mi WhatsApp (0414-3260003)</span>
        </button>

        {/* Link Card with Copy Button */}
        <div className="w-full flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E6DFD4] mb-1.5">
          <span className="text-[11px] text-[#3C4A3C] font-mono truncate flex-1 text-left px-2">
            {activeUrl}
          </span>
          <button
            onClick={() => handleCopy(activeUrl)}
            className="px-3 py-1.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F3EFE7] text-[#3C4A3C] text-xs font-bold flex items-center gap-1 border border-[#E6DFD4] transition-all shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#7A8E77]" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-[#75786E]">
          {connMode === 'tunnel' 
            ? 'Funciona con cualquier plan de datos móviles o conexión a internet.'
            : 'Tu teléfono debe estar conectado al mismo Wi-Fi de esta computadora.'}
        </p>
      </div>
    </div>
  );
};

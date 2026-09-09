import React, { useState } from 'react';
import { X, QrCode, Send, Copy, Check, Smartphone } from 'lucide-react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Local IP & Active Public HTTPS Tunnel
  const localUrl = 'http://172.31.0.228:3000';
  const tunnelUrl = 'https://reverence-dart-iguana.ngrok-free.dev';

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Aquí tienes el link para revisar la Web App de ICHIN By AMSI en tu celular:\n\n` +
      `🌐 Link Web (Móvil / 4G / Wi-Fi):\n${tunnelUrl}\n\n` +
      `🔗 Link Red Local:\n${localUrl}\n\n` +
      `Matcha ceremonial japonés de grado premium y pastelería fina para eventos en Caracas.`
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#455546] text-[#FAF8F4] text-[10px] font-bold uppercase tracking-wider mb-3">
          <Smartphone className="w-3 h-3 text-[#B69C76]" />
          <span>Vista Móvil en Tiempo Real</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#3C4A3C] font-editorial mb-1">
          Escanea el Código QR
        </h3>

        <p className="text-xs text-[#525B4F] max-w-xs mb-4 leading-relaxed">
          Apunta la cámara de tu teléfono móvil a este código para abrir y probar la app con datos móviles o Wi-Fi.
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#7A8E77]/30 shadow-inner mb-4 flex flex-col items-center">
          <img 
            src="/branding/qr-mobile-preview.png" 
            alt="Código QR para Móvil" 
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
          />
          <span className="text-[10px] font-bold text-[#7A8E77] tracking-wider uppercase mt-2">
            ICHIN By AMSI • Conexión Móvil Universal
          </span>
        </div>

        {/* Direct WhatsApp Button to User's Phone */}
        <button
          id="send-whatsapp-preview-btn"
          onClick={handleSendWhatsApp}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 mb-3"
        >
          <Send className="w-4 h-4" />
          <span>Enviar Link a mi Celular (0414-3260003)</span>
        </button>

        {/* Public Tunnel Link Card */}
        <div className="w-full flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E6DFD4] mb-2">
          <span className="text-[11px] text-[#3C4A3C] font-mono truncate flex-1 text-left px-2">
            {tunnelUrl}
          </span>
          <button
            onClick={() => handleCopy(tunnelUrl)}
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

        <p className="text-[10px] text-[#75786E] mt-1">
          Funciona tanto con datos móviles (4G/LTE) como con Wi-Fi en cualquier teléfono.
        </p>
      </div>
    </div>
  );
};

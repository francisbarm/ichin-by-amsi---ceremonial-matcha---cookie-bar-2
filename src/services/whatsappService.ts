import { supabase } from '../lib/supabase';

export interface WhatsAppEventPayload {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  bookingCode?: string;
  eventType: string;
  packageName: string;
  guestCount: number;
  eventDate: string;
  eventTime?: string;
  locationZone: string;
  customSignagePhrase?: string;
  cupOptionLabel?: string;
  cotizacionId?: string;
}

export const WHATSAPP_OFFICIAL_PHONE = '584143260003';

/**
 * Genera el texto formal y elegante para la cotización por WhatsApp
 */
export function generarMensajeWhatsAppEvento(data: WhatsAppEventPayload): string {
  return (
    `¡Hola ICHIN By AMSI! Me gustaría reservar el carrito de matcha ceremonial para mi evento.\n\n` +
    (data.bookingCode ? `• *Código:* ${data.bookingCode}\n` : '') +
    `• *Evento:* ${data.eventType}\n` +
    `• *Paquete:* ${data.packageName}\n` +
    `• *Invitados:* ${data.guestCount} personas\n` +
    `• *Frase en Pizarra:* "${data.customSignagePhrase || 'GOOD HABITS, BETTER DAYS ♡'}"\n` +
    (data.cupOptionLabel ? `• *Presentación:* ${data.cupOptionLabel}\n` : '') +
    `• *Fecha:* ${data.eventDate}${data.eventTime ? ` a las ${data.eventTime}` : ''}\n` +
    `• *Zona Caracas:* ${data.locationZone}\n` +
    `• *Contacto:* ${data.clientName || 'Cliente'}\n` +
    `• *Teléfono:* ${data.clientPhone || 'No especificado'}\n` +
    (data.clientEmail ? `• *Email:* ${data.clientEmail}\n\n` : '\n') +
    `¿Tienen disponibilidad en agenda para esta fecha? ¡Muchas gracias!`
  );
}

/**
 * Abre WhatsApp directamente y registra la notificación en Supabase
 */
export async function enviarCotizacionWhatsApp(data: WhatsAppEventPayload) {
  const mensaje = generarMensajeWhatsAppEvento(data);
  const encodedText = encodeURIComponent(mensaje);
  const url = `https://wa.me/${WHATSAPP_OFFICIAL_PHONE}?text=${encodedText}`;

  // Registrar en la tabla notificaciones de Supabase
  try {
    await supabase.from('notificaciones').insert([{
      cotizacion_id: data.cotizacionId || null,
      tipo: 'whatsapp_alerta',
      proveedor: 'whatsapp',
      destinatario: data.clientPhone || WHATSAPP_OFFICIAL_PHONE,
      asunto: `Cotización WhatsApp ${data.bookingCode || ''}`,
      estado: 'enviado',
      detalles: {
        telefonoDestino: WHATSAPP_OFFICIAL_PHONE,
        cliente: data.clientName,
        paquete: data.packageName,
        codigo: data.bookingCode
      }
    }]);
  } catch (err) {
    console.warn('Advertencia al registrar notificación WhatsApp en Supabase:', err);
  }

  // Abrir WhatsApp en nueva pestaña
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }

  return { success: true, url };
}

import { supabase } from '../lib/supabase';

interface EmailQuotePayload {
  toEmail: string;
  clientName: string;
  bookingCode: string;
  packageName: string;
  guestCount: number;
  eventDate: string;
  eventTime?: string;
  locationZone: string;
  setupTheme?: string;
  terraceFurniture?: string;
  drinkCharms?: string;
  addons?: string[];
  signagePhrase?: string;
  cotizacionId?: string;
}

/**
 * Envía la confirmación de la solicitud de presupuesto.
 * El correo lo arma y lo envía el servidor (/api/send-email): llega al correo
 * que escribió el cliente (cualquier proveedor) y una copia a la administración.
 * No se abre ninguna app de correo en el teléfono del cliente.
 */
export async function enviarCorreoCotizacionResend(data: EmailQuotePayload) {
  if (!data.toEmail || !data.toEmail.includes('@')) {
    return { success: false, reason: 'email_invalido' };
  }

  const registrar = async (estado: string, detalles?: unknown) => {
    try {
      await supabase.from('notificaciones').insert([{
        cotizacion_id: data.cotizacionId || null,
        tipo: 'email_confirmacion',
        proveedor: 'resend',
        destinatario: data.toEmail,
        asunto: `Solicitud ${data.bookingCode}`,
        estado,
        detalles: detalles ?? null,
      }]);
    } catch {
      /* el registro es opcional */
    }
  };

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote: data }),
    });
    const resJson = await response.json().catch(() => ({}));
    await registrar(response.ok ? 'enviado' : 'fallido', resJson);
    return { success: response.ok, data: resJson };
  } catch (err: any) {
    await registrar('fallido', { error: err?.message || String(err) });
    return { success: false, error: err };
  }
}

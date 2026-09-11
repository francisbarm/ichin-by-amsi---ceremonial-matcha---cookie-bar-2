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
 * Plantilla HTML de lujo para confirmación de cotización de ICHIN By AMSI
 */
export function generarHtmlCotizacion(data: EmailQuotePayload): string {
  const addonsList = (data.addons && data.addons.length > 0)
    ? data.addons.map(a => `<li style="margin-bottom: 6px; color: #4A5548;">• ${a}</li>`).join('')
    : '<li style="color: #7A8E77;">• Servicio estándar incluido en el paquete</li>';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tu Cotización ICHIN By AMSI</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 30px 15px; color: #2C3E35;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #EBE4D8;">
    
    <!-- Encabezado con Identidad de Marca -->
    <tr>
      <td style="background-color: #3C4A3C; padding: 40px 30px; text-align: center;">
        <h1 style="color: #FAF7F2; margin: 0; font-size: 26px; letter-spacing: 2px; font-weight: 700;">ICHIN</h1>
        <p style="color: #C8D6C4; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">By AMSI • Ceremonial Matcha & Cookie Bar</p>
      </td>
    </tr>

    <!-- Saludo y Código -->
    <tr>
      <td style="padding: 35px 35px 20px 35px;">
        <p style="font-size: 15px; color: #6D756A; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Solicitud Confirmada</p>
        <h2 style="font-size: 22px; color: #2C3E35; margin: 0 0 15px 0;">Hola, ${data.clientName}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4A5548; margin: 0;">
          Hemos recibido tu solicitud para llevar la experiencia sensorial de nuestro <strong>Carrito Ceremonial ICHIN</strong> a tu evento en Caracas. A continuación, el resumen de tu cotización:
        </p>
      </td>
    </tr>

    <!-- Tarjeta de Código de Cotización -->
    <tr>
      <td style="padding: 0 35px;">
        <div style="background-color: #F4EFE6; border: 1px solid #E3DAC9; border-radius: 14px; padding: 18px 20px; text-align: center; margin-bottom: 25px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #7A8E77; display: block; margin-bottom: 4px;">Código de Reserva</span>
          <strong style="font-size: 26px; color: #3C4A3C; letter-spacing: 3px;">${data.bookingCode}</strong>
        </div>
      </td>
    </tr>

    <!-- Ficha Técnica del Evento -->
    <tr>
      <td style="padding: 0 35px 30px 35px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Paquete Seleccionado:</td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #3C4A3C; text-align: right;">${data.packageName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Número de Invitados:</td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #3C4A3C; text-align: right;">${data.guestCount} personas</td>
          </tr>
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Fecha Estimada:</td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #3C4A3C; text-align: right;">${data.eventDate} ${data.eventTime ? `(${data.eventTime})` : ''}</td>
          </tr>
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Zona en Caracas:</td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #3C4A3C; text-align: right;">${data.locationZone}</td>
          </tr>
          ${data.terraceFurniture ? `
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Mobiliario & Toldos:</td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #3C4A3C; text-align: right;">${data.terraceFurniture}</td>
          </tr>` : ''}
          ${data.drinkCharms ? `
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Charms & Dijs en Bebidas (+$1/pz):</td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #3C4A3C; text-align: right;">${data.drinkCharms}</td>
          </tr>` : ''}
          ${data.signagePhrase ? `
          <tr style="border-bottom: 1px solid #EBE4D8;">
            <td style="padding: 10px 0; font-size: 13px; color: #7A8E77;">Frase en Pizarra de Bienvenida:</td>
            <td style="padding: 10px 0; font-size: 13px; font-style: italic; color: #3C4A3C; text-align: right;">"${data.signagePhrase}"</td>
          </tr>` : ''}
        </table>

        <!-- Extras Seleccionados -->
        <div style="margin-top: 20px;">
          <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #3C4A3C; margin: 0 0 8px 0;">Elementos y Extras Incluidos:</p>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5;">
            ${addonsList}
          </ul>
        </div>
      </td>
    </tr>

    <!-- Botón de Contacto por WhatsApp -->
    <tr>
      <td style="padding: 0 35px 35px 35px; text-align: center;">
        <p style="font-size: 13px; color: #6D756A; margin: 0 0 15px 0;">
          Nuestro concierge de eventos está listo para afinar la logística y confirmar tu fecha:
        </p>
        <a href="https://wa.me/584143260003?text=${encodeURIComponent(`Hola ICHIN By AMSI, recibí el correo con mi código de cotización ${data.bookingCode}. Me gustaría confirmar disponibilidad.`)}" 
           style="background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.25);">
          Hablar con un Concierge por WhatsApp
        </a>
      </td>
    </tr>

    <!-- Footer del Correo -->
    <tr>
      <td style="background-color: #F8F5EE; padding: 25px 35px; text-align: center; border-top: 1px solid #EBE4D8;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #7A8E77;"><strong>ICHIN By AMSI</strong> • Ceremonial Matcha & Cookie Bar</p>
        <p style="margin: 0; font-size: 11px; color: #9AABA0;">Caracas, Venezuela • WhatsApp: +58 414 3260003</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Servicio para enviar correo de confirmación usando Resend y registrarlo en Supabase
 * Envía la confirmación al cliente y la notificación de reserva al Administrador
 */
export async function enviarCorreoCotizacionResend(data: EmailQuotePayload) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || 'ICHIN By AMSI <onboarding@resend.dev>';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'eventos.ichin@gmail.com';

  if (!data.toEmail || !data.toEmail.includes('@')) {
    console.warn('Correo de destinatario no válido o ausente:', data.toEmail);
    return { success: false, reason: 'email_invalido' };
  }

  const html = generarHtmlCotizacion(data);
  const asunto = `🍵 Tu Cotización ICHIN By AMSI [${data.bookingCode}]`;

  // Destinatarios: Cliente + Administrador
  const recipients = [data.toEmail];
  if (adminEmail && adminEmail.includes('@') && adminEmail !== data.toEmail) {
    recipients.push(adminEmail);
  }

  // Si no hay API Key de Resend configurada aún
  if (!apiKey || apiKey === 're_tu_resend_api_key_aqui') {
    console.info(`[Resend Simulado] No se detectó VITE_RESEND_API_KEY activa. Correo simulado para: ${recipients.join(', ')}`);
    
    // Registrar en Supabase como pendiente de configuración
    await supabase.from('notificaciones').insert([{
      cotizacion_id: data.cotizacionId || null,
      tipo: 'email_confirmacion',
      proveedor: 'resend',
      destinatario: data.toEmail,
      asunto: asunto,
      estado: 'registrado_en_bd',
      detalles: { 
        bookingCode: data.bookingCode, 
        destinatarios: recipients,
        mensaje: 'Guardado exitosamente en base de datos Supabase.' 
      }
    }]);

    return { success: true, simulado: true, recipients };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject: asunto,
        html: html
      })
    });

    const resJson = await response.json();

    if (response.ok) {
      // Registrar envío exitoso en Supabase
      await supabase.from('notificaciones').insert([{
        cotizacion_id: data.cotizacionId || null,
        tipo: 'email_confirmacion',
        proveedor: 'resend',
        destinatario: data.toEmail,
        asunto: asunto,
        estado: 'enviado',
        detalles: resJson
      }]);
      return { success: true, data: resJson };
    } else {
      console.error('Error devuelto por la API de Resend:', resJson);
      await supabase.from('notificaciones').insert([{
        cotizacion_id: data.cotizacionId || null,
        tipo: 'email_confirmacion',
        proveedor: 'resend',
        destinatario: data.toEmail,
        asunto: asunto,
        estado: 'fallido',
        error_mensaje: JSON.stringify(resJson)
      }]);
      return { success: false, error: resJson };
    }
  } catch (err: any) {
    console.error('Error de red al conectar con Resend:', err);
    await supabase.from('notificaciones').insert([{
      cotizacion_id: data.cotizacionId || null,
      tipo: 'email_confirmacion',
      proveedor: 'resend',
      destinatario: data.toEmail,
      asunto: asunto,
      estado: 'fallido',
      error_mensaje: err?.message || String(err)
    }]);
    return { success: false, error: err };
  }
}

/**
 * Genera un enlace mailto pre-redactado para enviar la solicitud de cotización por correo
 */
export function generarMailtoCotizacion(data: {
  bookingCode: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  packageName: string;
  guestCount: number;
  eventDate: string;
  eventTime?: string;
  locationZone: string;
  furnitureText?: string;
  charmsText?: string;
  signagePhrase?: string;
  addons?: string[];
  specialRequests?: string;
}): string {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'eventos.ichin@gmail.com';
  const subject = encodeURIComponent(`Solicitud de Cotización ICHIN By AMSI [${data.bookingCode}] - ${data.clientName}`);
  
  const bodyText = `Hola equipo de ICHIN By AMSI,\n\n` +
    `Deseo solicitar la confirmación de fecha y propuesta formal para llevar el Carrito Móvil a mi evento:\n\n` +
    `📋 DATOS DE LA SOLICITUD:\n` +
    `• Código de Reserva: ${data.bookingCode}\n` +
    `• Anfitrión(a) / Contacto: ${data.clientName}\n` +
    `• Teléfono: ${data.clientPhone}\n` +
    (data.clientEmail ? `• Correo Electrónico: ${data.clientEmail}\n` : '') +
    `• Paquete Seleccionado: ${data.packageName}\n` +
    `• Número de Invitados: ${data.guestCount} personas\n` +
    `• Fecha Estimada: ${data.eventDate} ${data.eventTime ? `(${data.eventTime})` : ''}\n` +
    `• Zona en Caracas: ${data.locationZone}\n` +
    (data.furnitureText ? `• Mobiliario & Toldos: ${data.furnitureText}\n` : '') +
    (data.charmsText ? `• Personalización de Bebidas (Charms): ${data.charmsText}\n` : '') +
    (data.signagePhrase ? `• Frase en Pizarra de Entrada: "${data.signagePhrase}"\n` : '') +
    (data.addons && data.addons.length > 0 ? `• Elementos Incluidos:\n  - ${data.addons.join('\n  - ')}\n` : '') +
    (data.specialRequests ? `• Notas Adicionales / Locación: ${data.specialRequests}\n` : '') +
    `\nQuedo atento(a) a su confirmación y disponibilidad. ¡Muchas gracias!`;

  return `mailto:${adminEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
}

/**
 * Genera un enlace mailto pre-redactado para enviar un pedido del menú/carrito por correo
 */
export function generarMailtoPedidoCarrito(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  eventType: string;
  eventZone: string;
  eventDate?: string;
  itemsList: string;
  totalEstimated: number;
}): string {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'eventos.ichin@gmail.com';
  const subject = encodeURIComponent(`Solicitud de Pedido de Bebidas y Dulces - ${data.customerName || 'Cliente Web'}`);
  
  const bodyText = `Hola equipo de ICHIN By AMSI,\n\n` +
    `Me gustaría solicitar la presencia del Carrito Móvil con el siguiente pedido para mi evento:\n\n` +
    `🍸 MENÚ SELECCIONADO:\n` +
    `${data.itemsList}\n\n` +
    `📍 DETALLES DEL EVENTO:\n` +
    `• Anfitrión(a): ${data.customerName || 'No indicado'}\n` +
    (data.customerEmail ? `• Correo Electrónico: ${data.customerEmail}\n` : '') +
    (data.customerPhone ? `• Teléfono de Contacto: ${data.customerPhone}\n` : '') +
    `• Tipo de Evento: ${data.eventType}\n` +
    `• Zona en Caracas: ${data.eventZone}\n` +
    (data.eventDate ? `• Fecha tentativa: ${data.eventDate}\n` : '') +
    `\n¿Podrían indicarme disponibilidad de agenda y confirmar la cotización? ¡Muchas gracias!`;

  return `mailto:${adminEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
}


/**
 * ICHIN by/ Amsi — envío de confirmaciones de solicitud de presupuesto.
 *
 * Seguridad:
 * - La clave de Resend vive solo en el servidor (RESEND_API_KEY en Vercel).
 * - El navegador NO envía HTML, remitente ni destinatarios libres: solo los datos
 *   de la solicitud. El servidor arma el correo con la plantilla oficial, así el
 *   endpoint no puede usarse para mandar correos arbitrarios con el dominio.
 * - Todo texto del cliente se escapa antes de insertarse en el HTML.
 *
 * Envía dos correos:
 *   1) Al cliente (al correo que escribió, cualquiera que sea), con respuesta a ICHIN.
 *   2) A la administración, con respuesta directa al cliente.
 */

const MAX = { short: 120, medium: 300, long: 1000 };
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]{1,255}\.[a-z]{2,}$/i;

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface QuoteData {
  toEmail: string;
  clientName: string;
  bookingCode: string;
  packageName: string;
  guestCount: number;
  eventDate: string;
  eventTime: string;
  locationZone: string;
  terraceFurniture: string;
  drinkCharms: string;
  addons: string[];
  signagePhrase: string;
}

function parseQuote(raw: any): QuoteData | null {
  if (!raw || typeof raw !== 'object') return null;
  const toEmail = clean(raw.toEmail, 254).toLowerCase();
  if (!EMAIL_RE.test(toEmail)) return null;
  const bookingCode = clean(raw.bookingCode, 20);
  if (!/^ICH-[A-Z0-9-]{2,16}$/i.test(bookingCode)) return null;
  const guests = Math.max(1, Math.min(5000, Math.round(Number(raw.guestCount) || 0)));
  const addons = Array.isArray(raw.addons)
    ? raw.addons.slice(0, 12).map((a: unknown) => clean(a, MAX.medium)).filter(Boolean)
    : [];
  return {
    toEmail,
    clientName: clean(raw.clientName, MAX.short) || 'Cliente',
    bookingCode,
    packageName: clean(raw.packageName, MAX.short),
    guestCount: guests,
    eventDate: clean(raw.eventDate, 40),
    eventTime: clean(raw.eventTime, 20),
    locationZone: clean(raw.locationZone, MAX.short),
    terraceFurniture: clean(raw.terraceFurniture, MAX.medium),
    drinkCharms: clean(raw.drinkCharms, MAX.medium),
    addons,
    signagePhrase: clean(raw.signagePhrase, MAX.short),
  };
}

function row(label: string, value: string, italic = false): string {
  if (!value) return '';
  return `<tr>
      <td style="padding:10px 0;font-size:13px;color:#7A8E77;border-bottom:1px solid #F1ECE1;">${label}</td>
      <td style="padding:10px 0;font-size:13px;font-weight:bold;color:#2C3E35;text-align:right;border-bottom:1px solid #F1ECE1;${italic ? 'font-style:italic;font-weight:normal;' : ''}">${value}</td>
    </tr>`;
}

function renderQuoteHtml(d: QuoteData, forAdmin: boolean): string {
  const name = esc(d.clientName);
  const code = esc(d.bookingCode);
  const addons = d.addons.length
    ? d.addons.map((a) => `<li style="margin-bottom:6px;color:#4A5548;">${esc(a)}</li>`).join('')
    : '<li style="color:#7A8E77;">Servicio del paquete seleccionado</li>';
  const waText = encodeURIComponent(`Hola ICHIN, envié mi solicitud de presupuesto ${d.bookingCode}.`);
  const intro = forAdmin
    ? `<p style="font-size:14px;line-height:1.6;color:#4A5548;margin:0;">Nueva solicitud de presupuesto desde ichinmatcha.com. Responde este correo para escribirle directamente a <strong>${name}</strong> (${esc(d.toEmail)}).</p>`
    : `<p style="font-size:14px;line-height:1.6;color:#4A5548;margin:0;">Gracias por pensar en ICHIN para tu evento. Recibimos tu solicitud y nuestro equipo está preparando tu <strong>presupuesto personalizado</strong>. Te lo enviaremos muy pronto por este medio o por WhatsApp.</p>`;

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICHIN · Solicitud ${code}</title></head>
<body style="margin:0;padding:28px 12px;background:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2C3E35;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #EBE4D8;">
    <tr><td style="background:#2C3E35;padding:36px 30px;text-align:center;">
      <img src="https://ichinmatcha.com/icons/icon-192.png" width="56" height="56" alt="ICHIN" style="border-radius:14px;display:inline-block;">
      <h1 style="color:#F3EEE3;margin:14px 0 0;font-size:24px;letter-spacing:3px;font-weight:700;">ICHIN</h1>
      <p style="color:#C8D6C4;margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Ceremonial Matcha &amp; Cookie Bar</p>
    </td></tr>
    <tr><td style="padding:32px 34px 8px;">
      <h2 style="font-size:21px;color:#2C3E35;margin:0 0 14px;">${forAdmin ? 'Nueva solicitud' : `Hola, ${name}`}</h2>
      ${intro}
      <div style="margin:22px 0;padding:16px;background:#FAF7F2;border:1px solid #EBE4D8;border-radius:14px;text-align:center;">
        <span style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7A8E77;">Código de solicitud</span>
        <strong style="font-size:24px;letter-spacing:3px;color:#2C3E35;">${code}</strong>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Paquete', esc(d.packageName))}
        ${row('Invitados', `${d.guestCount} personas`)}
        ${row('Fecha', esc(`${d.eventDate}${d.eventTime ? ` · ${d.eventTime}` : ''}`))}
        ${row('Zona', esc(d.locationZone))}
        ${row('Mobiliario', esc(d.terraceFurniture))}
        ${row('Charms en bebidas', esc(d.drinkCharms))}
        ${row('Frase en pizarra', d.signagePhrase ? `“${esc(d.signagePhrase)}”` : '', true)}
      </table>
      <p style="font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#2C3E35;margin:22px 0 8px;">Elementos solicitados</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.5;">${addons}</ul>
    </td></tr>
    ${forAdmin ? '' : `<tr><td style="padding:26px 34px 34px;text-align:center;">
      <a href="https://wa.me/584143260003?text=${waText}" style="background:#2C3E35;color:#F3EEE3;text-decoration:none;padding:13px 26px;border-radius:30px;font-weight:bold;font-size:14px;display:inline-block;">Escríbenos por WhatsApp</a>
    </td></tr>`}
    <tr><td style="background:#F8F5EE;padding:22px 34px;text-align:center;border-top:1px solid #EBE4D8;">
      <p style="margin:0 0 4px;font-size:12px;color:#7A8E77;"><strong>ICHIN by/ Amsi</strong> · ichinmatcha.com</p>
      <p style="margin:0;font-size:11px;color:#9AABA0;">Caracas, Venezuela · WhatsApp +58 414 3260003</p>
    </td></tr>
  </table>
</body></html>`;
}

async function sendViaResend(apiKey: string, payload: Record<string, unknown>) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const origin = String(req.headers?.origin || '');
  if (origin && !/^https:\/\/(www\.)?ichinmatcha\.com$|^https:\/\/[a-z0-9-]+\.vercel\.app$|^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Envío de correo no configurado' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const quote = parseQuote(body?.quote);
  if (!quote) {
    return res.status(400).json({ error: 'Datos de solicitud inválidos' });
  }

  const from = process.env.RESEND_FROM_EMAIL || 'ICHIN Matcha <hola@ichinmatcha.com>';
  const admin = process.env.ADMIN_EMAIL || 'amsi.group@gmail.com';

  try {
    const [client, internal] = await Promise.all([
      sendViaResend(apiKey, {
        from,
        to: [quote.toEmail],
        reply_to: admin,
        subject: `Recibimos tu solicitud · ICHIN ${quote.bookingCode}`,
        html: renderQuoteHtml(quote, false),
      }),
      sendViaResend(apiKey, {
        from,
        to: [admin],
        reply_to: quote.toEmail,
        subject: `Nueva solicitud de presupuesto ${quote.bookingCode} · ${quote.clientName}`,
        html: renderQuoteHtml(quote, true),
      }),
    ]);
    const ok = client.ok && internal.ok;
    return res.status(ok ? 200 : 502).json({
      ok,
      cliente: { ok: client.ok, status: client.status },
      administracion: { ok: internal.ok, status: internal.status },
    });
  } catch (err: any) {
    return res.status(502).json({ error: 'No se pudo contactar el servicio de correo' });
  }
}

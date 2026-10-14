/**
 * Fudi Club Worker
 * Sirve el sitio estático de fudiclub.shop usando Workers Assets.
 * Maneja el redirect www → apex y el endpoint de cotizaciones corporativas.
 */

export async function handleCorporateQuote(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const {
      nombre = '',
      empresa = '',
      email = '',
      telefono = '',
      ocasion = 'No especificado',
      cantidad = '1 a 4',
      entrega = 'A coordinar',
      detalles = 'Sin detalles adicionales',
    } = data;

    if (!nombre || !empresa || !email) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos (nombre, empresa, email)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = env?.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : '');
    const adminEmails = env?.ADMIN_NOTIFICATION_EMAIL
      ? [env.ADMIN_NOTIFICATION_EMAIL]
      : ['robloz.ingrid@gmail.com', 'ingrid.robles@hotmail.com'];
    const fromEmail = env?.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';

    const cleanPhone = telefono.replace(/[^0-9]/g, '');
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#fff4bd; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px; background:#ffffff; border:3px solid #000; border-radius:12px; box-shadow:6px 6px 0px #000; overflow:hidden;">
          <tr>
            <td style="background-color:#c79fef; padding:22px 20px; border-bottom:3px solid #000; text-align:center;">
              <h1 style="margin:0; font-size:22px; color:#000;">🏢 Nueva Cotización Empresas</h1>
              <p style="margin:6px 0 0 0; font-size:14px; color:#222;">Fudi Club B2B</p>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 22px;">
              <table width="100%" style="font-size:15px; line-height:1.6; color:#222;">
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; width:40%; font-weight:bold;">Empresa:</td><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">${empresa}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Contacto:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${nombre}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Email Corporativo:</td><td style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#0066cc; font-weight:bold;">${email}</a></td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Teléfono / WhatsApp:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${telefono} ${waLink ? `(<a href="${waLink}" style="color:#25D366; font-weight:bold;" target="_blank">WhatsApp</a>)` : ''}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Motivo / Ocasión:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${ocasion}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Cantidad estimada:</td><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">${cantidad} boxes</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Modalidad entrega:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${entrega}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold; vertical-align:top;">Detalles / Fecha:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${detalles}</td></tr>
              </table>
              <div style="margin-top:24px; text-align:center;">
                <a href="mailto:${email}?subject=Propuesta%20Fudi%20Club%20Empresas%20para%20${encodeURIComponent(empresa)}" style="display:inline-block; background:#d1ff5e; color:#000; font-weight:bold; text-decoration:none; padding:12px 24px; border:2px solid #000; border-radius:6px; box-shadow:3px 3px 0px #000;">
                  ✉️ Responder a ${nombre}
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: adminEmails,
          reply_to: email,
          subject: `🏢 Nueva Cotización Empresas: ${empresa} (${nombre}) - ${cantidad} boxes`,
          html,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error enviando con Resend:', errorText);
      }
    }

    // Sincronizar en Google Sheets (pestaña "Leads Empresas") a través de Supabase Edge Function sync-to-sheets
    const functionsUrl = env?.VITE_SUPABASE_FUNCTIONS_URL || 'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1';
    const anonKey = env?.VITE_SUPABASE_ANON_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || '';
    try {
      await fetch(`${functionsUrl}/sync-to-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
        },
        body: JSON.stringify({
          type: 'corporate_quote',
          record: {
            nombre,
            empresa,
            email,
            telefono,
            ocasion,
            cantidad,
            entrega,
            detalles,
            created_at: new Date().toISOString(),
          },
        }),
      });
    } catch (sheetErr) {
      console.error('Error sincronizando con Google Sheets:', sheetErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error al procesar la cotización' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirigir www.fudiclub.shop → fudiclub.shop (301 permanente)
    if (url.hostname === 'www.fudiclub.shop') {
      return Response.redirect(
        `https://fudiclub.shop${url.pathname}${url.search}`,
        301
      );
    }

    // Endpoint de cotizaciones corporativas
    if (url.pathname === '/api/cotizacion') {
      return handleCorporateQuote(request, env);
    }

    // Servir assets estáticos del build de Vite (dist/)
    return env.ASSETS.fetch(request);
  },
};

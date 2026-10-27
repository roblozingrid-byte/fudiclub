import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail, createContact } from '../_shared/resend.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const {
      nombre = '',
      empresa = '',
      email = '',
      telefono = '',
      ocasion = 'No especificado',
      cantidad = '1 a 4',
      entrega = 'A coordinar',
      detalles = 'Sin detalles adicionales',
    } = body

    if (!nombre || !empresa || !email) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos (nombre, empresa, email)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'robloz.ingrid@gmail.com'
    const cleanPhone = telefono.replace(/[^0-9]/g, '')
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : ''

    const emailHtml = `
<!DOCTYPE html>
<html>
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
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Teléfono / WhatsApp:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${telefono} ${waLink ? `(<a href="${waLink}" style="color:#25D366; font-weight:bold;">WhatsApp</a>)` : ''}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Motivo / Ocasión:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${ocasion}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Cantidad estimada:</td><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">${cantidad} boxes</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #eee; font-weight:bold;">Entrega:</td><td style="padding:8px 0; border-bottom:1px solid #eee;">${entrega}</td></tr>
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
    `

    // Enviar notificación por correo
    await sendEmail({
      to: adminEmail,
      subject: `🏢 Nueva Cotización Empresas: ${empresa} (${nombre}) - ${cantidad} boxes`,
      html: emailHtml,
    })

    // Guardar también como lead en Supabase waitlist para no perder el registro
    try {
      const supabase = getSupabaseClient()
      const cleanEmail = email.trim().toLowerCase()
      await supabase
        .from('waitlist')
        .insert({
          email: cleanEmail,
          note: `Empresas: ${empresa} | ${nombre} | Tel: ${telefono} | Cant: ${cantidad} | ${ocasion}`,
        })
    } catch (dbErr) {
      console.warn('Error guardando en waitlist:', dbErr)
    }

    // Sincronizar contacto en Resend (Segmento: Empresas)
    try {
      const nameParts = nombre.trim().split(' ')
      const firstName = nameParts[0] || nombre
      const lastName = nameParts.slice(1).join(' ') || empresa
      await createContact({
        email,
        firstName,
        lastName,
        audienceId: '5465a8ed-8a31-4f0e-b936-95a55d40fe60', // Segmento Empresas en Resend
      })
    } catch (resendContactErr) {
      console.warn('Error sincronizando contacto en Resend:', resendContactErr)
    }

    // Sincronizar en Google Sheets (pestaña "Leads Empresas")
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://oxoodwpkbprkyenxiqsf.supabase.co'
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      await fetch(`${supabaseUrl}/functions/v1/sync-to-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(serviceKey ? { Authorization: `Bearer ${serviceKey}` } : {}),
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
      })
    } catch (sheetErr) {
      console.warn('Error sincronizando con Google Sheets desde corporate-quote:', sheetErr)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error en corporate-quote:', error)
    return new Response(JSON.stringify({ error: error.message || 'Error del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

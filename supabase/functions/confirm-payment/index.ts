import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { sendEmail } from '../_shared/resend.ts'
import { generateConfirmationToken } from '../_shared/token.ts'
import { buildPaymentConfirmedEmail } from '../_shared/email-templates.ts'

function renderHtmlResponse(title: string, message: string, detailsHtml: string, isSuccess: boolean) {
  const bgColor = isSuccess ? '#d1ff5e' : '#ff6b6b'
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Fudi Club</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f4f0;
          margin: 0;
          padding: 30px 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
        }
        .card {
          max-width: 520px;
          width: 100%;
          background-color: ${bgColor};
          border: 4px solid #111;
          box-shadow: 8px 8px 0px #111;
          border-radius: 12px;
          padding: 30px;
          box-sizing: border-box;
          text-align: center;
        }
        .inner {
          background-color: #fff;
          border: 3px solid #111;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: left;
        }
        h1 {
          font-size: 24px;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          color: #111;
        }
        p {
          font-size: 15px;
          color: #222;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" style="max-width: 130px; margin-bottom: 15px; display: inline-block;" />
        <h1>${title}</h1>
        <p style="font-weight: 600;">${message}</p>
        <div class="inner">
          ${detailsHtml}
        </div>
        <p style="font-size: 12px; color: #444; margin-top: 15px;">Fudi Club Panel de Control &bull; Administración</p>
      </div>
    </body>
    </html>
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const orderId = url.searchParams.get('order_id')
  const token = url.searchParams.get('token')

  if (!orderId || !token) {
    return new Response(
      renderHtmlResponse('Acceso Inválido', 'Faltan parámetros requeridos.', '<p>No se especificó la orden o el token de seguridad.</p>', false),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
    )
  }

  const secret = Deno.env.get('ADMIN_CONFIRM_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fudi-secret'
  const expectedToken = await generateConfirmationToken(orderId, secret)

  if (token !== expectedToken) {
    return new Response(
      renderHtmlResponse('Enlace Inválido o Expirado', 'El token de seguridad no coincide.', '<p>Por seguridad, solo se puede confirmar desde el enlace oficial enviado al correo del administrador.</p>', false),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 403 }
    )
  }

  const supabase = getSupabaseClient()

  // Buscar el pedido
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, customers(name, email)')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return new Response(
      renderHtmlResponse('Pedido No Encontrado', 'No se encontró la orden en la base de datos.', `<p>ID buscado: <code>${orderId}</code></p>`, false),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 }
    )
  }

  const friendlyId = order.friendly_id || order.id
  const customerName = order.customer_name || order.customers?.name || 'Cliente'
  const customerEmail = order.customer_email || order.customers?.email || ''
  const formattedTotal = Number(order.total || 0).toLocaleString('es-AR')

  // Si ya estaba pagado
  if (order.status === 'paid' || order.status === 'approved') {
    const details = `
      <p><strong>ID Pedido:</strong> <code>${friendlyId}</code></p>
      <p><strong>Cliente:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Total:</strong> $${formattedTotal}</p>
      <p><strong>Estado Actual:</strong> <span style="background-color: #d1ff5e; padding: 2px 6px; border-radius: 4px; font-weight: bold;">PAGADO / APROBADO</span></p>
    `
    return new Response(
      renderHtmlResponse('Pedido Ya Confirmado ⚠️', 'Este pedido ya había sido marcado como pagado previamente.', details, true),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
    )
  }

  // Actualizar estado a 'paid'
  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (updateErr) {
    console.error('Error actualizando orden:', updateErr)
    return new Response(
      renderHtmlResponse('Error al Actualizar', 'No se pudo actualizar el estado en la base de datos.', `<p>${updateErr.message}</p>`, false),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
    )
  }

  // Enviar email de confirmación automática al cliente
  if (customerEmail) {
    try {
      await sendEmail({
        to: customerEmail,
        subject: '🎉 ¡Pago confirmado! Tu Mystery Box está asegurada 📦',
        html: buildPaymentConfirmedEmail({
          customerName,
          friendlyId,
          edition: order.edition || 'Mystery Box',
          formattedTotal,
          shippingAddress: order.shipping_address || 'Tu dirección registrada',
          plan: order.plan,
          isQuarterly: order.plan === 'quarterly',
          quantity: order.quantity,
          totalBoxes: order.total_boxes
        })
      })
    } catch (emailErr) {
      console.error('Error enviando email de confirmación al cliente:', emailErr)
    }
  }

  const successDetails = `
    <p><strong>ID Pedido:</strong> <span style="font-family: monospace; font-size: 16px; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${friendlyId}</span></p>
    <p><strong>Cliente:</strong> ${customerName}</p>
    <p><strong>Email:</strong> ${customerEmail}</p>
    <p><strong>Total:</strong> <strong style="color: #059669;">$${formattedTotal}</strong></p>
    <p><strong>Nuevo Estado:</strong> <span style="background-color: #d1ff5e; padding: 3px 8px; border: 1px solid #111; font-weight: bold; border-radius: 4px;">PAGADO (paid)</span></p>
    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 12px 0;" />
    <p style="font-size: 13px; color: #444; margin: 0;">✅ El cliente acaba de recibir automáticamente su correo de confirmación de pago.</p>
  `

  return new Response(
    renderHtmlResponse('¡Pago Confirmado! ✅', 'La orden fue actualizada y ya no recibirá recordatorios de pago.', successDetails, true),
    { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
  )
})

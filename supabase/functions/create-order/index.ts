import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { sendEmail } from '../_shared/resend.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, name, address, cp, allergies, plan, payment_method, edition, quantity } = body

    if (!email || !name || !address || !cp || !plan || !payment_method) {
      throw new Error('Missing required fields')
    }

    const supabase = getSupabaseClient()

    // 1. Insert or update customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        { email, name, address, cp, allergies },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (customerError) throw customerError

    // 2. Calculate Total
    const qty = quantity ? parseInt(quantity, 10) : 1
    const isQuarterly = plan === 'quarterly'
    const subtotal = isQuarterly ? (127900 * qty) : (44900 * qty)
    
    let deliveryFee = 0 // Shipping is 100% free
    
    const totalBoxes = qty * (isQuarterly ? 3 : 1)
    const totalDeliveryFee = deliveryFee * totalBoxes
    const total = subtotal + totalDeliveryFee

    // 3. Create Order
    const monthStr = new Date().toLocaleDateString('es-AR', { month: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' });
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const friendlyId = `FUDI-${monthStr}-${randomCode}`;

    // Format edition: if quarterly, ensure all 3 covered months are represented
    const monthsList = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    let finalEdition = edition;
    if (isQuarterly) {
      let baseMonth = '';
      for (const m of monthsList) {
        if (edition?.includes(m)) {
          baseMonth = m;
          break;
        }
      }
      if (!baseMonth) {
        const argDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
        let mIdx = argDate.getMonth();
        if (argDate.getDate() > 5) mIdx = (mIdx + 1) % 12;
        baseMonth = monthsList[mIdx];
      }
      const bIdx = monthsList.indexOf(baseMonth);
      const m2 = monthsList[(bIdx + 1) % 12];
      const m3 = monthsList[(bIdx + 2) % 12];
      finalEdition = `${baseMonth} - ${m2} - ${m3}`;
    }

    const orderPayload: any = {
      customer_id: customer.id,
      customer_name: name,
      customer_email: email,
      status: 'pending',
      plan,
      payment_method,
      total,
      edition: finalEdition,
      shipping_address: `${address} (CP: ${cp})`,
      friendly_id: friendlyId,
      quantity: qty,
      total_boxes: totalBoxes,
    }

    let { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    // Fallback if quantity or total_boxes columns do not exist yet in schema
    if (orderError && (orderError.message?.includes('quantity') || orderError.message?.includes('total_boxes'))) {
      delete orderPayload.quantity;
      delete orderPayload.total_boxes;
      const retry = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();
      order = retry.data;
      orderError = retry.error;
    }

    if (orderError) throw orderError

    // 4. Send Admin Notification Email
    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'robloz.ingrid@gmail.com';
    const planName = isQuarterly ? 'Plan Trimestral' : 'Compra Única';
    const paymentMethodLabel = payment_method === 'transfer' ? 'Transferencia Bancaria 📲' : 'Mercado Pago 💳';
    const formattedTotal = total.toLocaleString('es-AR');

    try {
      await sendEmail({
        to: adminEmail,
        subject: `🔔 ¡Nuevo Pedido ${friendlyId}! - ${name} ($${formattedTotal})`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111; }
            </style>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffd84d; padding: 25px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" style="max-width: 130px; margin-bottom: 10px; display: inline-block;" />
                <h1 style="font-size: 22px; font-weight: 700; text-transform: uppercase; margin: 0; color: #111;">¡Nuevo Pedido Recibido! 📦✨</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #222;">Se acaba de registrar una compra en la web.</p>
              </div>

              <div style="background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 6px 0; font-size: 15px;"><strong>ID Pedido:</strong> <span style="font-family: monospace; font-size: 16px; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${friendlyId}</span></p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Cliente:</strong> ${name}</p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Dirección:</strong> ${address} (CP: ${cp})</p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Alergias / Restricciones:</strong> ${allergies || 'Ninguna'}</p>
                
                <hr style="border: 0; border-top: 2px dashed #111; margin: 15px 0;" />
                
                <p style="margin: 6px 0; font-size: 15px;"><strong>Tipo de Compra:</strong> <span style="background-color: ${isQuarterly ? '#d1ff5e' : '#4ebaba'}; padding: 3px 8px; border: 1px solid #111; font-weight: bold; border-radius: 4px;">${planName}</span></p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Edición / Meses:</strong> <strong>${finalEdition}</strong></p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Cantidad:</strong> <strong>${qty}</strong> pack(s) &rarr; <strong>${totalBoxes} box(es) en total</strong> (${qty} por mes)</p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Método de Pago:</strong> <strong>${paymentMethodLabel}</strong></p>
                <p style="margin: 6px 0; font-size: 18px;"><strong>Total a Cobrar:</strong> <strong style="color: #059669;">$${formattedTotal}</strong></p>
              </div>

              ${payment_method === 'transfer' ? `
              <div style="background-color: #d1ff5e; padding: 15px; border: 3px solid #111; border-radius: 6px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; font-weight: bold; font-size: 15px;">📲 Pago por Transferencia Bancaria</p>
                <p style="margin: 5px 0 0 0; font-size: 13px;">El cliente recibió los datos de CBU/Alias y el botón directo para enviar su comprobante por WhatsApp.</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #555;">
                <p style="margin: 0;">Fudi Club &bull; Notificación Automática de Pedido</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
    } catch (adminEmailErr) {
      console.error('Error enviando notificación al admin:', adminEmailErr);
    }

    // 5. Payment Logic
    if (payment_method === 'mercado_pago') {
      const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
      if (!MP_ACCESS_TOKEN) throw new Error('Missing MP_ACCESS_TOKEN')

      const preferenceBody = {
        items: [
          {
            title: `Fudi Club Box - ${isQuarterly ? 'Plan Trimestral' : 'Compra Única'}`,
            quantity: 1,
            unit_price: total
          }
        ],
        payer: { email },
        external_reference: order.id,
        back_urls: {
          success: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=success`,
          failure: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=failure`,
          pending: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=pending`
        },
        auto_return: 'approved'
      }

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify(preferenceBody)
      })

      const mpData = await mpRes.json()
      if (!mpRes.ok) throw new Error('Error creating MP preference')

      // Save preference ID
      await supabase
        .from('orders')
        .update({ mercadopago_preference_id: mpData.id })
        .eq('id', order.id)

      return new Response(
        JSON.stringify({ init_point: mpData.init_point, orderId: friendlyId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (payment_method === 'transfer') {
      // Transfer logic: send email instructions
      await sendEmail({
        to: email,
        subject: 'Instrucciones de Transferencia',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=Space+Grotesk:wght@400;600;700&display=swap');
              body { font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111; }
              .container { max-width: 600px; margin: 0 auto; background-color: #4ebaba; padding: 30px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px; font-family: 'Space Grotesk', Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { font-family: 'Corben', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
              .box { background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 4px; margin: 20px 0; font-family: 'Space Grotesk', Arial, sans-serif; }
              .box p { margin: 10px 0; font-size: 16px; font-family: 'Space Grotesk', Arial, sans-serif; }
              .footer { text-align: center; font-size: 14px; font-weight: bold; margin-top: 20px; font-family: 'Space Grotesk', Arial, sans-serif; }
            </style>
          </head>
          <body style="font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #4ebaba; padding: 30px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px; font-family: 'Space Grotesk', Arial, sans-serif;">
              <div class="header" style="text-align: center; margin-bottom: 20px;">
                <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" style="max-width: 150px; margin-bottom: 15px; display: inline-block;" />
                <h1 style="font-family: 'Corben', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; margin: 0;">¡Hola ${name}! 📦</h1>
              </div>
              <p style="font-size: 18px; font-weight: bold; text-align: center; font-family: 'Space Grotesk', Arial, sans-serif;">Has iniciado la reserva de tu Fudi Club Box.</p>
              
              <div class="box" style="background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 4px; margin: 20px 0; font-family: 'Space Grotesk', Arial, sans-serif;">
                <p style="margin-top: 0; font-family: 'Space Grotesk', Arial, sans-serif;"><strong>Para confirmar tu pedido, realiza la transferencia con los siguientes datos y envianos tu comprobante:</strong></p>
                <p style="font-family: 'Space Grotesk', Arial, sans-serif;">Alias: <strong>roblesingrid.bna</strong></p>
                <p style="font-family: 'Space Grotesk', Arial, sans-serif;">CBU: <strong>0110036530003610750715</strong></p>
                <p style="margin-bottom: 0; font-family: 'Space Grotesk', Arial, sans-serif;">Monto a transferir: <strong>$${total}</strong></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0; font-family: 'Space Grotesk', Arial, sans-serif;">
                <a href="https://wa.me/5491139264426?text=Hola,%20soy%20${name},%20adjunto%20comprobante%20de%20mi%20Mystery%20Box" style="font-family: 'Space Grotesk', Arial, sans-serif; background-color: #d1ff5e; color: #111; padding: 15px 25px; text-decoration: none; font-weight: bold; border: 3px solid #111; border-radius: 6px; display: inline-block; box-shadow: 4px 4px 0px #111;">
                  📲 Enviar Comprobante por WhatsApp
                </a>
                <p style="margin-top: 15px; font-size: 14px; font-weight: bold; font-family: 'Space Grotesk', Arial, sans-serif;">(O envíalo manualmente al +54 9 11 3926-4426)</p>
              </div>
              
              <div class="footer" style="text-align: center; font-size: 14px; font-weight: bold; margin-top: 20px; font-family: 'Space Grotesk', Arial, sans-serif;">
                <p>¡Gracias por sumarte al club!</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      return new Response(
        JSON.stringify({ success: true, orderId: friendlyId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid payment method')

  } catch (error: any) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

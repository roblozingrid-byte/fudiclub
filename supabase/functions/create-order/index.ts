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
    const pricePerBox = isQuarterly ? 33250 : 35000
    const subtotal = qty * pricePerBox * (isQuarterly ? 3 : 1)
    
    const cpNum = parseInt(cp) || 0
    let deliveryFee = 0
    if (cpNum >= 1000 && cpNum <= 1499) deliveryFee = 2500
    else if (cpNum >= 1600 && cpNum <= 1900) deliveryFee = 4000
    else if (cpNum > 0) deliveryFee = 6000
    
    const totalBoxes = qty * (isQuarterly ? 3 : 1)
    const totalDeliveryFee = deliveryFee * totalBoxes
    const total = subtotal + totalDeliveryFee

    // 3. Create Order
    const monthStr = new Date().toLocaleDateString('es-AR', { month: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' });
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const friendlyId = `FUDI-${monthStr}-${randomCode}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        customer_name: name,
        customer_email: email,
        status: 'pending',
        plan,
        payment_method,
        total,
        edition,
        shipping_address: `${address} (CP: ${cp})`,
        friendly_id: friendlyId
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 4. Payment Logic
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
            <link href="https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111; }
              .container { max-width: 600px; margin: 0 auto; background-color: #40E0D0; padding: 30px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { font-family: 'Corben', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
              .box { background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 4px; margin: 20px 0; }
              .box p { margin: 10px 0; font-size: 16px; }
              .footer { text-align: center; font-size: 14px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <!-- If the logo doesn't load, the text fallback will use Corben font -->
                <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" style="max-width: 150px; margin-bottom: 15px; display: inline-block;" />
                <h1>¡Hola ${name}! 📦</h1>
              </div>
              <p style="font-size: 18px; font-weight: bold; text-align: center;">Has iniciado la reserva de tu Fudi Club Box.</p>
              
              <div class="box">
                <p style="margin-top: 0;"><strong>Para confirmar tu pedido, realiza la transferencia con los siguientes datos:</strong></p>
                <p>Alias: <strong>FUDI.CLUB.OK</strong></p>
                <p>CBU: <strong>0000000000000000000000</strong></p>
                <p style="margin-bottom: 0;">Monto a transferir: <strong>$${total}</strong></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/5491100000000?text=Hola,%20soy%20${name},%20adjunto%20comprobante%20de%20mi%20Mistery%20Box" style="background-color: #25D366; color: #fff; padding: 15px 25px; text-decoration: none; font-weight: bold; border: 3px solid #111; border-radius: 6px; display: inline-block; box-shadow: 4px 4px 0px #111;">
                  📲 Enviar Comprobante por WhatsApp
                </a>
                <p style="margin-top: 15px; font-size: 14px; font-weight: bold;">(O envíalo manualmente al +54 9 11 0000-0000)</p>
              </div>
              
              <div class="footer">
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

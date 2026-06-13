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
    const { email, name, address, cp, allergies, plan, payment_method } = body

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
    const qty = 1
    const isQuarterly = plan === 'quarterly'
    const pricePerBox = isQuarterly ? 40500 : 45000
    const subtotal = qty * pricePerBox
    
    const cpNum = parseInt(cp) || 0
    let deliveryFee = 0
    if (cpNum >= 1000 && cpNum <= 1499) deliveryFee = 2500
    else if (cpNum >= 1600 && cpNum <= 1900) deliveryFee = 4000
    else if (cpNum > 0) deliveryFee = 6000
    
    const total = subtotal + deliveryFee

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        status: 'pending',
        plan,
        payment_method,
        total
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
        JSON.stringify({ init_point: mpData.init_point, orderId: order.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (payment_method === 'transfer') {
      // Transfer logic: send email instructions
      await sendEmail({
        to: email,
        subject: 'Instrucciones de Transferencia - Fudi Club',
        html: `
          <h1>¡Hola ${name}!</h1>
          <p>Has iniciado la compra de tu Fudi Club Box.</p>
          <p>Para confirmar tu pedido, realiza la transferencia con los siguientes datos:</p>
          <ul>
            <li><strong>Alias:</strong> FUDI.CLUB.OK</li>
            <li><strong>CBU:</strong> 0000000000000000000000</li>
            <li><strong>Monto a transferir:</strong> $${total}</li>
          </ul>
          <p>Por favor, envíanos el comprobante respondiendo a este correo o a soporte@fudiclub.com indicando tu nombre y número de pedido (<strong>${order.id}</strong>).</p>
          <p>¡Gracias por sumarte al club!</p>
        `
      })

      return new Response(
        JSON.stringify({ success: true, orderId: order.id }),
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

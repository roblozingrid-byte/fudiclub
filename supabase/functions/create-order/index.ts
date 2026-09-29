import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { sendEmail } from '../_shared/resend.ts'
import { validateEmail } from '../_shared/email-validator.ts'
import { generateConfirmationToken } from '../_shared/token.ts'
import { buildAdminOrderNotificationEmail, buildTransferInstructionsEmail } from '../_shared/email-templates.ts'

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

    const validation = await validateEmail(email)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason || 'El correo electrónico no es válido.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (typeof address !== 'string' || address.trim().length < 5 || !/\d+/.test(address)) {
      return new Response(
        JSON.stringify({ error: 'La dirección debe incluir calle y altura (número).' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabase = getSupabaseClient()

    // 1. Insert or update customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        { email: cleanEmail, name, address, cp, allergies },
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
      customer_email: cleanEmail,
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

    let confirmUrl = '';
    if (payment_method === 'transfer') {
      try {
        const secret = Deno.env.get('ADMIN_CONFIRM_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fudi-secret';
        const confirmToken = await generateConfirmationToken(order.id, secret);
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        confirmUrl = `${supabaseUrl}/functions/v1/confirm-payment?order_id=${order.id}&token=${confirmToken}`;
      } catch (tokenErr) {
        console.error('Error generando token de confirmación:', tokenErr);
      }
    }

    try {
      await sendEmail({
        to: adminEmail,
        subject: `🔔 ¡Nuevo Pedido ${friendlyId}! - ${name} ($${formattedTotal})`,
        html: buildAdminOrderNotificationEmail({
          friendlyId,
          name,
          email: cleanEmail,
          address,
          cp,
          allergies,
          planName,
          finalEdition,
          qty,
          totalBoxes,
          paymentMethodLabel,
          formattedTotal,
          isQuarterly,
          confirmUrl
        })
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
        payer: { email: cleanEmail },
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
        to: cleanEmail,
        subject: '📦 ¡Tu reserva en Fudi Club! Instrucciones para transferir',
        html: buildTransferInstructionsEmail({
          name,
          friendlyId,
          total,
          edition: finalEdition,
          createdAt: order.created_at
        })
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

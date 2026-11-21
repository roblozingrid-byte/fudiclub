import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { sendEmail, createContact } from '../_shared/resend.ts'
import { validateEmail } from '../_shared/email-validator.ts'
import { generateConfirmationToken } from '../_shared/token.ts'
import { buildAdminOrderNotificationEmail, buildTransferInstructionsEmail } from '../_shared/email-templates.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, name, address, cp, allergies, plan, payment_method, edition, quantity, coupon_code } = body

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

    if (typeof name !== 'string' || name.trim().length < 4 || /\d/.test(name) || name.trim().split(/\s+/).filter(Boolean).length < 2) {
      return new Response(
        JSON.stringify({ error: 'Por favor ingresá tu nombre y apellido completo.' }),
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

    // Sincronizar comprador en Resend (Segmento: General / Mystery Box)
    try {
      const nameParts = name.trim().split(/\s+/)
      const firstName = nameParts[0] || name
      const lastName = nameParts.slice(1).join(' ') || ''
      await createContact({
        email: cleanEmail,
        firstName,
        lastName,
        audienceId: 'c71b8017-d546-4a9b-9631-ddeff8175243', // Segmento General
      })
    } catch (resendContactErr) {
      console.warn('Error sincronizando cliente en Resend:', resendContactErr)
    }

    // 2. Calculate Total (Con 10% de descuento Cyber Week activo hasta el 10 de Noviembre, o cupón)
    const qty = quantity ? parseInt(quantity, 10) : 1
    const isBimonthly = plan === 'bimonthly'
    const isQuarterly = plan === 'quarterly'

    const argDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const currentMonthIdx = argDate.getMonth();
    const currentDay = argDate.getDate();

    // 10% OFF promocional para la edición de Noviembre (hasta el 10 de noviembre inclusive)
    // Preventa Especial Thanksgiving & Black Friday (del jueves 26 al lunes 30 de Noviembre inclusive)
    // Trimestral: $119.700 en Black Friday ($39.900 x 3), $121.230 en Cyber Week, $127.900 regular
    // Bimestral: $79.800 en Black Friday ($39.900 x 2), $80.820 en Cyber Week, $85.310 regular
    // Compra única: $39.900 en Black Friday, $40.410 en Cyber Week, $44.900 regular
    const isDiscountActive = (currentMonthIdx === 10 && currentDay <= 10);
    const isBlackFridayActive = (currentMonthIdx === 10 && currentDay >= 26 && currentDay <= 30);
    const UNIT_PRICE_QUARTERLY = isBlackFridayActive ? 119700 : (isDiscountActive ? 121230 : 127900);
    const UNIT_PRICE_BIMONTHLY = isBlackFridayActive ? 79800 : (isDiscountActive ? 80820 : 85310);
    const UNIT_PRICE_ONE_TIME = isBlackFridayActive ? 39900 : (isDiscountActive ? 40410 : 44900);

    const COUPONS: Record<string, { discountRate: number; tag: string }> = {
      LUCHO10: { discountRate: 0.10, tag: 'LUCHO10' }
    };
    const normalizedCoupon = typeof coupon_code === 'string' ? coupon_code.trim().toUpperCase() : '';
    if (normalizedCoupon && !COUPONS[normalizedCoupon]) {
      return new Response(
        JSON.stringify({ error: `El código de descuento "${normalizedCoupon}" no es válido.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    const activeCoupon = (!isDiscountActive && !isBlackFridayActive && normalizedCoupon) ? COUPONS[normalizedCoupon] : null;

    const baseSubtotal = isQuarterly
      ? (UNIT_PRICE_QUARTERLY * qty)
      : isBimonthly
        ? (UNIT_PRICE_BIMONTHLY * qty)
        : (UNIT_PRICE_ONE_TIME * qty);
    const discountAmount = activeCoupon ? Math.round(baseSubtotal * activeCoupon.discountRate) : 0;
    const subtotal = baseSubtotal - discountAmount;
    
    let deliveryFee = 0 // Shipping is 100% free
    
    const boxesPerPlan = isQuarterly ? 3 : isBimonthly ? 2 : 1
    const totalBoxes = qty * boxesPerPlan
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
    if (isBimonthly) {
      let baseMonth = '';
      for (const m of monthsList) {
        if (edition?.includes(m)) {
          baseMonth = m;
          break;
        }
      }
      if (!baseMonth) {
        let mIdx = currentMonthIdx;
        const cutoffDay = (mIdx === 10) ? 10 : 5;
        if (currentDay > cutoffDay) mIdx = (mIdx + 1) % 12;
        baseMonth = monthsList[mIdx];
      }
      const bIdx = monthsList.indexOf(baseMonth);
      const m2 = monthsList[(bIdx + 1) % 12];
      finalEdition = `${baseMonth} - ${m2}`;
    } else if (isQuarterly) {
      let baseMonth = '';
      for (const m of monthsList) {
        if (edition?.includes(m)) {
          baseMonth = m;
          break;
        }
      }
      if (!baseMonth) {
        let mIdx = currentMonthIdx;
        const cutoffDay = (mIdx === 10) ? 10 : 5;
        if (currentDay > cutoffDay) mIdx = (mIdx + 1) % 12;
        baseMonth = monthsList[mIdx];
      }
      const bIdx = monthsList.indexOf(baseMonth);
      const m2 = monthsList[(bIdx + 1) % 12];
      const m3 = monthsList[(bIdx + 2) % 12];
      finalEdition = `${baseMonth} - ${m2} - ${m3}`;
    }

    const activeTag = activeCoupon ? activeCoupon.tag : (isBlackFridayActive ? 'Black Friday' : (isDiscountActive ? 'Cyber Week' : null));

    if (activeTag && !finalEdition?.includes(activeTag)) {
      finalEdition = `${finalEdition} [${activeTag}]`;
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
      tag: activeTag
    }

    let { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    // Fallback if tag, quantity or total_boxes columns do not exist yet in schema
    if (orderError && (orderError.message?.includes('quantity') || orderError.message?.includes('total_boxes') || orderError.message?.includes('tag'))) {
      delete orderPayload.quantity;
      delete orderPayload.total_boxes;
      delete orderPayload.tag;
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
    const planBaseName = isQuarterly ? 'Plan Trimestral' : isBimonthly ? 'Plan Bimestral' : 'Compra Única';
    const planName = activeTag ? `${planBaseName} (${activeTag})` : planBaseName;
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
      const promoBadge = activeTag ? ` [${activeTag}]` : '';
      const promoTagLabel = activeCoupon
        ? `Cupón ${activeCoupon.tag} (${Math.round(activeCoupon.discountRate * 100)}% OFF)`
        : isDiscountActive
          ? 'Cyber Week (10% OFF)'
          : undefined;
      await sendEmail({
        to: adminEmail,
        subject: `🔔 ¡Nuevo Pedido ${friendlyId}!${promoBadge} - ${name} ($${formattedTotal})`,
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
          confirmUrl,
          promoTag: promoTagLabel
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

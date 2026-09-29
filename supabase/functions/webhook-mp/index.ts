import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { sendEmail } from '../_shared/resend.ts'
import { buildPaymentConfirmedEmail } from '../_shared/email-templates.ts'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    if (!id) {
      return new Response('No ID provided', { status: 400 })
    }

    if (topic === 'payment') {
      const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      })

      if (!paymentRes.ok) {
        throw new Error('Error fetching payment from MP')
      }

      const payment = await paymentRes.json()
      
      // The external_reference is the order ID
      const orderId = payment.external_reference
      if (!orderId) {
        throw new Error('Payment missing external_reference')
      }

      if (payment.status === 'approved') {
        const supabase = getSupabaseClient()
        
        // Update order status
        const { data: order, error } = await supabase
          .from('orders')
          .update({ status: 'paid', mercadopago_payment_id: id })
          .eq('id', orderId)
          .select('*, customers(email, name)')
          .single()

        if (error) throw error

        if (order && order.customers) {
          // Send confirmation email
          const formattedTotal = Number(order.total || 0).toLocaleString('es-AR')
          await sendEmail({
            to: order.customers.email,
            subject: '🎉 ¡Pago confirmado! Tu Mystery Box está asegurada 📦',
            html: buildPaymentConfirmedEmail({
              customerName: order.customers.name,
              friendlyId: order.friendly_id || orderId,
              edition: order.edition || 'Mystery Box',
              formattedTotal,
              shippingAddress: order.shipping_address || 'Tu dirección registrada',
              plan: order.plan,
              isQuarterly: order.plan === 'quarterly',
              quantity: order.quantity,
              totalBoxes: order.total_boxes
            })
          })
        }
      }
    }

    return new Response('OK', { status: 200 })

  } catch (error: any) {
    console.error(error)
    return new Response('Webhook error', { status: 400 })
  }
})

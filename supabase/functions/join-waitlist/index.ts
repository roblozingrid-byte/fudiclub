import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { sendEmail } from '../_shared/resend.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    try {
      const monthsList = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const now = new Date();
      const argDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
      let targetMonthIdx = argDate.getMonth();
      if (argDate.getDate() > 5) targetMonthIdx = (targetMonthIdx + 1) % 12;
      const currentActiveMonth = monthsList[targetMonthIdx];

      const supabase = getSupabaseClient()
      const { data: orders, error } = await supabase.from('orders').select('id, plan, total, edition, status, quantity')
      if (error) throw error

      let committedBoxes = 0;
      if (orders) {
        for (const order of orders) {
          if (order.status === 'cancelled' || order.status === 'rejected') continue;
          const isQuarterly = order.plan === 'quarterly';
          const unitPrice = isQuarterly ? 127900 : 44900;
          const qtyPerMonth = order.quantity || (order.total ? Math.round(order.total / unitPrice) : 1);

          let orderBaseMonth = '';
          for (const m of monthsList) {
            if (order.edition?.includes(m)) {
              orderBaseMonth = m;
              break;
            }
          }
          if (!orderBaseMonth) continue;

          const bIdx = monthsList.indexOf(orderBaseMonth);
          const coveredMonths = isQuarterly
            ? [monthsList[bIdx], monthsList[(bIdx + 1) % 12], monthsList[(bIdx + 2) % 12]]
            : [monthsList[bIdx]];

          if (coveredMonths.includes(currentActiveMonth)) {
            committedBoxes += qtyPerMonth;
          }
        }
      }

      const availableStock = Math.max(0, 30 - committedBoxes);
      return new Response(
        JSON.stringify({ stock: availableStock, total_orders: orders ? orders.length : 0, committed_boxes: committedBoxes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      )
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  }

  try {
    const body = await req.json()
    const { email, note } = body

    if (!email) {
      throw new Error('Email is required')
    }

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('waitlist')
      .insert({ email, note: note || 'Interesado (Pre-checkout)' })

    // Ignore duplicate email error for waitlist, update note if provided
    if (error && error.code === '23505') {
      if (note) {
        await supabase
          .from('waitlist')
          .update({ note })
          .eq('email', email)
      }
    } else if (error) {
      throw error
    }

    // We no longer send an email here. It just captures the lead silently.
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

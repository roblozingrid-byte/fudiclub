import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'

const monthsList = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const queryEdition = url.searchParams.get('edition');

    // Determinar la edición activa según la fecha argentina (día > 5 => siguiente mes)
    const now = new Date();
    const argDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    let targetMonthIdx = argDate.getMonth();
    if (argDate.getDate() > 5) {
      targetMonthIdx = (targetMonthIdx + 1) % 12;
    }
    const currentActiveMonth = queryEdition || monthsList[targetMonthIdx];

    const supabase = getSupabaseClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, plan, total, edition, status, quantity')

    if (error) throw error

    let committedBoxes = 0;
    const totalOrdersCount = orders ? orders.length : 0;

    if (orders) {
      for (const order of orders) {
        if (order.status === 'cancelled' || order.status === 'rejected') continue;

        const isQuarterly = order.plan === 'quarterly';
        const unitPrice = isQuarterly ? 127900 : 44900;
        const qtyPerMonth = order.quantity || (order.total ? Math.round(order.total / unitPrice) : 1);

        // Mes base del pedido
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

    const maxCapacity = 30;
    const availableStock = Math.max(0, maxCapacity - committedBoxes);

    return new Response(
      JSON.stringify({
        stock: availableStock,
        total_orders: totalOrdersCount,
        committed_boxes: committedBoxes,
        edition: currentActiveMonth,
        capacity: maxCapacity
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )
  } catch (error: any) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

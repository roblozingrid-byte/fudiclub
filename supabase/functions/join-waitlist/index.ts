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
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from('orders').select('id')
      if (error) throw error
      const totalOrders = data ? data.length : 0
      const availableStock = Math.max(0, 30 - totalOrders)
      return new Response(
        JSON.stringify({ stock: availableStock, total_orders: totalOrders }),
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
    const { email } = body

    if (!email) {
      throw new Error('Email is required')
    }

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('waitlist')
      .insert({ email })

    // Ignore duplicate email error for waitlist
    if (error && error.code !== '23505') {
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

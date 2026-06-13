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

    // Only send welcome email if it was actually inserted (or we could always send it)
    if (!error) {
      await sendEmail({
        to: email,
        subject: '¡Estás en la lista de espera! - Fudi Club',
        html: `
          <h1>¡Hola!</h1>
          <p>Te hemos anotado en nuestra lista de espera.</p>
          <p>Te avisaremos apenas se liberen nuevos cupos para que puedas asegurar tu Fudi Club Box antes que nadie.</p>
          <p>¡Gracias por tu interés!</p>
        `
      })
    }

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

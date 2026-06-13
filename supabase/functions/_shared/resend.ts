export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) => {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return false
  }

  // Define from email (ideally configured in env)
  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'hola@fudiclub.com'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Resend API Error:', errorData)
      return false
    }

    const data = await res.json()
    console.log('Email sent:', data)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

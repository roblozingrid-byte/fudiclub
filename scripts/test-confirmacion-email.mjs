import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPaymentConfirmedEmail } from './email-templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';
const isQuarterly = process.argv.includes('--quarterly') || process.argv.includes('-q');
const targetEmail = process.argv.find(arg => arg.includes('@')) || 'ingrid.robles@hotmail.com';

if (!resendApiKey) {
  console.error('❌ Falta RESEND_API_KEY en .env.prod');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

const confirmationHtml = isQuarterly
  ? buildPaymentConfirmedEmail({
      customerName: 'Ingrid (Prueba Trimestral)',
      friendlyId: 'FUDI-10-TRIM-TEST',
      edition: 'Octubre - Noviembre - Diciembre',
      formattedTotal: '127.900',
      shippingAddress: 'Av. Santa Fe 1234, 4° B, CABA (CP: 1425)',
      plan: 'quarterly',
      isQuarterly: true,
      totalBoxes: 3
    })
  : buildPaymentConfirmedEmail({
      customerName: 'Ingrid (Prueba)',
      friendlyId: 'FUDI-10-CONFIRM',
      edition: 'Octubre 2026',
      formattedTotal: '44.900',
      shippingAddress: 'Av. Santa Fe 1234, 4° B, CABA (CP: 1425)'
    });

const subject = isQuarterly
  ? '⭐ [PRUEBA] ¡Plan Trimestral confirmado! Tus 3 Mystery Boxes están aseguradas 📦'
  : '🎉 [PRUEBA] ¡Pago confirmado! Tu Mystery Box está asegurada 📦';

async function main() {
  console.log(`📧 Enviando correo de prueba de ${isQuarterly ? 'CONFIRMACIÓN PLAN TRIMESTRAL' : 'CONFIRMACIÓN DE PAGO'} a: ${targetEmail}...`);
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: targetEmail,
      subject,
      html: confirmationHtml
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
    } else {
      console.log('✅ Correo de confirmación enviado con éxito! ID:', data?.id);
    }
  } catch (err) {
    console.error('❌ Excepción al enviar:', err);
  }
}

main();

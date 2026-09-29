import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildTransferInstructionsEmail } from './email-templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';
const targetEmail = process.argv[2] || 'ingrid.robles@hotmail.com';

const checkoutHtml = buildTransferInstructionsEmail({
  name: 'Ingrid (Prueba)',
  friendlyId: 'FUDI-09-TEST',
  total: 44900,
  edition: 'Octubre 2026',
  createdAt: new Date().toISOString()
});

async function main() {
  console.log(`Enviando correo de prueba a: ${targetEmail}...`);
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: targetEmail,
    subject: "📦 [PRUEBA] ¡Tu reserva en Fudi Club! Instrucciones para transferir",
    html: checkoutHtml
  });

  if (error) {
    console.error("Error al enviar:", error);
  } else {
    console.log("Correo enviado con éxito! ID:", data?.id);
  }
}

main();


import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';
const toEmail = 'ingrid.robles@hotmail.com';

const name = 'Ingrid (Prueba)';
const total = '45000';

const html = \
          <!DOCTYPE html>
          <html>
          <head>
            <link href=\"https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=Space+Grotesk:wght@400;600;700&display=swap\" rel=\"stylesheet\">
            <style>
              body { font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111; }
              .container { max-width: 600px; margin: 0 auto; background-color: #40E0D0; padding: 30px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { font-family: 'Corben', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
              .box { background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 4px; margin: 20px 0; }
              .box p { margin: 10px 0; font-size: 16px; }
              .footer { text-align: center; font-size: 14px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class=\"container\">
              <div class=\"header\">
                <img src=\"https://fudiclub.shop/imagenes/Logo-blanco-plano.png\" alt=\"Fudi Club\" style=\"max-width: 150px; margin-bottom: 15px; display: inline-block;\" />
                <h1>¡Hola \! ??</h1>
              </div>
              <p style=\"font-size: 18px; font-weight: bold; text-align: center;\">Has iniciado la reserva de tu Fudi Club Box.</p>
              
              <div class=\"box\">
                <p style=\"margin-top: 0;\"><strong>Para confirmar tu pedido, realiza la transferencia con los siguientes datos:</strong></p>
                <p>Alias: <strong>fudi.club.shop</strong></p>
                <p>CBU: <strong>0110036530003610750715</strong></p>
                <p style=\"margin-bottom: 0;\">Monto a transferir: <strong>$\</strong></p>
              </div>
              
              <div style=\"text-align: center; margin: 30px 0;\">
                <a href=\"https://wa.me/5491139264426?text=Hola,%20soy%20\,%20adjunto%20comprobante%20de%20mi%20Mistery%20Box\" style=\"background-color: #25D366; color: #fff; padding: 15px 25px; text-decoration: none; font-weight: bold; border: 3px solid #111; border-radius: 6px; display: inline-block; box-shadow: 4px 4px 0px #111;\">
                  ?? Enviar Comprobante por WhatsApp
                </a>
                <p style=\"margin-top: 15px; font-size: 14px; font-weight: bold;\">(O envíalo manualmente al +54 9 11 3926-4426)</p>
              </div>
              
              <div class=\"footer\">
                <p>¡Gracias por sumarte al club!</p>
              </div>
            </div>
          </body>
          </html>
\;

async function main() {
  console.log('Enviando correo de prueba de transferencia...');
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: '[PRUEBA] Datos para tu transferencia - Fudi Club Box',
    html: html
  });
  if (error) {
    console.error('Error enviando el correo:', error);
  } else {
    console.log('Correo de prueba enviado con éxito a', toEmail);
  }
}
main();


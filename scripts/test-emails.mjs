import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';
const toEmail = 'ingrid.robles@hotmail.com';

const hypeHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#D7BEE7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#D7BEE7; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border:3px solid #000; border-radius:12px; box-shadow:6px 6px 0px #000;">
          <tr>
            <td style="padding:40px 30px;">
              <h1 style="color:#000; font-size:24px; text-align:center; margin-bottom: 25px;">¿Te acordás de la emoción de abrir algo y no saber qué te iba a tocar?</h1>
              <p style="font-size:16px; color:#333; line-height:1.6; margin-bottom: 20px;">
                Faltan solo 24 horas para revivir eso. Mañana lanzamos oficialmente nuestra primera <strong>Mystery Box</strong>, armada a mano y pensada para que te des un lujo súper nostálgico.
              </p>
              <div style="background-color:#FFF4BD; padding:20px; border-radius:8px; border:2px solid #000; margin:30px 0; text-align:center;">
                <strong>⚠️ Atent@ al mail de mañana, vas a tener prioridad.</strong>
              </div>
              <div style="text-align:center; margin-top: 30px;">
                <img src="https://fudiclub.shop/imagenes/Logo-Plano-turquesa.png" alt="Fudi Club" width="150" style="max-width:100%; height:auto; display:block; margin:0 auto;" />
                <p style="font-size:16px; color:#333; line-height:1.6; margin-top: 10px; font-style:italic;">
                  Una experiencia nueva cada mes
                </p>
              </div>
              <div style="text-align:center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size:11px; color:#999; line-height:1.4; margin:0;">
                  Fudi Club &bull; Buenos Aires, Argentina<br>
                  Recibiste este correo porque te uniste a nuestra lista VIP.<br>
                  Si no querés recibir más correos, podés <a href="mailto:hola@fudiclub.shop?subject=Desuscribirme" style="color:#999; text-decoration:underline;">desuscribirte acá</a>.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const launchHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#7FE3D7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#7FE3D7; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border:3px solid #000; border-radius:12px; box-shadow:6px 6px 0px #000;">
          <tr>
            <td style="padding:40px 30px;">
              <h1 style="color:#000; font-size:26px; text-align:center; margin-bottom: 25px;">Llegó el día. Tu primera Mystery Box de Fudi Club ya se puede pedir.</h1>
              <p style="font-size:16px; color:#333; line-height:1.6; margin-bottom: 20px;">
                Adentro hay una selección increíble de golosinas que te van a llevar directo a los 90s, mezcladas con esos snacks virales que seguro te cruzás en TikTok. 
              </p>
              <p style="font-size:16px; color:#333; line-height:1.6; margin-bottom: 30px;">
                Tenemos muy poquitas <strong>boxes</strong> armadas para este primer envío en Buenos Aires, así que no te cuelgues.
              </p>
              <div style="text-align:center; margin: 40px 0;">
                <a href="https://fudiclub.shop" style="display:inline-block; background-color:#DDFE68; color:#000; text-decoration:none; padding:18px 35px; font-size:18px; font-weight:bold; border:3px solid #000; border-radius:8px; box-shadow:4px 4px 0px #000;">
                  QUIERO VIVIR LA EXPERIENCIA
                </a>
              </div>
              <div style="text-align:center; margin-top: 30px;">
                <img src="https://fudiclub.shop/imagenes/Logo-Plano-lila.png" alt="Fudi Club" width="150" style="max-width:100%; height:auto; display:block; margin:0 auto;" />
                <p style="font-size:16px; color:#333; line-height:1.6; margin-top: 10px; font-style:italic;">
                  Una experiencia nueva cada mes
                </p>
              </div>
              <div style="text-align:center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size:11px; color:#999; line-height:1.4; margin:0;">
                  Fudi Club &bull; Buenos Aires, Argentina<br>
                  Recibiste este correo porque te uniste a nuestra lista VIP.<br>
                  Si no querés recibir más correos, podés <a href="mailto:hola@fudiclub.shop?subject=Desuscribirme" style="color:#999; text-decoration:underline;">desuscribirte acá</a>.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function main() {
  console.log("Enviando correo de PRUEBA: Transferencia (Checkout)...");
  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=Space+Grotesk:wght@400;600;700&display=swap');
        body { font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111; }
        .container { max-width: 600px; margin: 0 auto; background-color: #4ebaba; padding: 30px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px; font-family: 'Space Grotesk', Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-family: 'Corben', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
        .box { background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 4px; margin: 20px 0; font-family: 'Space Grotesk', Arial, sans-serif; }
        .box p { margin: 10px 0; font-size: 16px; font-family: 'Space Grotesk', Arial, sans-serif; }
        .footer { text-align: center; font-size: 14px; font-weight: bold; margin-top: 20px; font-family: 'Space Grotesk', Arial, sans-serif; }
      </style>
    </head>
    <body style="font-family: 'Space Grotesk', Arial, sans-serif; background-color: #f4f4f0; padding: 20px; color: #111;">
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #4ebaba; padding: 30px; border: 4px solid #111; box-shadow: 8px 8px 0px #111; border-radius: 8px; font-family: 'Space Grotesk', Arial, sans-serif;">
        <div class="header" style="text-align: center; margin-bottom: 20px;">
          <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" style="max-width: 150px; margin-bottom: 15px; display: inline-block;" />
          <h1 style="font-family: 'Corben', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; margin: 0;">¡Hola Ingrid (Prueba)! 📦</h1>
        </div>
        <p style="font-size: 18px; font-weight: bold; text-align: center; font-family: 'Space Grotesk', Arial, sans-serif;">Has iniciado la reserva de tu Fudi Club Box.</p>
        <div class="box" style="background-color: #fff; padding: 20px; border: 3px solid #111; border-radius: 4px; margin: 20px 0; font-family: 'Space Grotesk', Arial, sans-serif;">
          <p style="margin-top: 0; font-family: 'Space Grotesk', Arial, sans-serif;"><strong>Para confirmar tu pedido, realiza la transferencia con los siguientes datos y envianos tu comprobante:</strong></p>
          <p style="font-family: 'Space Grotesk', Arial, sans-serif;">Alias: <strong>roblesingrid.bna</strong></p>
          <p style="font-family: 'Space Grotesk', Arial, sans-serif;">CBU: <strong>0110036530003610750715</strong></p>
          <p style="margin-bottom: 0; font-family: 'Space Grotesk', Arial, sans-serif;">Monto a transferir: <strong>$45000</strong></p>
        </div>
        <div style="text-align: center; margin: 30px 0; font-family: 'Space Grotesk', Arial, sans-serif;">
          <a href="https://wa.me/5491139264426?text=Hola,%20soy%20Ingrid,%20adjunto%20comprobante%20de%20mi%20Mystery%20Box" style="font-family: 'Space Grotesk', Arial, sans-serif; background-color: #d1ff5e; color: #111; padding: 15px 25px; text-decoration: none; font-weight: bold; border: 3px solid #111; border-radius: 6px; display: inline-block; box-shadow: 4px 4px 0px #111;">
            📲 Enviar Comprobante por WhatsApp
          </a>
          <p style="margin-top: 15px; font-size: 14px; font-weight: bold; font-family: 'Space Grotesk', Arial, sans-serif;">(O envíalo manualmente al +54 9 11 3926-4426)</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const { error: err3 } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: "[PRUEBA] Tus datos de transferencia para la Mystery Box",
    html: checkoutHtml
  });
  if (err3) console.error("Error Checkout:", err3);
  else console.log("Checkout enviado correctamente.");
}
main();

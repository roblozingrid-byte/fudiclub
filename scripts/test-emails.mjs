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
              <p style="font-size:16px; color:#333; line-height:1.6; text-align:center; margin-top: 30px;">
                Fudi Club 👾<br>
                <em>La nostalgia tiene un nuevo sabor.</em>
              </p>
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
              <p style="font-size:16px; color:#333; line-height:1.6; text-align:center; margin-top: 30px;">
                Fudi Club 👾<br>
                <em>La nostalgia tiene un nuevo sabor.</em>
              </p>
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
  console.log("Enviando correo de PRUEBA: Hype...");
  const { error: err1 } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: "[PRUEBA] Mañana te devolvemos un pedacito de tu infancia 🕹️",
    html: hypeHtml
  });
  if (err1) console.error("Error Hype:", err1);
  else console.log("Hype enviado correctamente.");

  console.log("Enviando correo de PRUEBA: Lanzamiento...");
  const { error: err2 } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: "[PRUEBA] La Mystery Box está lista. ¿La destapamos? 🍭",
    html: launchHtml
  });
  if (err2) console.error("Error Lanzamiento:", err2);
  else console.log("Lanzamiento enviado correctamente.");
}
main();

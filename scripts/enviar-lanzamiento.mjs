import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';

if (!supabaseUrl || !supabaseKey || !resendApiKey) {
  console.error("Faltan credenciales en .env.prod");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

const htmlTemplate = \
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
\;

async function main() {
  console.log("Obteniendo lista de correos desde Supabase...");
  const { data, error } = await supabase.from('waitlist').select('email');
  if (error) { console.error("Error:", error); return; }
  if (!data || data.length === 0) { console.log("No hay correos en la lista."); return; }

  const uniqueEmails = [...new Set(data.map(r => r.email.toLowerCase().trim()))];
  console.log(\Se enviará a \ personas.\);

  const emailsToSend = uniqueEmails.map(email => ({
    from: fromEmail,
    to: [email],
    subject: "La Mystery Box está lista. ¿La destapamos? 🍭",
    html: htmlTemplate
  }));
  
  const BATCH_SIZE = 100;
  for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
    const batch = emailsToSend.slice(i, i + BATCH_SIZE);
    console.log(\Enviando lote \ de \...\);
    const { error: resendError } = await resend.batch.send(batch);
    if (resendError) console.error("Error de Resend:", resendError);
    else console.log("Lote enviado correctamente.");
  }
  console.log("¡Correo de Lanzamiento enviado con éxito!");
}
main();

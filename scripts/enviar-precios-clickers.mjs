import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envProdPath = path.join(__dirname, '../.env.prod');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Ingrid de Fudi Club <hola@fudiclub.shop>';

if (!resendApiKey) {
  console.error('❌ Error: RESEND_API_KEY no encontrada.');
  process.exit(1);
}

const logPath = path.join(__dirname, 'data/campana-precios-clickers-log.json');
let sendLogs = {};
if (fs.existsSync(logPath)) {
  try {
    sendLogs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  } catch (e) {
    sendLogs = {};
  }
}

function saveLogs() {
  fs.writeFileSync(logPath, JSON.stringify(sendLogs, null, 2), 'utf-8');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clickersData = [
  { email: 'justo@fu.do', nombre: 'Justo', empresa: 'Fudo' },
  { email: 'paula.devincenzi@suriscode.com', nombre: 'Paula', empresa: 'Suris Code' },
  { email: 'cristian.mitrani@mitranicaballero.com', nombre: 'Cristian', empresa: 'Mitrani Caballero' },
  { email: 'ignacio.meggiolaro@mhrlegal.com', nombre: 'Ignacio', empresa: 'MBP Partners' },
  { email: 'psanmartin@smslatam.com', nombre: 'Pablo', empresa: 'SMS Latinoamérica' },
  { email: 'soporte@lemon.me', nombre: 'Equipo de Lemon', empresa: 'Lemon Cash' },
  { email: 'info@koibanx.com', nombre: 'Equipo de Koibanx', empresa: 'Koibanx' },
  { email: 'info@fluxitsoft.com', nombre: 'Equipo de Flux IT', empresa: 'Flux IT' },
  { email: 'rrhh@donbue.com', nombre: 'Equipo de Don', empresa: 'Agencia Don' }
];

function generateEmailText({ nombre, empresa }) {
  return `Hola ${nombre}, ¿cómo estás?

Te escribo cortito porque vimos el interés en la propuesta de fin de año y queríamos pasarte directamente la escala de precios por volumen que acabamos de publicar, para que en ${empresa} puedan presupuestar rápido y sin vueltas:

💰 Inversión por Box de Fin de Año:
• 1 a 9 boxes: $44.900 c/u (ideal muestras o equipos chicos)
• 10 a 24 boxes: $41.300 c/u (8% OFF · ahorrás $3.600/box)
• 25 a 49 boxes: $39.500 c/u (12% OFF · ahorrás $5.400/box)
• 50+ boxes: $38.100 c/u (15% OFF · máximo ahorro de $6.800/box)

✨ ¿Qué incluye cada box?
• 10 a 12 snacks y golosinas importadas virales (Asia, USA, Europa).
• Tarjeta dedicatoria personalizada con el logo de ${empresa}.
• Plancha de stickers virales para laptops y termos.
• Envío consolidado 100% BONIFICADO a la oficina en CABA o GBA.
• Factura C oficial con CUIT para contabilidad y deducción de gastos.

(Si tienen colaboradores remotos, también coordinamos entregas individuales puerta a puerta a cada domicilio particular).

Podés ver todos los detalles y fotos en https://fudiclub.shop/empresas

¿Cuántas personas son aproximadamente en el equipo de ${empresa}? Si me respondés a este correo con el número aproximado, te paso el número cerrado en el día o les coordinamos una box de muestra sin costo a su oficina.

Un beso grande,
Ingrid
Founder · Fudi Club
fudiclub.shop/empresas`;
}

function generateEmailHtml({ nombre, empresa }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Precios y propuesta de Fin de Año Fudi Club</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #fafafa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px 28px; border-radius: 12px; border: 2px solid #000; box-shadow: 4px 4px 0px #000;">
    
    <p style="font-size: 16px; margin-top: 0;">Hola <strong>${nombre}</strong>, ¿cómo estás?</p>
    
    <p style="font-size: 15px; color: #333;">Te escribo cortito porque sé que en estas semanas previas a fin de año necesitás números concretos para presupuestar rápido y sin vueltas para el equipo de <strong>${empresa}</strong>.</p>
    
    <p style="font-size: 15px; color: #333;">Acabamos de publicar nuestra <strong>escala de precios transparentes por volumen</strong> para las Boxes de Fin de Año:</p>
    
    <!-- Tabla de Precios -->
    <div style="background-color: #fff4bd; border: 2px solid #000; border-radius: 8px; padding: 18px 20px; margin: 22px 0;">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; color: #000;">💰 Escala de Inversión por Volumen:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14.5px;">
        <tr style="border-bottom: 1px dashed #444;">
          <td style="padding: 7px 0;"><strong>1 a 9 boxes</strong></td>
          <td style="padding: 7px 0; text-align: right;"><strong>$44.900</strong> c/u <span style="font-size: 12px; color: #666;">(muestra / chicos)</span></td>
        </tr>
        <tr style="border-bottom: 1px dashed #444;">
          <td style="padding: 7px 0;"><strong>10 a 24 boxes</strong></td>
          <td style="padding: 7px 0; text-align: right;"><strong>$41.300</strong> c/u <span style="background: #4ebaba; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">8% OFF</span></td>
        </tr>
        <tr style="border-bottom: 1px dashed #444; background: #fffbe6;">
          <td style="padding: 7px 0;"><strong>25 a 49 boxes</strong></td>
          <td style="padding: 7px 0; text-align: right;"><strong>$39.500</strong> c/u <span style="background: #d1ff5e; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">12% OFF</span></td>
        </tr>
        <tr>
          <td style="padding: 7px 0;"><strong>50+ boxes</strong></td>
          <td style="padding: 7px 0; text-align: right;"><strong>$38.100</strong> c/u <span style="background: #ffb7d5; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">15% OFF MÁX</span></td>
        </tr>
      </table>
    </div>

    <!-- Lo que incluye -->
    <div style="margin: 20px 0; font-size: 14.5px;">
      <strong style="font-size: 15px;">✨ Todo incluido:</strong>
      <ul style="padding-left: 20px; margin: 8px 0; color: #333;">
        <li style="margin-bottom: 6px;"><strong>10 a 12 snacks virales e importados</strong> (Asia, USA, Europa).</li>
        <li style="margin-bottom: 6px;"><strong>Tarjeta personalizada con el logo de ${empresa}</strong> y dedicatoria.</li>
        <li style="margin-bottom: 6px;"><strong>Plancha de stickers virales</strong> para laptops y termos.</li>
        <li style="margin-bottom: 6px;"><strong>Envío consolidado 100% BONIFICADO</strong> a la oficina en CABA/GBA.</li>
        <li style="margin-bottom: 6px;"><strong>Factura C oficial con CUIT</strong> para deducción contable.</li>
      </ul>
      <p style="font-size: 13.5px; color: #555; margin-top: 8px;"><em>(¿Tienen equipo híbrido o remoto? También hacemos envíos individuales puerta a puerta con número de seguimiento).</em></p>
    </div>

    <!-- CTA Box -->
    <div style="background-color: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 8px; padding: 14px 18px; margin: 22px 0;">
      <p style="margin: 0; font-size: 14.5px; color: #166534;">
        👉 <strong>¿Cuántas personas son en el equipo aproximadamente?</strong><br>
        Si me respondés a este correo con el número aproximado, te paso el presupuesto cerrado en el día o les enviamos una <strong>box de muestra sin cargo</strong> a la oficina para que la prueben.
      </p>
    </div>

    <p style="font-size: 14.5px; margin-top: 24px;">
      O si preferís ver fotos reales del unboxing y packaging: <br>
      <a href="https://fudiclub.shop/empresas" style="color: #4f46e5; font-weight: bold; text-decoration: underline;">https://fudiclub.shop/empresas</a>
    </p>

    <div style="margin-top: 30px; padding-top: 18px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #374151;">
      Un beso grande,<br>
      <strong>Ingrid</strong><br>
      Founder · Fudi Club<br>
      <a href="https://fudiclub.shop/empresas" style="color: #6366f1; text-decoration: none;">fudiclub.shop/empresas</a>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const isSchedule = args.includes('--schedule');
  const isSendNow = args.includes('--send-now');

  console.log('🚀 Script de Precios para Clickers B2B');
  console.log(`Modo: ${isSchedule ? 'PROGRAMAR EN RESEND PARA EL LUNES' : isSendNow ? 'ENVIAR AHORA' : 'DRY-RUN (Simulación)'}`);

  // Lunes 16 de Noviembre a las 09:30 AM ART (12:30:00 UTC)
  const scheduledTime = '2026-11-16T12:30:00.000Z';

  console.log(`📅 Hora programada: ${scheduledTime} (09:30 AM Argentina)`);
  console.log(`🎯 Total destinatarios: ${clickersData.length}`);

  for (let i = 0; i < clickersData.length; i++) {
    const item = clickersData[i];
    console.log(`\n[${i + 1}/${clickersData.length}] ${item.empresa} (${item.nombre}) <${item.email}>`);

    if (sendLogs[item.email] && sendLogs[item.email].status === 'scheduled') {
      console.log(`⏩ Ya programado previamente (ID: ${sendLogs[item.email].id}). Saltando...`);
      continue;
    }

    const subject = `Precios de fin de año y opciones para ${item.empresa} 🎁`;
    const html = generateEmailHtml(item);
    const text = generateEmailText(item);

    if (isSchedule || isSendNow) {
      try {
        const payload = {
          from: fromEmail,
          to: item.email,
          reply_to: 'hola@fudiclub.shop',
          subject,
          html,
          text
        };

        if (isSchedule) {
          payload.scheduled_at = scheduledTime;
        }

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await res.json();

        if (!res.ok) {
          console.error(`❌ Error con ${item.email}:`, resData);
          sendLogs[item.email] = { status: 'error', error: resData, date: new Date().toISOString() };
        } else {
          console.log(`✅ ${isSchedule ? 'Programado' : 'Enviado'} con éxito | ID: ${resData.id}`);
          sendLogs[item.email] = {
            status: isSchedule ? 'scheduled' : 'sent',
            id: resData.id,
            scheduledFor: isSchedule ? scheduledTime : null,
            date: new Date().toISOString()
          };
        }
        saveLogs();
      } catch (err) {
        console.error(`❌ Excepción con ${item.email}:`, err.message);
      }
      await sleep(1500);
    } else {
      console.log(`[DRY-RUN] Subject: ${subject}`);
      console.log(`[DRY-RUN] Preview texto: ${text.slice(0, 160)}...`);
    }
  }

  console.log('\n🏁 Proceso finalizado.');
}

main().catch(console.error);

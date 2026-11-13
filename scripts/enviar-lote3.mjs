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

const dataPath = path.join(__dirname, 'data/prospectos-lote3.json');
const logPath = path.join(__dirname, 'data/campana-lote3-log.json');
const prospects = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

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

function getCleanCompany(empresa) {
  if (!empresa) return 'tu empresa';
  if (empresa.includes('(')) {
    const parts = empresa.split('(');
    const before = parts[0].trim();
    const inside = parts[1].replace(')', '').trim();
    if (before.length > 25 && inside.length < before.length) return inside;
    return before;
  }
  return empresa;
}

function getGreeting(contactoNombre, cleanEmpresa) {
  if (!contactoNombre) return `Hola equipo de ${cleanEmpresa}`;
  const part = contactoNombre.split('/')[0].trim();
  const clean = part.replace(/^(Lic\.|Dr\.|Dra\.|Ing\.|Arq\.)\s+/i, '').trim();
  const first = clean.split(' ')[0];
  if (!first || ['Área', 'Equipo', 'Departamento', 'Adm', 'Admin', 'Casilla', 'Contacto', 'Info'].includes(first)) {
    return `Hola equipo de ${cleanEmpresa}`;
  }
  return `Hola ${first}`;
}

function generateText({ greeting, cleanEmpresa }) {
  return `${greeting}, ¿cómo estás?

Te escribo porque sé que en estas semanas se empieza a definir el regalo de fin de año para el equipo y casi siempre se termina cayendo en la clásica canasta navideña tradicional (con el pan dulce seco y los turrones duros) que nadie termina aprovechando.

En Fudi Club armamos una alternativa que a los colaboradores realmente les entusiasma: boxes de fin de año con 10 a 12 snacks y golosinas virales importadas (Asia, USA, Europa), listas para entregar o enviar.

Personalización para ${cleanEmpresa}:
• Tarjeta dedicatoria con el logo de ${cleanEmpresa} y saludo institucional.
• Plancha de stickers virales coleccionables para laptops y termos.

💰 Inversión transparente por volumen (Factura C con CUIT):
• 1 a 9 boxes: $44.900 c/u (muestra o equipos chicos)
• 10 a 24 boxes: $41.300 c/u (8% OFF · ahorrás $3.600/box)
• 25 a 49 boxes: $39.500 c/u (12% OFF · ahorrás $5.400/box)
• 50+ boxes: $38.100 c/u (15% OFF · máximo beneficio de $6.800/box)

🚚 Logística en CABA y GBA:
• Envío consolidado 100% BONIFICADO a la oficina a partir de 10 unidades.
• Si tienen equipo remoto o híbrido, también gestionamos entregas individuales puerta a puerta con número de seguimiento.

Podés ver fotos reales del unboxing y packaging en: https://fudiclub.shop/empresas

¿Cuántas personas son aproximadamente en el equipo de ${cleanEmpresa}? Si me respondés a este correo con el número aproximado, te paso el presupuesto cerrado en el día o les coordinamos una box de muestra sin costo a su oficina.

Un beso grande,
Ingrid
Founder · Fudi Club
fudiclub.shop/empresas`;
}

function generateHtml({ greeting, cleanEmpresa }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Regalo de Fin de Año para ${cleanEmpresa}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #fafafa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px 28px; border-radius: 12px; border: 2px solid #000; box-shadow: 4px 4px 0px #000;">
    
    <p style="font-size: 16px; margin-top: 0;"><strong>${greeting}</strong>, ¿cómo estás?</p>
    
    <p style="font-size: 15px; color: #333;">Te escribo cortito porque en estas semanas se empieza a definir el regalo de fin de año para los colaboradores y casi siempre se termina cayendo en la clásica canasta navideña tradicional (con el pan dulce seco y los turrones duros) que pocos aprovechan.</p>
    
    <p style="font-size: 15px; color: #333;">En <strong>Fudi Club</strong> armamos una alternativa fresca y memorable: <strong>boxes de fin de año listas para regalar</strong>, combinando 10 a 12 snacks virales y golosinas importadas de Asia, USA y Europa que todos en la oficina van a querer unboxear y compartir.</p>
    
    <!-- Highlights de personalización -->
    <div style="background-color: #fdfaf6; border: 2px solid #000; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 15px; color: #000;">✨ Personalizado para ${cleanEmpresa}:</h3>
      <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #333;">
        <li style="margin-bottom: 6px;"><strong>Tarjeta dedicatoria institucional:</strong> Con el logo de ${cleanEmpresa} y mensaje de felicitación de fin de año.</li>
        <li style="margin-bottom: 6px;"><strong>Plancha de stickers virales:</strong> Para personalizar laptops, termos y cuadernos.</li>
        <li style="margin-bottom: 6px;"><strong>Factura C oficial con CUIT</strong> para deducción contable directa.</li>
      </ul>
    </div>

    <!-- Escala de Precios -->
    <div style="background-color: #fff4bd; border: 2px solid #000; border-radius: 8px; padding: 18px 20px; margin: 22px 0;">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #000;">💰 Inversión Transparente por Volumen:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px dashed #555;">
          <td style="padding: 6px 0;"><strong>1 a 9 boxes</strong></td>
          <td style="padding: 6px 0; text-align: right;"><strong>$44.900</strong> c/u <span style="font-size: 11.5px; color: #666;">(muestra / chicos)</span></td>
        </tr>
        <tr style="border-bottom: 1px dashed #555;">
          <td style="padding: 6px 0;"><strong>10 a 24 boxes</strong></td>
          <td style="padding: 6px 0; text-align: right;"><strong>$41.300</strong> c/u <span style="background: #4ebaba; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">8% OFF</span></td>
        </tr>
        <tr style="border-bottom: 1px dashed #555; background: #fffbe6;">
          <td style="padding: 6px 0;"><strong>25 a 49 boxes</strong></td>
          <td style="padding: 6px 0; text-align: right;"><strong>$39.500</strong> c/u <span style="background: #d1ff5e; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">12% OFF</span></td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>50+ boxes</strong></td>
          <td style="padding: 6px 0; text-align: right;"><strong>$38.100</strong> c/u <span style="background: #ffb7d5; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">15% OFF MÁX</span></td>
        </tr>
      </table>
      <p style="margin: 10px 0 0 0; font-size: 12.5px; color: #444;">
        🚚 <strong>Envío consolidado sin cargo</strong> a 1 oficina/sede en CABA o GBA a partir de 10 unidades. (Para colaboradores remotos, cotizamos logística puerta a puerta a domicilio).
      </p>
    </div>

    <!-- CTA Box -->
    <div style="background-color: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 8px; padding: 14px 18px; margin: 22px 0;">
      <p style="margin: 0; font-size: 14.5px; color: #166534;">
        👉 <strong>¿Cuántas personas son en el equipo de ${cleanEmpresa}?</strong><br>
        Si me respondés a este correo con el número aproximado, te paso el presupuesto cerrado en el día o coordinamos una <strong>box de muestra sin cargo</strong> a su oficina para que conozcan los snacks en vivo.
      </p>
    </div>

    <p style="font-size: 14.5px; margin-top: 22px;">
      Podés ver fotos reales, fotos del contenido y packaging en:<br>
      <a href="https://fudiclub.shop/empresas" style="color: #4f46e5; font-weight: bold; text-decoration: underline;">https://fudiclub.shop/empresas</a>
    </p>

    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #374151;">
      Un beso grande,<br>
      <strong>Ingrid</strong><br>
      Founder · Fudi Club<br>
      <a href="https://fudiclub.shop/empresas" style="color: #6366f1; text-decoration: none;">fudiclub.shop/empresas</a>
    </div>

    <div style="margin-top: 18px; padding-top: 10px; border-top: 1px dashed #eee; font-size: 11px; color: #999; text-align: center;">
      Si preferís no recibir propuestas corporativas de Fudi Club, respondé "Baja" y no te escribimos más.
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const isSchedule = args.includes('--schedule');
  const isSendNow = args.includes('--send-now');

  console.log('🚀 Script de Lanzamiento Lote #3 (60 empresas)');
  console.log(`Modo: ${isSchedule ? 'PROGRAMAR EN RESEND PARA EL LUNES' : isSendNow ? 'ENVIAR AHORA' : 'DRY-RUN (Simulación)'}`);

  // Lunes 16 de Noviembre a las 09:30 AM ART (12:30:00 UTC)
  const scheduledTime = '2026-11-16T12:30:00.000Z';

  console.log(`📅 Hora programada: ${scheduledTime} (09:30 AM Argentina)`);
  console.log(`🎯 Total destinatarios: ${prospects.length}`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    const cleanEmpresa = getCleanCompany(p.empresa);
    const greeting = getGreeting(p.contactoNombre, cleanEmpresa);

    console.log(`\n[${i + 1}/${prospects.length}] ${cleanEmpresa} (${greeting}) <${p.email}>`);

    if (sendLogs[p.email] && sendLogs[p.email].status === 'scheduled') {
      console.log(`⏩ Ya programado previamente (ID: ${sendLogs[p.email].id}). Saltando...`);
      skipCount++;
      continue;
    }

    const subject = `El regalo de fin de año para ${cleanEmpresa} 🎄`;
    const html = generateHtml({ greeting, cleanEmpresa });
    const text = generateText({ greeting, cleanEmpresa });

    if (isSchedule || isSendNow) {
      try {
        const payload = {
          from: fromEmail,
          to: p.email,
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
          console.error(`❌ Error con ${p.email}:`, resData);
          sendLogs[p.email] = { status: 'error', error: resData, date: new Date().toISOString() };
        } else {
          console.log(`✅ ${isSchedule ? 'Programado' : 'Enviado'} con éxito | ID: ${resData.id}`);
          sendLogs[p.email] = {
            status: isSchedule ? 'scheduled' : 'sent',
            id: resData.id,
            scheduledFor: isSchedule ? scheduledTime : null,
            empresa: cleanEmpresa,
            rubro: p.rubro,
            date: new Date().toISOString()
          };
          successCount++;
        }
        saveLogs();
      } catch (err) {
        console.error(`❌ Excepción con ${p.email}:`, err.message);
      }
      // Resend rate limit: 2 requests per second
      await sleep(1200);
    } else {
      console.log(`[DRY-RUN] Subject: ${subject}`);
      console.log(`[DRY-RUN] Preview texto: ${text.slice(0, 140)}...`);
    }
  }

  console.log(`\n🏁 Proceso finalizado. Total: ${prospects.length} | Agendados: ${successCount} | Omitidos: ${skipCount}`);
}

main().catch(console.error);

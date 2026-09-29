import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';

function formatDeadline(date) {
  try {
    const d = date ? new Date(date) : new Date();
    const deadline = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const argStr = deadline.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
    const argDate = new Date(argStr);
    
    const dayName = days[argDate.getDay()];
    const dayNum = argDate.getDate();
    const monthName = months[argDate.getMonth()];
    const hours = String(argDate.getHours()).padStart(2, '0');
    const minutes = String(argDate.getMinutes()).padStart(2, '0');
    
    return `${dayName} ${dayNum} de ${monthName} a las ${hours}:${minutes} hs`;
  } catch (e) {
    return '24 horas desde tu reserva';
  }
}

export function buildReminderHtml({ name, friendlyId, total, edition, createdAt }) {
  const firstName = (name || 'Fudi Lover').trim().split(' ')[0];
  const formattedTotal = Number(total || 44900).toLocaleString('es-AR');
  const orderId = friendlyId || 'FUDI-BOX';
  const whatsappMsg = `Hola! Soy ${name || firstName}, adjunto comprobante de mi Mystery Box (${orderId})`;
  const whatsappUrl = `https://wa.me/5491139264426?text=${encodeURIComponent(whatsappMsg)}`;
  const deadlineText = formatDeadline(createdAt);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Pago - Fudi Club</title>
</head>
<body style="margin: 0; padding: 0; background-color: #c79fef; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #c79fef; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Fudi Style -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 3px solid #000000; border-radius: 14px; box-shadow: 6px 6px 0px #000000; overflow: hidden;">
          
          <!-- Header Banner (Turquesa Fudi) -->
          <tr>
            <td style="background-color: #4ebaba; padding: 30px 25px 25px 25px; text-align: center; border-bottom: 3px solid #000000;">
              <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto 15px auto;" />
              
              <div style="display: inline-block; background-color: #ffb7d5; color: #000000; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border: 2px solid #000000; border-radius: 20px; box-shadow: 2px 2px 0px #000000; margin-bottom: 12px;">
                ⭐ CUPOS LIMITADOS &bull; 30 AL MES
              </div>

              <h1 style="color: #000000; font-size: 24px; font-weight: 900; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1.2;">
                ¡Tu Mystery Box te espera! 📦✨
              </h1>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111111;">
                ¡Hola ${firstName}! Notamos que iniciaste tu compra pero aún falta confirmar tu pago.
              </p>
            </td>
          </tr>

          <!-- Inner Content Container -->
          <tr>
            <td style="padding: 28px 25px;">
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #222222;">
                Vimos que reservaste tu lugar para la edición <strong>${edition || 'actual'}</strong>, pero todavía no registramos tu comprobante de transferencia bancaria.
              </p>

              <!-- Box Urgencia / Fecha Límite (Amarillo Fudi) -->
              <div style="background-color: #fff4bd; border: 2px solid #000000; border-radius: 8px; box-shadow: 3px 3px 0px #000000; padding: 15px 18px; margin-bottom: 22px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000000;">
                  ⏰ Plazo límite de confirmación:
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #111111;">
                  Tenés tiempo hasta el <strong>${deadlineText}</strong> para enviar tu comprobante. Pasado ese plazo, liberamos el cupo automáticamente para las personas en lista de espera.
                </p>
              </div>

              <!-- Datos Bancarios (Tarjeta blanca limpia con borde grueso) -->
              <div style="background-color: #ffffff; border: 2px dashed #000000; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #555555;">
                  Datos para realizar la transferencia:
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="5">
                  <tr>
                    <td style="font-size: 14px; color: #444444; width: 90px;"><strong>Alias:</strong></td>
                    <td style="font-size: 16px; font-weight: 800; color: #000000; font-family: monospace;">roblesingrid.bna</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #444444;"><strong>CBU:</strong></td>
                    <td style="font-size: 14px; font-weight: 700; color: #000000; font-family: monospace;">0110036530003610750715</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #444444;"><strong>Monto:</strong></td>
                    <td style="font-size: 20px; font-weight: 900; color: #000000;">$${formattedTotal}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #444444;"><strong>ID Pedido:</strong></td>
                    <td style="font-size: 14px; font-weight: 700; color: #000000; font-family: monospace;">${orderId}</td>
                  </tr>
                </table>
              </div>

              <!-- Botón CTA WhatsApp (Verde Lima Fudi con sombra dura) -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 5px 0 12px 0;">
                    <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #d1ff5e; color: #000000; font-size: 15px; font-weight: 900; text-decoration: none; padding: 16px 28px; border: 3px solid #000000; border-radius: 8px; box-shadow: 4px 4px 0px #000000; text-transform: uppercase; letter-spacing: 0.5px;">
                      📲 Enviar Comprobante por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 8px 0 20px 0; font-size: 13px; color: #555555; text-align: center;">
                (O envialo manualmente al <strong>+54 9 11 3926-4426</strong> indicando tu nombre e ID)
              </p>

              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #555555; text-align: center;">
                ¿Tuviste algún inconveniente al transferir o te quedó alguna consulta? Respondé directamente a este correo o escribinos por WhatsApp y lo resolvemos juntos al instante. 💛
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 25px 25px 25px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 15px 0 6px 0; font-size: 13px; font-weight: 700; color: #000000;">
                Fudi Club &bull; Para los que aman descubrir nuevos sabores
              </p>
              <p style="margin: 0; font-size: 11px; color: #666666;">
                Buenos Aires, Argentina &bull; <a href="https://fudiclub.shop" style="color: #000000; font-weight: 700; text-decoration: underline;">fudiclub.shop</a>
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
}

async function run() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force');
  const testIdx = args.indexOf('--test');
  const hoursIdx = args.indexOf('--hours');
  const minHours = hoursIdx !== -1 ? parseFloat(args[hoursIdx + 1]) : 2; // Default 2 hours

  console.log('='.repeat(55));
  console.log('📦 FUDI CLUB - RECORDATORIOS DE PAGO POR TRANSFERENCIA');
  console.log('='.repeat(55));

  if (!resendApiKey) {
    console.error('❌ Falta RESEND_API_KEY en las variables de entorno.');
    process.exit(1);
  }

  const resend = new Resend(resendApiKey);

  // MODO TEST
  if (testIdx !== -1) {
    const testEmail = args[testIdx + 1];
    if (!testEmail || !testEmail.includes('@')) {
      console.error('❌ Debés especificar un email válido: --test tu-email@dominio.com');
      process.exit(1);
    }

    console.log(`\n📧 Enviando correo de PRUEBA a: ${testEmail}...`);
    const testHtml = buildReminderHtml({
      name: 'Ingrid Robles',
      friendlyId: 'FUDI-09-DEMO',
      total: 44900,
      edition: 'Octubre 2026',
      createdAt: new Date().toISOString()
    });

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: testEmail,
        subject: '📦 ¡No te cuelgues! Tu Mystery Box te está esperando (Datos de transferencia)',
        html: testHtml
      });

      if (error) {
        console.error('❌ Error al enviar:', error);
      } else {
        console.log('✅ Correo de prueba enviado con éxito! ID:', data?.id);
      }
    } catch (err) {
      console.error('❌ Excepción al enviar:', err);
    }
    return;
  }

  // MODO PRODUCCIÓN / REVISIÓN EN BASE DE DATOS
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan credenciales de Supabase (SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\n🔍 Buscando pedidos pendientes por transferencia creados hace más de ${minHours} horas...`);

  const cutoffDate = new Date(Date.now() - minHours * 60 * 60 * 1000).toISOString();

  let selectFields = 'id, friendly_id, customer_name, customer_email, total, plan, edition, status, payment_method, created_at';
  let hasReminderCol = true;

  // Intentar primero con reminder_sent_at
  let { data: pendingOrders, error } = await supabase
    .from('orders')
    .select(`${selectFields}, reminder_sent_at`)
    .eq('payment_method', 'transfer')
    .eq('status', 'pending')
    .lte('created_at', cutoffDate)
    .is('reminder_sent_at', null)
    .order('created_at', { ascending: false });

  // Si la columna reminder_sent_at todavía no fue creada en la BD remota, hacer fallback
  if (error && error.message?.includes('reminder_sent_at')) {
    hasReminderCol = false;
    const retry = await supabase
      .from('orders')
      .select(selectFields)
      .eq('payment_method', 'transfer')
      .eq('status', 'pending')
      .lte('created_at', cutoffDate)
      .order('created_at', { ascending: false });
    pendingOrders = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('❌ Error consultando Supabase:', error.message);
    process.exit(1);
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    console.log('🎉 No hay pedidos pendientes de transferencia que requieran recordatorio en este momento.');
    return;
  }

  console.log(`\n📋 Se encontraron ${pendingOrders.length} pedido(s) pendiente(s):`);
  pendingOrders.forEach((o, i) => {
    console.log(`  ${i + 1}. [${o.friendly_id || o.id}] ${o.customer_name} (${o.customer_email}) - $${Number(o.total).toLocaleString('es-AR')} - Creado: ${o.created_at}`);
  });

  if (isDryRun || (!args.includes('--send') && testIdx === -1)) {
    console.log('\n💡 Para enviar los emails reales, ejecutá:');
    console.log('   rtk node scripts/enviar-recordatorio-pago.mjs --send');
    console.log('   (O probá primero con: rtk node scripts/enviar-recordatorio-pago.mjs --test tu-email@gmail.com)\n');
    return;
  }

  console.log('\n🚀 Iniciando envío de recordatorios...');
  let sentCount = 0;

  for (const order of pendingOrders) {
    if (!order.customer_email) {
      console.log(`⚠️ Orden ${order.friendly_id || order.id} sin email. Omitiendo.`);
      continue;
    }

    const html = buildReminderHtml({
      name: order.customer_name,
      friendlyId: order.friendly_id,
      total: order.total,
      edition: order.edition,
      createdAt: order.created_at
    });

    try {
      console.log(`Enviando a ${order.customer_email} (${order.friendly_id})...`);
      const { data, error: sendErr } = await resend.emails.send({
        from: fromEmail,
        to: order.customer_email,
        subject: '📦 ¡No te cuelgues! Tu Mystery Box te está esperando (Datos de transferencia)',
        html
      });

      if (sendErr) {
        console.error(`  ❌ Error al enviar a ${order.customer_email}:`, sendErr);
        continue;
      }

      // Marcar recordatorio enviado en Supabase si la columna existe
      if (hasReminderCol) {
        await supabase
          .from('orders')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', order.id);
      }

      console.log(`  ✅ Enviado! ID Resend: ${data?.id}`);
      sentCount++;
    } catch (err) {
      console.error(`  ❌ Excepción enviando a ${order.customer_email}:`, err);
    }
  }

  console.log(`\n✨ Proceso finalizado. Total de recordatorios enviados: ${sentCount}/${pendingOrders.length}\n`);
}

// Ejecutar si se llama directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}

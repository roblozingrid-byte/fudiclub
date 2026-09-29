import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPaymentConfirmedEmail } from './email-templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.prod') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Fudi Club <hola@fudiclub.shop>';

async function main() {
  const target = process.argv[2];

  console.log('='.repeat(50));
  console.log('✅ FUDI CLUB - CONFIRMAR PAGO DE PEDIDO');
  console.log('='.repeat(50));

  if (!target) {
    console.log('\nUso:');
    console.log('  rtk node scripts/confirmar-pago.mjs <ID_PEDIDO o EMAIL>');
    console.log('\nEjemplos:');
    console.log('  rtk node scripts/confirmar-pago.mjs FUDI-10-A1B2');
    console.log('  rtk node scripts/confirmar-pago.mjs cliente@gmail.com\n');
    process.exit(1);
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan credenciales de Supabase en .env / .env.prod');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Buscar por friendly_id o id o customer_email
  let query = supabase.from('orders').select('*');

  if (target.toUpperCase().startsWith('FUDI-')) {
    query = query.eq('friendly_id', target.trim());
  } else if (target.includes('@')) {
    query = query.eq('customer_email', target.trim().toLowerCase());
  } else {
    query = query.or(`friendly_id.eq.${target.trim()},id.eq.${target.trim()}`);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('❌ Error buscando orden:', error.message);
    process.exit(1);
  }

  if (!orders || orders.length === 0) {
    console.log(`❌ No se encontró ningún pedido con el identificador "${target}".`);
    return;
  }

  const order = orders[0];
  const friendlyId = order.friendly_id || order.id;
  const customerName = order.customer_name || 'Cliente';
  const customerEmail = order.customer_email || '';
  const totalFormatted = Number(order.total || 0).toLocaleString('es-AR');

  console.log('\n📦 Pedido encontrado:');
  console.log(`   ID:      ${friendlyId}`);
  console.log(`   Cliente: ${customerName} (${customerEmail})`);
  console.log(`   Total:   $${totalFormatted}`);
  console.log(`   Plan:    ${order.plan} (${order.edition || 'Edición actual'})`);
  console.log(`   Estado:  ${order.status.toUpperCase()}`);

  const forceEmail = process.argv.includes('--send-email') || process.argv.includes('--force');

  if ((order.status === 'paid' || order.status === 'approved') && !forceEmail) {
    console.log('\n⚠️ Este pedido YA está confirmado como pagado.');
    console.log('💡 Para reenviarle o enviarle el correo de confirmación de todos modos, ejecutá:');
    console.log(`   rtk node scripts/confirmar-pago.mjs ${target} --send-email\n`);
    return;
  }

  // Actualizar estado a 'paid' si no lo estaba
  if (order.status !== 'paid') {
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateErr) {
      console.error('❌ Error actualizando pedido en Supabase:', updateErr.message);
      process.exit(1);
    }

    console.log('\n✅ ¡Estado actualizado a PAGADO ("paid") en Supabase con éxito!');
  } else {
    console.log('\nℹ️ El pedido ya estaba pagado en Supabase. Enviando correo de confirmación...');
  }

  // Enviar email de confirmación al cliente
  if (customerEmail && resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      console.log(`📧 Enviando correo de confirmación a ${customerEmail}...`);

      const isQuarterly = order.plan === 'quarterly';
      const subject = isQuarterly
        ? '⭐ ¡Plan Trimestral confirmado! Tus Mystery Boxes están aseguradas 📦'
        : '🎉 ¡Pago confirmado! Tu Mystery Box está asegurada 📦';

      const { data, error: emailErr } = await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject,
        html: buildPaymentConfirmedEmail({
          customerName,
          friendlyId,
          edition: order.edition || 'Mystery Box',
          formattedTotal: totalFormatted,
          shippingAddress: order.shipping_address || 'Tu dirección registrada',
          plan: order.plan,
          isQuarterly,
          quantity: order.quantity,
          totalBoxes: order.total_boxes
        })
      });

      if (emailErr) {
        console.error('❌ Error enviando email de confirmación:', emailErr);
      } else {
        console.log(`✅ Email de confirmación enviado al cliente! ID: ${data?.id}`);
      }
    } catch (err) {
      console.error('❌ Excepción enviando email:', err);
    }
  }

  console.log('\n✨ Listo! El pedido está confirmado y asegurado.\n');
}

main().catch(console.error);

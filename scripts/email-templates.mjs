export function formatDeadline(date) {
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
  } catch (_e) {
    return '24 horas desde tu reserva';
  }
}

// 1. Email de Recordatorio de Pago (Transferencia pendiente)
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
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 3px solid #000000; border-radius: 14px; box-shadow: 6px 6px 0px #000000; overflow: hidden;">
          
          <!-- Header Banner -->
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

          <!-- Body -->
          <tr>
            <td style="padding: 28px 25px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #222222;">
                Vimos que reservaste tu lugar para la edición <strong>${edition || 'actual'}</strong>, pero todavía no registramos tu comprobante de transferencia bancaria.
              </p>

              <!-- Plazo Límite -->
              <div style="background-color: #fff4bd; border: 2px solid #000000; border-radius: 8px; box-shadow: 3px 3px 0px #000000; padding: 15px 18px; margin-bottom: 22px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000000;">
                  ⏰ Plazo límite de confirmación:
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #111111;">
                  Tenés tiempo hasta el <strong>${deadlineText}</strong> para enviar tu comprobante. Pasado ese plazo, liberamos el cupo automáticamente para las personas en lista de espera.
                </p>
              </div>

              <!-- Datos Bancarios -->
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

              <!-- CTA WhatsApp -->
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

// 2. Email de Confirmación de Pago para el Cliente
export function buildPaymentConfirmedEmail({
  customerName,
  friendlyId,
  edition,
  formattedTotal,
  shippingAddress,
  plan,
  isQuarterly,
  quantity,
  qty,
  totalBoxes
}) {
  const firstName = (customerName || 'Fudi Lover').trim().split(' ')[0];
  const isPlanQuarterly = Boolean(
    isQuarterly ||
    plan === 'quarterly' ||
    (edition && edition.includes('-')) ||
    (plan && plan.toLowerCase().includes('trimestral'))
  );

  const parsedQty = Number(quantity || qty || 0);
  const parsedBoxes = Number(totalBoxes || 0);
  const numPlans = parsedQty > 0
    ? parsedQty
    : (parsedBoxes > 0 ? Math.round(parsedBoxes / 3) : 1);
  const numBoxes = parsedBoxes > 0
    ? parsedBoxes
    : (numPlans * 3);

  const badgeText = isPlanQuarterly
    ? '⭐ PLAN TRIMESTRAL CONFIRMADO'
    : '🎉 PAGO CONFIRMADO';

  const introText = isPlanQuarterly
    ? `¡Felicitaciones! Tenés asegurado tu cupo para los próximos 3 meses de sorpresas Fudi con ${numPlans > 1 ? `tus <strong>${numPlans} Planes Trimestrales</strong> (${numBoxes} Mystery Boxes en total)` : `tu <strong>Plan Trimestral</strong> (${numBoxes} Mystery Boxes en total)`}. Ya estamos preparando la primera entrega para que vivas una experiencia increíble.`
    : `Tu lugar para la <strong>${edition || 'Mystery Box'}</strong> está oficialmente asegurado. Ya estamos preparando todo para que vivas una experiencia increíble.`;

  const planPillText = numPlans > 1
    ? `${numPlans}x Trimestral (${numBoxes} Mystery Boxes)`
    : `Trimestral (${numBoxes} Mystery Boxes)`;

  let scheduleHtml = '';
  if (isPlanQuarterly) {
    const months = edition && edition.includes('-')
      ? edition.split('-').map(m => m.trim())
      : ['Mes 1', 'Mes 2', 'Mes 3'];

    scheduleHtml = `
      <div style="background-color: #fff4bd; border: 2px solid #000000; border-radius: 8px; padding: 14px 16px; margin: 15px 0 10px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000000;">
          📅 Cronograma estimado de entregas:
        </p>
        <p style="margin: 4px 0; font-size: 13px; color: #111111;">
          📦 <strong>1ª Box (${months[0] || 'Mes 1'}):</strong> Despacho aprox. 15 de ${months[0] || 'este mes'}${numPlans > 1 ? ` (${numPlans} boxes)` : ''}
        </p>
        <p style="margin: 4px 0; font-size: 13px; color: #111111;">
          📦 <strong>2ª Box (${months[1] || 'Mes 2'}):</strong> Despacho aprox. 15 de ${months[1] || 'el próximo mes'}${numPlans > 1 ? ` (${numPlans} boxes)` : ''}
        </p>
        <p style="margin: 4px 0; font-size: 13px; color: #111111;">
          📦 <strong>3ª Box (${months[2] || 'Mes 3'}):</strong> Despacho aprox. 15 de ${months[2] || 'el tercer mes'}${numPlans > 1 ? ` (${numPlans} boxes)` : ''}
        </p>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 1.5; color: #333333;">
        ✨ <em>Importante:</em> Antes de cada despacho te contactaremos para avisarte que tu box va en camino. Además, ¡tu precio y cupo quedan congelados durante todo el trimestre!
      </p>
    `;
  } else {
    scheduleHtml = `
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #222;">
        📦 <strong>¿Cómo sigue todo?</strong> Armamos cada box artesanalmente con la mejor selección secreta. Los despachos se realizan los días <strong>15 de cada mes</strong>. En cuanto tu paquete salga hacia tu domicilio, te avisaremos para que estés atent@.
      </p>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Pago Confirmado! - Fudi Club</title>
</head>
<body style="margin: 0; padding: 0; background-color: #c79fef; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #c79fef; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 3px solid #000000; border-radius: 14px; box-shadow: 6px 6px 0px #000000; overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #4ebaba; padding: 30px 25px 25px 25px; text-align: center; border-bottom: 3px solid #000000;">
              <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto 15px auto;" />
              
              <div style="display: inline-block; background-color: #d1ff5e; color: #000000; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border: 2px solid #000000; border-radius: 20px; box-shadow: 2px 2px 0px #000000; margin-bottom: 12px;">
                ${badgeText}
              </div>

              <h1 style="color: #000000; font-size: 24px; font-weight: 900; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1.2;">
                ¡Ya sos parte del club! 📦✨
              </h1>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111111;">
                ¡Hola ${firstName}! Recibimos tu pago correctamente.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 25px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #222222;">
                ${introText}
              </p>

              <!-- Resumen -->
              <div style="background-color: #ffffff; border: 2px solid #000000; border-radius: 8px; padding: 20px; margin-bottom: 22px;">
                <p style="margin: 6px 0; font-size: 15px;"><strong>ID de Pedido:</strong> <span style="font-family: monospace; font-size: 16px; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${friendlyId}</span></p>
                ${isPlanQuarterly ? `<p style="margin: 6px 0; font-size: 15px;"><strong>Plan:</strong> <span style="background-color: #d1ff5e; padding: 2px 6px; border: 1px solid #000000; border-radius: 4px; font-weight: bold;">${planPillText}</span></p>` : ''}
                <p style="margin: 6px 0; font-size: 15px;"><strong>${isPlanQuarterly ? 'Ediciones Cubiertas:' : 'Edición:'}</strong> <strong>${edition || 'Edición Actual'}</strong></p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Monto Abonado:</strong> <strong style="color: #000000;">$${formattedTotal}</strong></p>
                <p style="margin: 6px 0; font-size: 15px;"><strong>Dirección de Entrega:</strong> ${shippingAddress || 'Tu dirección registrada'}</p>
                
                <hr style="border: 0; border-top: 2px dashed #000000; margin: 15px 0;" />
                
                ${scheduleHtml}
              </div>

              <!-- Contacto -->
              <div style="background-color: #fff4bd; border: 2px solid #000000; border-radius: 8px; box-shadow: 3px 3px 0px #000000; padding: 15px 18px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #000000;">
                  ¿Querés cambiar algún dato de entrega o hacernos una consulta?
                </p>
                <p style="margin: 0; font-size: 13px; color: #222;">
                  Escribinos directo a nuestro WhatsApp: <a href="https://wa.me/5491139264426" target="_blank" style="color: #000000; font-weight: 800; text-decoration: underline;">+54 9 11 3926-4426</a> o respondé este correo.
                </p>
              </div>

              <p style="margin: 0; font-size: 14px; font-weight: 700; text-align: center; color: #000000;">
                ¡Gracias por sumarte a Fudi Club! 💛✨
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

// 3. Email de Instrucciones de Transferencia para el Cliente
export function buildTransferInstructionsEmail({
  name,
  friendlyId,
  total,
  edition,
  createdAt
}) {
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
  <title>Instrucciones de Transferencia - Fudi Club</title>
</head>
<body style="margin: 0; padding: 0; background-color: #c79fef; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #c79fef; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 3px solid #000000; border-radius: 14px; box-shadow: 6px 6px 0px #000000; overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #4ebaba; padding: 30px 25px 25px 25px; text-align: center; border-bottom: 3px solid #000000;">
              <img src="https://fudiclub.shop/imagenes/Logo-blanco-plano.png" alt="Fudi Club" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto 15px auto;" />
              
              <div style="display: inline-block; background-color: #ffb7d5; color: #000000; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border: 2px solid #000000; border-radius: 20px; box-shadow: 2px 2px 0px #000000; margin-bottom: 12px;">
                ⭐ CUPOS LIMITADOS &bull; 30 AL MES
              </div>

              <h1 style="color: #000000; font-size: 24px; font-weight: 900; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1.2;">
                ¡Tu Mystery Box está reservada! 📦✨
              </h1>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111111;">
                ¡Hola ${firstName}! Para confirmar tu pedido, realizá la transferencia con los siguientes datos:
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 25px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #222222;">
                Iniciaste tu reserva para la edición <strong>${edition || 'actual'}</strong>. Apenas envíes tu comprobante, tu lugar queda 100% asegurado.
              </p>

              <!-- Plazo Límite -->
              <div style="background-color: #fff4bd; border: 2px solid #000000; border-radius: 8px; box-shadow: 3px 3px 0px #000000; padding: 15px 18px; margin-bottom: 22px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000000;">
                  ⏰ Plazo límite de confirmación:
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #111111;">
                  Tenés tiempo hasta el <strong>${deadlineText}</strong> para transferir y mandar el comprobante. Pasado ese plazo, el cupo se libera para la lista de espera.
                </p>
              </div>

              <!-- Datos de transferencia -->
              <div style="background-color: #ffffff; border: 2px dashed #000000; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #555555;">
                  Datos para transferir:
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

              <!-- CTA WhatsApp -->
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
                ¿Dudas o consultas? Respondé directamente a este correo o escribinos por WhatsApp y te ayudamos al instante. 💛
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

# Architecture & Design: Transfer Reminders and Branded Emails

## 1. PostHog Funnel Tracking Architecture

El funnel de conversión de transferencias se compone de 4 pasos clave:
1. `checkout_opened`: Inicio del modal/proceso de compra.
2. `order_submitted`: Envío del formulario de compra con método `transfer`.
3. `transfer_details_viewed`: Visualización de pantalla final con CBU/Alias y monto exacto.
4. `whatsapp_receipt_clicked`: Clic directo en el botón `📲 Enviar Comprobante por WhatsApp`.

Al confirmar la compra, se ejecuta `posthog.identify(email, { name, friendly_id, plan, total })` para unificar el usuario anónimo con su identidad de comprador.

## 2. Branded Transactional Email System

El sistema de emails implementa la identidad neobrutalista de Fudi Club:
- **Fondo General**: Lila Fudi `#c79fef`
- **Banner Cabecera**: Turquesa `#4ebaba`
- **Avisos / Plazos**: Amarillo pastel `#fff4bd`
- **Botones de Acción (CTA)**: Verde lima `#d1ff5e`
- **Etiquetas de Plan / Alertas**: Rosa pastel `#ffb7d5`
- **Bordes y Sombras**: Borde negro 2-3px sólido, sombras desplazadas 4px-6px (`box-shadow: 6px 6px 0px #000000;`)
- **Tipografía**: `'Space Grotesk', -apple-system, sans-serif`

### Plantillas Implementadas:
1. `buildTransferInstructionsEmail`: Instrucciones inmediatas al comprar (CBU, Alias, Monto, ID, botón WhatsApp).
2. `buildReminderHtml`: Recordatorio enviado a las órdenes con más de N horas pendientes. Incluye cuenta regresiva/plazo de 24 horas (`formatDeadline`), datos de transferencia y botón directo a WhatsApp.
3. `buildPaymentConfirmedEmail`:
   - Para compra única: Confirmación de 1 box, edición asegurada y fecha de despacho (los 15 de cada mes).
   - Para Plan Trimestral: Sticker `⭐ PLAN TRIMESTRAL CONFIRMADO`, conteo dinámico de planes y boxes totales (ej. `2 Planes Trimestrales (6 Mystery Boxes en total)`), píldora `Trimestral (X Mystery Boxes)`, frase `"sorpresas Fudi"`, y tabla de cronograma mensual (`📅 Cronograma estimado de entregas:`).
4. `buildAdminOrderNotificationEmail`: Correo que recibe la administración con los datos completos del comprador y el botón seguro de aprobación inmediata.

## 3. One-Click Payment Confirmation (HMAC Token Security)

Para permitir que el admin confirme pagos sin exponer la base de datos ni requerir inicio de sesión en Supabase Studio:
1. Al crearse la orden en `create-order`, se genera un token HMAC-SHA256 usando `crypto.subtle`:
   `token = HMAC_SHA256(orderId, ADMIN_CONFIRM_SECRET)`
2. El correo del admin incluye un botón con enlace a la Edge Function `confirm-payment`:
   `https://<project>.supabase.co/functions/v1/confirm-payment?order_id=<UUID>&token=<HMAC>`
3. La Edge Function valida la firma criptográfica:
   - Si es válida: actualiza `orders.status` a `'paid'` y envía el correo de confirmación de pago al cliente mediante Resend.
   - Si ya estaba pagada: muestra un aviso informativo amigable con estilo neobrutalista indicando que ya había sido aprobada previamente.
   - Si es inválida: rechaza con código 403.
4. Soporte CLI alternativo: Script `scripts/confirmar-pago.mjs <ID_PEDIDO>` para confirmación manual desde terminal.

## 4. Reminder Dispatcher Logic (`enviar-recordatorio-pago.mjs`)

- Admite flags:
  - `--hours <N>`: Filtra pedidos pendientes con más de N horas (por defecto 24 horas).
  - `--dry-run`: Modo simulación sin envío de emails.
  - `--send`: Confirmación explícita para enviar los correos a los clientes calificados.
  - `--test <email>`: Envío de prueba a una casilla específica.
- Base de Datos:
  - Lee pedidos con `payment_method = 'transfer'` y `status = 'pending'`.
  - Columna de control: `reminder_sent_at` (migration `20260929130000_add_reminder_sent_at.sql`) para garantizar idempotencia y evitar re-envíos duplicados.

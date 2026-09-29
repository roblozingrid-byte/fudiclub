# Tasks: Transfer Reminders and Branded Emails

- [x] 1.0 PostHog Funnel Tracking
  - [x] 1.1 Agregar evento `transfer_details_viewed` al mostrar datos bancarios en el checkout.
  - [x] 1.2 Agregar ID `btn-whatsapp-proof` y capturar evento `whatsapp_receipt_clicked` en el botón de WhatsApp.
  - [x] 1.3 Ejecutar `posthog.identify` tras la creación de órdenes con datos del cliente.
  - [x] 1.4 Ingestar eventos de prueba en PostHog para disponibilidad inmediata en la UI de creación de funnels.

- [x] 2.0 Admin One-Click Payment Confirmation
  - [x] 2.1 Crear generador y validador de tokens HMAC en `supabase/functions/_shared/token.ts`.
  - [x] 2.2 Crear Edge Function `confirm-payment` para actualizar `orders.status` a `'paid'` y disparar email al cliente.
  - [x] 2.3 Actualizar `create-order` para generar el enlace con token seguro e incluir el botón de aprobación en el correo del admin.
  - [x] 2.4 Crear script CLI alternativo `scripts/confirmar-pago.mjs`.

- [x] 3.0 Centralized Neo-Brutalist Transactional Emails
  - [x] 3.1 Centralizar plantillas en `supabase/functions/_shared/email-templates.ts` y sincronizar en `scripts/email-templates.mjs`.
  - [x] 3.2 Aplicar paleta neobrutalista oficial Fudi Club (`#c79fef`, `#4ebaba`, `#fff4bd`, `#d1ff5e`, `#ffb7d5`).
  - [x] 3.3 Diseñar correo de recordatorio con cálculo de fecha límite de 24 horas (`formatDeadline`), datos bancarios y botón de WhatsApp, sin menciones a Mercado Pago.
  - [x] 3.4 Actualizar correos en `create-order`, `confirm-payment` y `webhook-mp`.

- [x] 4.0 Quarterly Subscription Support in Confirmation Emails
  - [x] 4.1 Incorporar sticker `⭐ PLAN TRIMESTRAL CONFIRMADO`.
  - [x] 4.2 Soportar cantidad dinámica de planes y boxes totales (ej. Carolina con 2 planes = 6 boxes).
  - [x] 4.3 Eliminar palabra "Plan" repetida dentro de la píldora (`Trimestral (X Mystery Boxes)`).
  - [x] 4.4 Cambiar redacción a `"sorpresas Fudi"`.
  - [x] 4.5 Ajustar encabezado del cronograma a `📅 Cronograma estimado de entregas:` desglosando los meses cubiertos.

- [x] 5.0 Database Migrations & Tooling
  - [x] 5.1 Crear migración `20260929130000_add_reminder_sent_at.sql` para trazabilidad de recordatorios.
  - [x] 5.2 Crear script de recordatorios `scripts/enviar-recordatorio-pago.mjs` con soporte para `--hours`, `--dry-run`, `--send` y `--test`.
  - [x] 5.3 Crear script de pruebas `scripts/test-confirmacion-email.mjs` con flag `--quarterly`.

- [x] 6.0 Automated Testing & Validation
  - [x] 6.1 Crear y ejecutar suite de pruebas con Vitest en `tests/email-templates.test.js`, `tests/email-validator.test.js` y `tests/checkout.test.js`.
  - [x] 6.2 Verificar que los 69 tests pasen en verde.
  - [x] 6.3 Ejecutar envíos de prueba reales hacia la casilla autorizada `ingrid.robles@hotmail.com`.

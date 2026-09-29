# Spec: Transfer Payment Workflow

## Purpose
Establecer el ciclo de vida, rastreo, recordatorio y confirmación de pedidos realizados mediante transferencia bancaria en Fudi Club.

## Requirements

### Requirement: Funnel Tracking en Checkout
El sistema DEBE disparar eventos específicos en PostHog para medir cada etapa del pago por transferencia bancaria.

#### Scenario: Visualización de datos de transferencia
- **GIVEN** el usuario completó el formulario de compra con método `transfer`
- **WHEN** la pantalla de confirmación muestra el CBU, Alias, monto e ID del pedido
- **THEN** se envía el evento `transfer_details_viewed` a PostHog con el ID de la orden y monto

#### Scenario: Clic en envío de comprobante por WhatsApp
- **GIVEN** el usuario visualiza los datos bancarios y el botón de WhatsApp
- **WHEN** el usuario hace clic en `📲 Enviar Comprobante por WhatsApp`
- **THEN** se envía el evento `whatsapp_receipt_clicked` a PostHog antes de abrir el enlace a WhatsApp

### Requirement: Confirmación Administrativa en 1 Clic
El sistema DEBE permitir a la administración confirmar pedidos por transferencia directamente desde el correo electrónico de notificación.

#### Scenario: Administradora aprueba pago desde correo
- **GIVEN** un correo de notificación de nueva compra con un token HMAC válido
- **WHEN** la administradora hace clic en `✅ Confirmar Pago y Enviar Email`
- **THEN** la Edge Function `confirm-payment` valida el token, actualiza el estado del pedido a `paid` en Supabase y dispara automáticamente el correo de confirmación de pago al cliente

#### Scenario: Pedido previamente confirmado
- **GIVEN** un pedido que ya se encuentra en estado `paid` o `approved`
- **WHEN** se accede nuevamente al enlace de confirmación
- **THEN** el sistema responde con una pantalla informativa indicando que el pedido ya fue aprobado con anterioridad y no reenvía correos duplicados

### Requirement: Despacho de Recordatorios de Pago
El sistema DEBE proveer un mecanismo para identificar pedidos pendientes y enviarles recordatorios con límite de 24 horas.

#### Scenario: Pedido pendiente por más de 24 horas
- **GIVEN** un pedido con `payment_method = 'transfer'`, `status = 'pending'` y `reminder_sent_at IS NULL`
- **WHEN** se ejecuta el script de recordatorio
- **THEN** se envía un correo con los datos de transferencia, la fecha límite calculada a 24 horas de la creación y se actualiza `reminder_sent_at`

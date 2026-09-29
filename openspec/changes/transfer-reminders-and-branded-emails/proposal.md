## Why

Los clientes que eligen pagar por transferencia bancaria ven los datos bancarios (CBU/Alias) en pantalla y reciben un correo con las instrucciones, pero algunos no terminan de enviar su comprobante por WhatsApp o no completan la transferencia. 

Para resolver esto y maximizar la conversión de ventas por transferencia, necesitábamos:
1. Rastrear en PostHog con eventos dedicados (`transfer_details_viewed`, `whatsapp_receipt_clicked`, e `identify`) para armar funnels de conversión claros.
2. Un sistema de recordatorios por email con sentido de urgencia (plazo límite de 24 horas), diseño neobrutalista alineado con la marca Fudi Club (`#c79fef`, `#4ebaba`, `#fff4bd`, `#d1ff5e`, `#ffb7d5`), sin menciones a medios de pago no disponibles (como Mercado Pago).
3. Un mecanismo rápido de confirmación de 1 clic para el administrador (vía HMAC seguro en email y CLI) que actualice la base de datos a `status: 'paid'`, evite el envío de recordatorios y dispare automáticamente el correo de confirmación al cliente.
4. Adaptar la confirmación de pago tanto para compras individuales como para suscriptores del Plan Trimestral (3 boxes), desglosando los meses cubiertos y el cronograma estimado de entregas.

## What Changes

- **PostHog Tracking**: Se agregaron los eventos `transfer_details_viewed` y `whatsapp_receipt_clicked` en el checkout, junto con `posthog.identify` con el email del cliente y el ID del pedido.
- **Plantillas Transaccionales Centralizadas**: Creación de módulos reutilizables `email-templates.ts` (en `supabase/functions/_shared/`) y `email-templates.mjs` (en `scripts/`) con diseño 100% Neobrutalism (Space Grotesk, bordes negros 3px, sombras duras 6px 6px, paleta Fudi Club).
- **Email de Recordatorio de Transferencia**: Incluye datos bancarios, botón directo a WhatsApp con mensaje prearmado, fecha y hora límite de reserva calculada a 24 horas (`formatDeadline`), y sin referencias a Mercado Pago.
- **Confirmación de Pago en 1 Clic para Admin**: Edge Function `confirm-payment` con tokens HMAC-SHA256 que permite a la administradora aprobar pagos desde su correo con un solo clic, actualizando `status` a `'paid'` y notificando al cliente.
- **Soporte Dinámico para Plan Trimestral**: El correo de confirmación adapta su sticker a `⭐ PLAN TRIMESTRAL CONFIRMADO`, calcula cantidad de planes y boxes totales (ej. Carolina con 2 planes = 6 boxes), elimina duplicidad de palabras en la píldora (`Trimestral (3 Mystery Boxes)`), utiliza la frase `"sorpresas Fudi"` y muestra el cronograma mes a mes.
- **Suite de Pruebas Automatizadas (Vitest)**: Cobertura completa de validación de emails, cálculo de plazos límite, y renderizado HTML tanto para compra única como suscripciones trimestrales (69 tests unitarios pasando en verde).

## Capabilities

### New Capabilities
- `transfer-payment-workflow`: Flujo integral de seguimiento, recordatorio y confirmación de pagos por transferencia bancaria.
- `branded-transactional-emails`: Sistema unificado de plantillas de correo neobrutalistas para todas las comunicaciones de clientes y administración.

### Modified Capabilities
- `checkout-flow`: Integración de tokens de confirmación en correos de administración y disparadores automáticos de confirmación al cliente.
- `posthog-analytics`: Adición de eventos para pasos clave de transferencia y envío de comprobante.

## Impact

- **Seguridad**: Tokens HMAC seguros firmados para confirmación de órdenes sin requerir login manual en Supabase Studio.
- **Operación**: Reducción del tiempo de confirmación de comprobantes recibidos por WhatsApp a un solo toque en el correo.
- **Retención y Conversión**: Recuperación de compras abandonadas mediante recordatorios automáticos con urgencia calculada de 24 horas.

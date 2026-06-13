## 1. Actualización de Textos en UI (HTML)

- [x] 1.1 Modificar el texto "Suscripción Trimestral" a "Plan Trimestral (Pago Único)" en la tarjeta de selección del plan trimestral en `index.html`.
- [x] 1.2 Reemplazar la nota "(*el pago se debita cada 10 del mes)" por "Sin renovación automática" en `index.html`.

## 2. Actualización de Totales y Resumen de Pedido (JS)

- [x] 2.1 Modificar `updateCheckoutTotals()` en `main.js` para que el label del subtotal indique explícitamente "Subtotal (3 boxes)" en lugar de "Subtotal (Box 1 de 3)" cuando se elige el plan trimestral.
- [x] 2.2 Modificar la generación del pedido (en el submit del formulario) para que el payload de la pasarela de pago formaté explícitamente el plan como "Compra Única (1 caja)" o "Plan Trimestral (Pago Único 3 cajas)".

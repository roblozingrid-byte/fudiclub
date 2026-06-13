## Context

Fudi Club ofrece la posibilidad de comprar un Plan Trimestral (3 cajas) para asegurar cupos, pero debe quedar muy claro que no es un débito automático mensual, sino un pago único adelantado, y no tiene renovación automática según las especificaciones del negocio. El HTML actual muestra la opción "Suscripción Trimestral" y "Ahorrás $13.500 por ciclo" pero necesita un lenguaje más preciso para evitar confusiones de facturación, además de que la selección debe propagarse al resumen de envío por WhatsApp.

## Goals / Non-Goals

**Goals:**
- Actualizar el copy (texto) de las tarjetas de compra en `index.html` para el plan trimestral.
- Modificar el comportamiento de la actualización de totales (`main.js`) para cambiar los labels de la UI (ej. "Subtotal (3 boxes)" en lugar de "Subtotal (Box 1 de 3)") para ser coherentes con un pago único completo.
- Añadir la información del plan trimestral en la generación del mensaje final de WhatsApp.

**Non-Goals:**
- No se implementará el recordatorio automático de las 72hs de prioridad para clientes trimestrales (se manejará operativamente vía mail externo).

## Decisions

- **Textos en UI**: Cambiar "Suscripción Trimestral" a "Plan Trimestral (Pago Único)". Reemplazar "(*el pago se debita cada 10 del mes)" por "Sin renovación automática".
- **Cálculo de Totales**: La función `updateCheckoutTotals` en `main.js` cambiará los labels para ser precisos respecto a lo que se está cobrando (las 3 cajas enteras ahora mismo).
- **Payload de Checkout**: Modificar la generación del pedido (`main.js`) para explicitar si es una "Compra Única (1 caja)" o un "Plan Trimestral (Pago Único 3 cajas)".

## Risks / Trade-offs

- **Fricción de Pago Inicial**: Al aclarar fuertemente que es un pago grande de una sola vez, podría asustar al usuario.
  - *Mitigación*: Es un requerimiento estricto del negocio no engañar al usuario respecto a la facturación. La claridad evitará problemas de atención al cliente y chargebacks.

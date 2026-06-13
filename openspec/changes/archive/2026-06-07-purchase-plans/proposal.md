## Why

Para cumplir con la especificación de negocio (`business-fudi-club`), Fudi Club ofrece un plan de Suscripción Trimestral (compra prepaga de 3 meses). Actualmente, el formulario de la página web muestra la opción visual del plan, pero es necesario asegurar que la lógica comunique de forma clara que es un pago único por adelantado sin renovación automática, y que se incluya esta elección correctamente en el mensaje de confirmación del pedido generado.

## What Changes

- Mejorar los textos descriptivos en `index.html` para la opción del Plan Trimestral, aclarando explícitamente que es un "Pago único adelantado por 3 meses" y que "No tiene renovación automática".
- Modificar la lógica de generación del resumen del pedido (`main.js`) para que incluya no solo qué plan se eligió, sino también si aplica a un paquete de 3 cajas en total.

## Capabilities

### New Capabilities
- `purchase-plans`: Funcionalidad para gestionar las diferentes opciones de compra (Mensual vs Trimestral), asegurar la correcta comunicación de precios y plazos, e incluirlos en la orden.

### Modified Capabilities

## Impact

- **Archivos Modificados**: `index.html` (ajustes en descripciones de planes), `main.js` (inclusión del plan en el mensaje de confirmación generado).
- **Experiencia de Usuario**: Mayor claridad respecto a lo que implica suscribirse al plan trimestral y cómo funciona la facturación (pago único adelantado, sin cargos sorpresa mensuales).

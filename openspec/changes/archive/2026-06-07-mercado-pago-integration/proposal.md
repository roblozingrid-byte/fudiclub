## Why

De acuerdo con la definición de negocio, Fudi Club no procesará ventas a través de WhatsApp; todo el proceso de cobro debe ocurrir en la web. Actualmente, el formulario de pago en `index.html` solicita datos de tarjeta de crédito estáticos sin ninguna pasarela real por detrás. Se necesita estructurar el flujo de salida hacia Mercado Pago para finalizar la transacción, dejando WhatsApp únicamente como un canal de soporte técnico.

## What Changes

- Reemplazar los campos de tarjeta de crédito falsos en el checkout por una selección de método de pago más realista (ej. Mercado Pago Checkout o Transferencia Bancaria).
- Implementar la lógica final del evento `submit` del checkout en `main.js`. Como actualmente la web es 100% estática (frontend) y Mercado Pago requiere un backend para generar un "Preference ID" de forma segura, simularemos la petición a la API.
- Al confirmar el pedido, mostraremos un estado de "Procesando" y luego una redirección simulada o un Modal de Éxito, dejando el código listo para reemplazar el fetch simulado por el endpoint real en el futuro.
- Añadir un botón flotante o enlace visible hacia WhatsApp con el fin exclusivo de Soporte.

## Capabilities

### New Capabilities
- `payment-gateway`: Simulación de la comunicación con el procesador de pagos para finalizar la conversión en la web.
- `customer-support`: Enlace directo a WhatsApp para consultas o problemas con el servicio.

### Modified Capabilities
- El flujo de checkout existente será modificado para quitar los campos manuales de tarjeta.

## Impact

- **Archivos Modificados**: `index.html` (quitar campos de tarjeta, agregar opciones MP/Transferencia, agregar link de soporte), `main.js` (actualizar el `submit` del `paymentForm` para simular el request a una API y manejar la respuesta).
- **Experiencia de Usuario**: El usuario sentirá que la web gestiona todo el pago de forma autónoma.

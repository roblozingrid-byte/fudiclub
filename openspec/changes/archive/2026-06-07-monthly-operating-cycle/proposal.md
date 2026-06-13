## Why

Para cumplir con la especificación de negocio de Fudi Club, es necesario operar en un ciclo mensual fijo donde los cupos de un mes cierran el día 5. Las compras realizadas después de este día deben asignarse automáticamente al próximo mes. Actualmente, la página web no tiene lógica para calcular ni informar al cliente qué edición mensual está comprando.

## What Changes

- Implementar lógica en JavaScript para calcular el ciclo operativo basado en la fecha actual. Si la compra es antes del fin del día 5, corresponde al mes en curso. Si es después, corresponde al mes siguiente.
- Actualizar la interfaz de usuario en el flujo de compra para indicar claramente cuál es la primera caja o edición que el cliente va a recibir.
- Incluir la edición asignada en el resumen de compra y en el mensaje generado para finalizar el checkout.

## Capabilities

### New Capabilities
- `checkout-cycle`: Lógica para el cálculo de la edición mensual de entrega y su integración en el flujo de checkout.

### Modified Capabilities
- Ninguna. Los requerimientos de negocio de `business-fudi-club` se mantienen; estamos creando el spec del sistema para cumplirlos.

## Impact

- **Archivos Modificados**: `main.js` (lógica de cálculo de fechas y checkout), `index.html` (elementos de interfaz para mostrar la edición correspondiente).
- **Experiencia de Usuario**: Transparencia sobre el mes de entrega en el momento de la compra.

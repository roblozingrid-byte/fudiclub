## Why

Para cumplir con la especificación de negocio piloto (`business-fudi-club`), la capacidad operativa de Fudi Club está limitada inicialmente a un máximo de 30 cajas por edición. Cuando este cupo se agota, en lugar de bloquear completamente las ventas, el negocio busca ofrecer flexibilidad: permitir al usuario asegurar su caja para el *siguiente* mes (pre-compra), o en su defecto, anotarse en una Lista de Espera (Waitlist) para ser notificado. Actualmente, el widget muestra un "50" fijo y el checkout no reacciona ante la falta de inventario.

## What Changes

- Ajustar el widget de inventario para que el máximo base sea de 30 cajas.
- Implementar la lógica de estado de stock: si el stock de la edición actual llega a 0, la interfaz principal del checkout presentará un paso intermedio o una bifurcación de opciones.
- Opción 1 (Pre-compra): Permite completar el flujo de checkout normal, pero forzando la asignación a la edición del mes siguiente.
- Opción 2 (Waitlist): Muestra un componente de "Lista de Espera" capturando el correo del usuario interesado en lugar de cobrarle.

## Capabilities

### New Capabilities
- `stock-control`: Lógica que delimita el límite operativo por ciclo y bifurca el flujo de usuario cuando se agota.
- `waitlist`: Componente y funcionalidad para capturar correos electrónicos de usuarios que prefieren no pre-comprar.

### Modified Capabilities

## Impact

- **Archivos Modificados**: `index.html` (nuevos bloques HTML para las opciones de Agotado y Waitlist), `style.css` (estilos para estos nuevos flujos), y `main.js` (variable de estado, modificación de `calculateCurrentEdition` si hay pre-compra, y manejo de la interfaz).
- **Experiencia de Usuario**: Transparencia total. El usuario sabe que se agotó el mes actual, pero no pierde la oportunidad de asegurar su cupo futuro o al menos dejar su contacto.

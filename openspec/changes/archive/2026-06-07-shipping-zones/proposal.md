## Why

El documento de negocio `business-fudi-club` exige cobrar el envío por separado del costo de la caja y distinguir los costos según la zona de cobertura. Actualmente, el sistema utiliza un costo de envío fijo de $2.500. Al no tener una forma de segmentar la dirección, Fudi Club no puede calcular automáticamente el costo real de mensajería (que varía entre CABA, GBA y el Interior).

## What Changes

- Reemplazar el cálculo estático de envío en el checkout por una lógica dinámica que infiera la zona basándose en el **Código Postal (CP)** ingresado.
- Añadir un campo `<input type="text" id="cpInput">` (Código Postal) junto a la dirección.
- Calcular en tiempo real el costo de envío (ej. 1000-1499: CABA $2.500, 1600-1900: GBA $4.000, otros: Interior $6.000) y actualizar los totales del carrito.

## Capabilities

### Modified Capabilities
- `checkout`: Se añade el campo Código Postal y una lógica de cotización de envío automática.

## Impact

- **Archivos Modificados**: `index.html` (para añadir el input de CP), `main.js` (lógica de detección de zona por rangos de CP).
- **Experiencia de Usuario**: El cliente solo ingresa su CP y el envío se calcula solo, reduciendo clics y fricción.

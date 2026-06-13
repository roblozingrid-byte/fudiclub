## 1. Modificación de la Interfaz (HTML/CSS)

- [x] 1.1 En `index.html`, ubicar la sección "DATOS PERSONALES" donde está el `<input id="addressInput">`.
- [x] 1.2 Agregar junto a la dirección o en la misma línea (usando `.split-inputs` si es necesario) un `<input type="text" id="cpInput" class="neo-input" placeholder="Código Postal (ej. 1405)" required maxlength="8">`.

## 2. Lógica de Cálculo de Precios (JS)

- [x] 2.1 En `main.js`, buscar la variable `const deliveryFee = 2500;` y eliminarla de su ámbito estático global para que se calcule dinámicamente.
- [x] 2.2 En la función `updateCheckoutTotals()`, leer el CP ingresado: `const cp = parseInt(document.getElementById('cpInput')?.value) || 0;`
- [x] 2.3 Determinar la tarifa de envío con lógica de rangos: si `cp` entre 1000 y 1499 (CABA) -> $2500. Si `cp` entre 1600 y 1900 (GBA) -> $4000. Si no, si `cp > 0` -> $6000 (Interior). Si `cp == 0` -> $0 (o a calcular).
- [x] 2.4 Actualizar el cálculo de la variable `total` en `updateCheckoutTotals()` usando la tarifa inferida.
- [x] 2.5 Actualizar el HTML de desglose (`#summary-delivery`) para mostrar el precio real de envío.
- [x] 2.6 Añadir un Event Listener en `main.js` para que cuando el usuario escriba en `#cpInput` (`input` event), se llame automáticamente a `updateCheckoutTotals()` para refrescar el precio en la pantalla.

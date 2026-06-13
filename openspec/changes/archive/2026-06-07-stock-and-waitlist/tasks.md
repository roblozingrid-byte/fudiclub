## 1. Modificaciones en la Interfaz (HTML/CSS)

- [x] 1.1 Dentro de `#expandedCheckout`, agregar un contenedor `#sold-out-options` (oculto por defecto) que ofrezca dos botones: "Asegurar caja para el próximo mes" y "Anotarme en lista de espera".
- [x] 1.2 Agregar un contenedor `#waitlist-container` (oculto por defecto) con input de email y botón de submit.
- [x] 1.3 Modificar los estilos de `style.css` para el globo flotante de stock (estado agotado) y para dar formato a los nuevos contenedores `#sold-out-options` y `#waitlist-container`.

## 2. Modificaciones de Lógica de Stock y Flujo (JS)

- [x] 2.1 En `main.js`, definir `const AVAILABLE_STOCK = 0;` (o variable) y una bandera `let isPreorderMode = false;`.
- [x] 2.2 Actualizar `updateStockWidget()`: si `AVAILABLE_STOCK <= 0`, el texto será "¡Edición Agotada!".
- [x] 2.3 Actualizar `initCheckoutFlow()`: al abrir, si stock <= 0, ocultar `#paymentForm`/planes y mostrar `#sold-out-options`.
- [x] 2.4 Manejar el evento del botón "Asegurar caja próximo mes": activar `isPreorderMode = true`, ocultar `#sold-out-options`, mostrar `#paymentForm` y re-evaluar la edición actual.
- [x] 2.5 Modificar `calculateCurrentEdition()`: si `isPreorderMode` es true, forzar a que retorne el mes siguiente sin importar el día actual.
- [x] 2.6 Manejar el evento del botón "Anotarme en lista de espera": ocultar `#sold-out-options`, mostrar `#waitlist-container`.
- [x] 2.7 Manejar el submit del Waitlist form simulando la captura y mostrando un mensaje de éxito.

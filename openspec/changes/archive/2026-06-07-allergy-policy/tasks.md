## 1. Modificación de la Interfaz (HTML/CSS)

- [x] 1.1 En `index.html`, ubicar el bloque `#allergyDetails` y añadir dentro un bloque de advertencia (ej. `<div class="allergy-warning">`).
- [x] 1.2 Dentro del bloque de advertencia, añadir un texto legal explicativo ("Entiendo que Fudi Club intenta adaptar la caja, pero no puede garantizar la ausencia de trazas...").
- [x] 1.3 Añadir un checkbox obligatorio (`<input type="checkbox" id="allergyConsent" required>`) junto al texto.
- [x] 1.4 En `style.css`, agregar los estilos para `.allergy-warning` (fondo amarillo suave, bordes, espaciado) para que el Disclaimer resalte visualmente.

## 2. Modificación Lógica de Validación (JS)

- [x] 2.1 En `main.js`, en el listener del submit de `#paymentForm`, agregar una validación antes de simular el pago:
- [x] 2.2 Verificar si `allergyToggle.checked` es verdadero.
- [x] 2.3 Si es verdadero, verificar si `allergyConsent.checked` es verdadero.
- [x] 2.4 Si el consentimiento no está marcado, mostrar un mensaje de error o alerta y usar `return` para abortar el envío del formulario.

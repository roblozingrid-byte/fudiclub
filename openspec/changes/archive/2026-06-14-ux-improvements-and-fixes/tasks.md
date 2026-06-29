## 1. Correcciones de UX y CSS

- [x] 1.1 En `style.css`, agregar una nueva clase de animación (ej. `@keyframes pulse-error`) y aplicarla a una clase `.error-pulse` que afecte al borde rojo intenso.
- [x] 1.2 En `style.css`, agregar una animación de pulso infinito (`@keyframes pulse-btn`) y asignarla a una nueva clase `.pulsing-play` para el botón de reproducción musical.
- [x] 1.3 En `style.css`, mejorar la clase de `success-modal` y/o `.waitlist-container` para que, cuando se oculta el formulario, la vista quede limpia.

## 2. Refactorización Lógica Principal (`main.js`)

- [x] 2.1 En `main.js`, reemplazar `import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL` por `import.meta.env.VITE_SUPABASE_FUNCTIONS_URL` (o su acceso estricto asegurando soporte de fallback).
- [x] 2.2 En `main.js`, modificar la lógica del `initRetroPlayer` para que el botón de play tenga inicialmente la clase `.pulsing-play`, y removerla cuando se dispare el evento de `play`.
- [x] 2.3 En `main.js`, dentro de `initCheckoutFlow()`, modificar la validación de alergias: reemplazar el `alert()` por un `classList.add('error-pulse')` al contenedor o al checkbox `allergyConsent` (y removerlo a los pocos segundos).
- [x] 2.4 En `main.js`, dentro de `initCheckoutFlow()`, en el manejador del `btnJoin`, modificar el bloque que evalúa el stock: `if (AVAILABLE_STOCK <= 0 || new Date().getDate() > 5)` debe mostrar siempre `soldOutOptions` para forzar preventa/waitlist.
- [x] 2.5 En `main.js`, dentro del submit de `waitlistForm`, ocultar completamente `waitlist-container` u `options` al responder éxito, para mostrar solo un mensaje limpio en lugar del UI residual.
- [x] 2.6 En `main.js`, dentro del submit de `paymentForm`, asegurarse de que `btnSubmit.disabled = true` bloquee todo el form.

## 3. Integración de Stock Dinámico

- [x] 3.1 En `main.js` u otro archivo JS, implementar una función `fetchStock()` que consulte vía API a Supabase la cantidad de órdenes (ej. `GET /rest/v1/orders?select=id`).
- [x] 3.2 Restar la cantidad de órdenes obtenidas al límite mensual de 30 para asignar el valor real a la variable global de stock en lugar de utilizar `const AVAILABLE_STOCK = 30;` hardcodeado.
- [x] 3.3 Reemplazar las llamadas asíncronas para que el widget de stock y el checkout inicialicen basados en este valor devuelto en vez del estático.

## 1. Modificaciones en la Interfaz (HTML/CSS)

- [x] 1.1 En `index.html`, eliminar los inputs de tarjeta de crédito (Número, MM/AA, CVC) de la sección "MÉTODO DE PAGO".
- [x] 1.2 Reemplazar los inputs con opciones tipo `radio` para seleccionar el método: "Mercado Pago (Tarjetas, Dinero en cuenta)" y "Transferencia Bancaria".
- [x] 1.3 Agregar un contenedor `#success-modal` (oculto por defecto) dentro del checkout que servirá para mostrar el estado final de éxito y la redirección ficticia.
- [x] 1.4 Agregar un enlace/botón de WhatsApp dedicado exclusivamente a "Soporte" (puede ser un ícono flotante fijo en la pantalla inferior derecha o un link en el footer).
- [x] 1.5 Ajustar `style.css` para el nuevo selector de métodos de pago y para el botón de WhatsApp flotante.

## 2. Modificaciones de Lógica de Pago (JS)

- [x] 2.1 En `main.js`, localizar o crear el manejador de `submit` para `#paymentForm`.
- [x] 2.2 Al enviar el formulario, prevenir el comportamiento por defecto, cambiar el texto del botón de confirmación a "Procesando..." y deshabilitarlo para evitar clicks múltiples.
- [x] 2.3 Simular una llamada a la API con un `setTimeout` de 2 segundos.
- [x] 2.4 Dentro del callback del `setTimeout`, ocultar la sección principal del checkout y mostrar el `#success-modal`.
- [x] 2.5 Si el método seleccionado era Transferencia, el modal de éxito mostrará un texto con datos bancarios falsos (CBU, Alias). Si era MP, mostrará "Redirigiendo a Mercado Pago...".

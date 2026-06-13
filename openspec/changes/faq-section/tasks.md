## 1. Modificación de la Interfaz (HTML/CSS)

- [x] 1.1 En `index.html`, ubicar la sección `<section class="checkout neo-border-section" id="registro">`.
- [x] 1.2 Justo ANTES de esa sección, insertar una nueva sección para el FAQ: `<section class="faq-section neo-border-section" id="faq">`.
- [x] 1.3 Añadir un título `<h2>` y el contenedor de los items del acordeón (`.faq-container`).
- [x] 1.4 Crear 4 bloques `.faq-item` con sus respectivas preguntas (`.faq-question`) y respuestas (`.faq-answer`):
  - Q1: ¿Cuándo me llega la caja? (R: Los despachos se realizan los días 15. Demora de 3 a 7 días hábiles según la zona).
  - Q2: ¿Qué pasa si un producto llega dañado? (R: Tenés 48hs desde que recibís la caja para reportarlo a nuestro WhatsApp de soporte con fotos).
  - Q3: ¿Es una suscripción que se renueva sola? (R: No. Pagás por única vez o elegís un plan de 3 meses. No hay débitos sorpresa).
  - Q4: ¿Puedo elegir qué trae la caja? (R: Es una Mistery Box. ¡Esa es la gracia!).
- [x] 1.5 En `style.css`, verificar si ya existen estilos para `.faq-section`, `.faq-item`, `.faq-question`, `.faq-answer` y `.faq-item.active`. Si no existen o están incompletos, añadirlos para que funcionen como un acordeón oculto/visible suave.

## 2. Modificación de Lógica de Interacción (JS)

- [x] 2.1 En `main.js`, buscar la función `initFAQ()` (debería existir una referencia en el `DOMContentLoaded` y la declaración de la función).
- [x] 2.2 Asegurar que `initFAQ()` seleccione todos los `.faq-item` y les añada un event listener en la `.faq-question`.
- [x] 2.3 Al hacer clic en la pregunta, hacer un "toggle" de la clase `.active` en el `.faq-item` padre.
- [x] 2.4 Asegurarse de que al abrir uno, los demás se cierren (comportamiento de acordeón clásico).

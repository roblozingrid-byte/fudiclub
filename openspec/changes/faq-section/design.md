## Context

En `main.js` ya existe una función vacía o no utilizada `initFAQ()` que sugiere que alguna vez se pensó en una sección de FAQ o se usó en un prototipo. Sin embargo, no hay un bloque HTML correspondiente en `index.html`. 

## Goals / Non-Goals

**Goals:**
- Implementar una sección visual de "Preguntas Frecuentes" con estilo de acordeón desplegable (Accordion).
- Responder explícitamente a: Tiempos de envío, Política de daños (48hs), Renovación (no automática) y Alergias/Contenido de la caja.

**Non-Goals:**
- No crearemos una página separada para FAQ ni Términos y Condiciones completos por ahora; todo vivirá en la landing para máxima visibilidad.

## Decisions

- **Estructura HTML**: Añadiremos un `<section class="faq-section neo-border-section">` justo arriba de la sección de `checkout`.
- **Estructura del Acordeón**:
  - Contenedor `.faq-item`
  - Pregunta `.faq-question` (con un ícono `+` o flecha)
  - Respuesta `.faq-answer` (oculta por defecto, se muestra al hacer clic)
- **Estilos CSS**:
  - Utilizaremos bordes definidos (`neo-border`) y tipografía consistente (`Space Grotesk`).
  - Animación suave para abrir/cerrar (`max-height` transition).
- **Lógica JS**: 
  - Revivir/actualizar la función `initFAQ()` en `main.js` para añadir `click` listeners a `.faq-question` y alternar la clase `.active` en el `.faq-item` padre.

## Risks / Trade-offs

- **Extensión de la página**: Agregar mucho texto puede hacer que la página sea demasiado larga.
  - *Mitigación*: El uso de acordeones mantiene la interfaz limpia, ocupando poco espacio vertical hasta que el usuario decida leer una respuesta específica.

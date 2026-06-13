## Context

El componente de alergias del checkout actual usa un simple toggle switch "Sos alérgico a algún alimento?" que, al activarse, despliega un `<textarea>` para indicar los detalles, y muestra el subtítulo "No te diremos qué hay en tu box, pero intentaremos hacerlo único para vos.". Esto crea una falsa expectativa de que se puede construir una caja 100% segura para personas con alergias severas (ej. celiaquía estricta).

## Goals / Non-Goals

**Goals:**
- Desplegar un "Disclaimer" de responsabilidad cuando el usuario active el toggle de alergias.
- Bloquear el botón de "Confirmar y Pagar" o prevenir el envío si el usuario activa el toggle pero no acepta las políticas.
- Hacer que el checkbox legal sea claro y conciso.

**Non-Goals:**
- No bloquearemos la compra a los alérgicos, simplemente deben consentir que entienden los límites de la personalización de Fudi Club (ej. riesgo de trazas).

## Decisions

- **Estructura UI**: Añadiremos dentro del contenedor `#allergyDetails` un bloque con fondo tenue o amarillo de advertencia. Contendrá un checkbox obligatorio (`#allergyConsent`) y un texto que indique: "Entiendo que Fudi Club intenta adaptar la caja, pero no puede garantizar la ausencia de trazas cruzadas de alérgenos. Me comprometo a revisar las etiquetas de los productos antes de consumirlos."
- **Lógica de Validación JS**: En la función de escucha del `submit` del checkout (`main.js`), antes de procesar el pago o simularlo, verificaremos: si `document.getElementById('allergyToggle').checked` es verdadero, entonces `document.getElementById('allergyConsent').checked` también debe serlo. Si no, usaremos `alert()` o `reportValidity()` para frenar el proceso y avisarle al usuario.

## Risks / Trade-offs

- **Fricción en el Checkout**: Agregar un checkbox extra introduce una leve fricción. 
  - *Mitigación*: Este checkbox solo aparecerá dinámicamente si la persona activa el toggle de "Tengo alergias". El resto de usuarios (la mayoría) no verá ni sentirá fricción extra.

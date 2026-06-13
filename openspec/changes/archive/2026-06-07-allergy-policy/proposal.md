## Why

El documento de negocio `business-fudi-club` exige que Fudi Club recolecte información sobre alergias, pero también impone límites claros de responsabilidad: *"MUST remind customers to read the original labels before consuming"* y prohíbe garantizar la ausencia de trazas o adecuación médica. Actualmente el checkout recoge la alergia, pero no exige que el usuario acepte de forma vinculante esta limitación de responsabilidad antes de pagar, lo cual representa un riesgo de expectativas o legal.

## What Changes

- Modificar la sección del checkout dedicada a las alergias en `index.html`.
- Añadir un texto de descargo de responsabilidad (Disclaimer) y un `checkbox` obligatorio que indique: "Comprendo que Fudi Club no puede garantizar la ausencia de trazas y me comprometo a leer las etiquetas originales antes de consumir".
- El formulario de pago no podrá ser enviado si el usuario activa el toggle de alergias y no marca el checkbox de política.

## Capabilities

### Modified Capabilities
- `checkout`: Se añade una capa extra de validación del formulario de pago para asegurar que la política de alergias sea aceptada explícitamente cuando corresponda.

## Impact

- **Archivos Modificados**: `index.html` (para añadir el checkbox y el texto legal), `main.js` (para validar que el checkbox esté marcado antes del submit), `style.css` (para el estilo del warning de alergias).
- **Experiencia de Usuario**: El usuario alérgico tendrá mayor claridad sobre los límites del servicio, estableciendo una expectativa realista y protegiendo a la marca.

## Why

El documento de negocio `business-fudi-club` establece políticas estrictas sobre reembolsos, devoluciones y tiempos de reclamos (ej. máximo 48hs desde la recepción para reportar daños), así como tiempos estimados de entrega (3-7 días hábiles). Actualmente, la landing page no cuenta con una sección visible de Preguntas Frecuentes (FAQ) que informe a los usuarios sobre estas políticas operativas antes de que realicen la compra, lo cual puede generar fricción, reclamos fuera de término y saturación en el canal de soporte.

## What Changes

- Añadir una nueva sección de "Preguntas Frecuentes" en la landing page (`index.html`), ubicada antes de la sección de registro/checkout.
- Las preguntas incluirán:
  - ¿Cuándo me llega la caja? (Tiempos de envío: 3 a 7 días hábiles tras el despacho el 15 de cada mes).
  - ¿Qué pasa si un producto llega dañado? (Política de 48hs con fotos a WhatsApp).
  - ¿Se renueva automáticamente? (Aclaración de que las compras son de única vez o planes fijos, sin suscripción automática).
  - ¿Puedo elegir qué trae la caja? (Refuerzo del concepto Mystery Box).

## Capabilities

### Modified Capabilities
- `landing-page`: Se agrega contenido estático informativo que complementa la propuesta de valor y establece límites operativos.

## Impact

- **Archivos Modificados**: `index.html` (para añadir el markup de la sección FAQ), `style.css` (para el estilo de los acordeones/desplegables si no están ya implementados).
- **Experiencia de Usuario**: Mayor transparencia y confianza antes de la compra, reduciendo la ansiedad y educando al cliente sobre los términos de servicio de Fudi Club.

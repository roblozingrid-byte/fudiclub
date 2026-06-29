## Why

Integrar PostHog nos permitirá recolectar analíticas de uso del sitio web, comprender mejor cómo los usuarios interactúan con la interfaz, y medir conversiones (como el proceso de compra/checkout). Esto es crucial en esta etapa para tomar decisiones basadas en datos y optimizar la experiencia del usuario.

## What Changes

- Se agregará el script de inicialización de PostHog en el proyecto.
- Se configurará PostHog para capturar eventos automáticos de página, sesión y clics.
- Se añadirán trazas o eventos personalizados para acciones clave (ej. inicio del checkout, validación de zona, finalización de compra, interacción con el reproductor retro).

## Capabilities

### New Capabilities
- `posthog-analytics`: Integración y configuración del SDK de PostHog para rastreo de eventos del usuario.

### Modified Capabilities

## Impact

- **index.html**: Inclusión del tag del script de PostHog.
- **main.js**: Importación/Inicialización del cliente de PostHog y envío de eventos personalizados (`posthog.capture`) en funciones clave del negocio.
- **Dependencias**: Si se utiliza Vite, se puede agregar `posthog-js` vía npm o usar el snippet de HTML directamente.
- **Servicios Externos**: Proyecto de PostHog (requerirá un `project API key` y la URL del host de PostHog).

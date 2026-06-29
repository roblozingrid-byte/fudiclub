## Context

Fudi Club actualmente no cuenta con analíticas automatizadas integradas. Para optimizar el flujo de compra y comprender el comportamiento del usuario, se propuso integrar PostHog. Este documento detalla cómo se integrará la SDK de PostHog y dónde se inyectarán los eventos personalizados en el frontend.

## Goals / Non-Goals

**Goals:**
- Inicializar PostHog correctamente al cargar la aplicación.
- Configurar el seguimiento automático de la sesión y páginas vistas.
- Capturar eventos personalizados para interacciones clave (validaciones de zonas y pasos de compra) en `main.js`.

**Non-Goals:**
- Configurar dashboards dentro de PostHog (esto se hará en la plataforma web de PostHog manualmente).
- Añadir analíticas backend o integraciones server-side.

## Decisions

- **Instalación**: Usar el paquete `posthog-js` mediante npm y empaquetar con Vite. Esto permite un mejor control de las inicializaciones en código y el uso de imports ES, en lugar de insertar un script global en el HTML.
- **Ubicación de la inicialización**: En el nivel superior de `main.js`.
- **Estructura de eventos personalizados**: 
  - `checkout_started`: Al iniciar el flujo de compra.
  - `zone_validation`: Cuando el usuario verifica un código postal para el delivery.
  - `purchase_completed`: (Si aplica) al finalizar el flujo de compra exitosamente.

## Risks / Trade-offs

- **Risk**: Aumento en el tamaño del bundle JS debido a la inclusión de la SDK de PostHog.
  - **Mitigación**: `posthog-js` está bien mantenida y optimizada, y Vite realizará minificación eficiente en el build de producción.
- **Risk**: Bloqueadores de anuncios (Adblockers) interceptando solicitudes a PostHog.
  - **Mitigación**: Aceptable para la etapa inicial; si la recolección de datos se vuelve crítica, se podría configurar un reverse proxy en el futuro.

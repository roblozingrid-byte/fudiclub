## 1. Configuración del Entorno

- [x] 1.1 Instalar el paquete `posthog-js` en el proyecto
- [x] 1.2 Añadir configuración (project API key y host url) de PostHog al código fuente (como constantes o variables de entorno en Vite)

## 2. Inicialización de SDK

- [x] 2.1 Importar e inicializar `posthog` en la parte superior de `main.js`
- [x] 2.2 Asegurar que el evento base de visita a la página principal es reportado (`pageview`)

## 3. Integración de Eventos Personalizados

- [x] 3.1 Capturar evento `checkout_started` cuando se abre el formulario de compra
- [x] 3.2 Capturar evento `zone_validation` con propiedades (`isValid`, `zipCode`) en la lógica de validación de códigos postales
- [x] 3.3 Capturar evento `music_toggled` en el listener del reproductor de música (opcional/nice-to-have)

## 4. Pruebas y Validación

- [x] 4.1 Ejecutar la aplicación en modo desarrollo y revisar la pestaña Network para verificar que las solicitudes a la API de PostHog son enviadas.
- [x] 4.2 Probar los flujos de validación de zona y el botón de comprar para validar el tracking en tiempo real

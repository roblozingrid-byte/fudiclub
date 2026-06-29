## ADDED Requirements

### Requirement: Inicialización de PostHog
El sistema DEBE inicializar el SDK de PostHog al cargar la aplicación utilizando la clave de proyecto y host configurados.

#### Scenario: Carga exitosa del script de analíticas
- **GIVEN** que el usuario accede a la página principal
- **WHEN** la aplicación se carga en el navegador
- **THEN** PostHog inicializa una nueva sesión y envía un evento de `pageview` automático

### Requirement: Captura de eventos de Checkout
El sistema DEBE capturar un evento personalizado cuando el usuario interactúe con el flujo de compra.

#### Scenario: Usuario inicia el checkout
- **GIVEN** el usuario se encuentra en la pantalla de inicio
- **WHEN** el usuario hace clic para iniciar el proceso de compra
- **THEN** se envía un evento `checkout_started` a PostHog

### Requirement: Captura de eventos de Validación de Zonas
El sistema DEBE registrar los intentos de validación de zonas de entrega (verificación de código postal).

#### Scenario: Usuario valida un código postal
- **GIVEN** el modal o sección de validación de entrega está abierto
- **WHEN** el usuario ingresa un código postal y hace clic en verificar
- **THEN** se envía un evento `zone_validation` a PostHog con la propiedad del resultado (ej. `isValid: true/false`, `zipCode`)

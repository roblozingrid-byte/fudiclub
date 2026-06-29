## ADDED Requirements

### Requirement: Feedback Visual de Validación
El sistema SHALL proveer feedback visual integrado en la interfaz gráfica (UI) para validaciones de formulario, en lugar de bloquear el flujo con alertas nativas (`alert()`).

#### Scenario: Falta consentimiento de alergia
- **GIVEN** que el usuario marca que tiene alergias
- **AND** el usuario omite marcar la casilla de consentimiento de seguridad
- **WHEN** hace clic en "Confirmar y Pagar"
- **THEN** el formulario resalta el borde de la casilla de consentimiento con un parpadeo rojo
- **AND** no se utiliza `alert()`.

### Requirement: Interactividad de Fudi Club Radio
El reproductor retro de música SHALL invitar a la interacción explícita para evitar problemas con políticas de Autoplay en navegadores.

#### Scenario: Pulso del botón Play
- **GIVEN** que el usuario carga la página y la música no se reproduce automáticamente
- **WHEN** el reproductor retro está en pantalla
- **THEN** el botón de "Play" muestra una sutil animación de pulso infinito hasta que es presionado por primera vez.

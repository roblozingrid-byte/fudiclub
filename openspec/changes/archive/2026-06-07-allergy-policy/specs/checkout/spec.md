## MODIFIED Requirements

### Requirement: Checkout, Payment, And Purchase Plans
*(Modificación en la sección de datos mínimos de checkout)*
The minimum checkout data SHALL include name, email, WhatsApp, complete address,
zone/locality, purchase option, allergy/restriction information, **allergy policy
acceptance**, payment method, and operational contact consent.

## ADDED Requirements

### Requirement: Allergy And Food-Safety Boundaries
Fudi Club SHALL collect allergy or food restriction information during checkout,
but MUST NOT guarantee suitability for severe allergies or absence of traces.

Fudi Club SHALL rely on original product labels for product-specific allergen
information. Customer-facing checkout MUST remind customers to read
the original labels before consuming and require explicit acceptance of this limit.

#### Scenario: Customer declares an allergy at checkout
- **GIVEN** que el usuario está en el checkout y activa el selector de "Alergias"
- **WHEN** el sistema despliega el campo de texto para detallar la alergia
- **THEN** se muestra adicionalmente un mensaje legal de advertencia sobre trazas cruzadas y la lectura de etiquetas
- **AND** se muestra una casilla de verificación (checkbox) de aceptación obligatoria

#### Scenario: Validating allergy policy acceptance
- **GIVEN** que un usuario ha declarado tener alergias pero no marcó la casilla de consentimiento legal
- **WHEN** el usuario hace clic en "Confirmar y Pagar"
- **THEN** el sistema bloquea el envío del formulario
- **AND** alerta al usuario que debe aceptar los términos de seguridad alimentaria antes de proceder

# Spec: Checkout

## Purpose
TBD: Gestionar la interacción final del usuario con el carrito de compras, selección de métodos de pago externos y vías de soporte.

## Requirements

### Requirement: Opciones de Pago Externas
El sistema SHALL presentar opciones de pago que redirijan el flujo de pago fuera de la interfaz web, delegando la responsabilidad de transacciones a procesadores autorizados.

#### Scenario: Selección de Método de Pago
- **GIVEN** que el usuario está en el formulario de Checkout completando sus datos
- **WHEN** llega a la sección de Método de Pago
- **THEN** en lugar de campos de tarjeta, se le presentan opciones (ej. "Mercado Pago" y "Transferencia Bancaria")

### Requirement: Integración de Mercado Pago (Simulada)
El sistema SHALL iniciar el flujo asíncrono para generar un pago al confirmar el checkout y bloquear la interfaz para evitar dobles envíos.

#### Scenario: Confirmación de compra con Mercado Pago
- **GIVEN** que el usuario ha seleccionado "Mercado Pago" y presiona "Confirmar y Pagar"
- **WHEN** el sistema intercepta el evento de submit
- **THEN** el botón cambia a estado "Procesando pago..." y se deshabilita
- **AND** el sistema simula una petición al backend (espera de 2s)
- **AND** finalmente muestra un mensaje de éxito indicando que el usuario "será redirigido" a Mercado Pago.

### Requirement: Soporte al Cliente Exclusivo
El sistema SHALL proveer WhatsApp únicamente como canal de resolución de problemas, sin mezclarse con el flujo comercial.

#### Scenario: Contacto con Soporte
- **GIVEN** que el usuario navega por la página o experimenta algún inconveniente
- **WHEN** visualiza la cabecera, footer o widget flotante
- **THEN** encuentra un enlace a WhatsApp claramente etiquetado como "Soporte" o "Ayuda"

### Requirement: Checkout, Payment, And Purchase Plans
The minimum checkout data SHALL include name, email, WhatsApp, complete address,
**zone/locality (via dynamic selector)**, purchase option, allergy/restriction information, **allergy policy
acceptance**, payment method, and operational contact consent.

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

### Requirement: Shipping Coverage And Delivery Promise
Shipping SHALL be charged separately and SHALL distinguish costs and promised
windows by zone. Fudi Club SHALL NOT offer physical pickup in the initial phase.

The default delivery estimate SHALL be 3-7 business days from dispatch, adjusted
by zone and carrier.

#### Scenario: Customer inputs Zip Code
- **GIVEN** que un cliente está completando el formulario de checkout
- **WHEN** el cliente ingresa su Código Postal (ej. "1405" o "5000")
- **THEN** el sistema evalúa el rango del código postal e infiere la zona
- **AND** actualiza inmediatamente el subtotal de envío ("Envío")
- **AND** recalcula el Precio Total a pagar
- **AND** el desglose distingue claramente el precio de la caja (o plan) del costo de envío

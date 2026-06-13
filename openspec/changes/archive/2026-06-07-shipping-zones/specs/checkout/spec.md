## MODIFIED Requirements

### Requirement: Checkout, Payment, And Purchase Plans
*(Modificación en la recolección de zona y costos)*
The minimum checkout data SHALL include name, email, WhatsApp, complete address,
**zone/locality (via dynamic selector)**, purchase option, allergy/restriction information, allergy policy
acceptance, payment method, and operational contact consent.

## ADDED Requirements

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

## ADDED Requirements

### Requirement: Reglas del Plan Trimestral
El sistema SHALL presentar el plan trimestral como un pago único adelantado por 3 ediciones y SHALL informar al cliente explícitamente que no existe renovación automática.

#### Scenario: Visualización del plan trimestral
- **GIVEN** que el cliente se encuentra en la pantalla de selección de planes
- **WHEN** la opción trimestral es renderizada en la interfaz
- **THEN** la tarjeta del plan indica "Plan Trimestral (Pago Único)"
- **AND** la tarjeta del plan incluye la aclaración "Sin renovación automática"

#### Scenario: Subtotales y aclaraciones de carrito
- **GIVEN** que el cliente seleccionó el plan trimestral
- **WHEN** el carrito actualiza sus componentes
- **THEN** el subtotal refleja explícitamente que se están cobrando "3 boxes"
- **AND** el cálculo del subtotal utiliza el valor total de las 3 cajas por adelantado

### Requirement: Procesamiento del Plan Elegido
El sistema SHALL registrar y propagar la elección exacta del plan en el momento de confirmar el checkout.

#### Scenario: Confirmación de pago único
- **GIVEN** que el cliente seleccionó "Compra Única"
- **WHEN** confirma el pedido
- **THEN** el resumen generado reporta el plan como "Compra Única (1 caja)"

#### Scenario: Confirmación de plan trimestral
- **GIVEN** que el cliente seleccionó "Plan Trimestral"
- **WHEN** confirma el pedido
- **THEN** el resumen generado reporta el plan como "Plan Trimestral (Pago Único 3 cajas)"

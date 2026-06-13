## ADDED Requirements

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

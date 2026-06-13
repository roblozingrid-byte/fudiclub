# Spec: Checkout Cycle

## Purpose
TBD: Gestionar el ciclo operativo mensual y su asignación durante el checkout en base a la fecha de compra.

## Requirements

### Requirement: Determinación Automática del Ciclo Operativo Mensual
El sistema SHALL determinar automáticamente la edición mensual que el cliente está comprando basándose en la fecha actual. El cierre de cupos de cada mes ocurre al finalizar el día 5. Las compras realizadas hasta el día 5 inclusive corresponden al mes actual. Las compras realizadas a partir del día 6 corresponden al mes siguiente.

#### Scenario: Compra antes o durante el día de cierre
- **GIVEN** que el cliente se encuentra en el flujo de compra
- **WHEN** el cliente inicia la compra el día 5 del mes o antes
- **THEN** el sistema asigna la compra a la edición del mes actual

#### Scenario: Compra posterior al día de cierre
- **GIVEN** que el cliente se encuentra en el flujo de compra
- **WHEN** el cliente inicia la compra el día 6 del mes o posterior
- **THEN** el sistema asigna la compra a la edición del mes siguiente

### Requirement: Comunicación de la Edición Asignada
El sistema SHALL mostrar explícitamente en la interfaz de usuario el nombre del mes/edición que recibirá el cliente antes de finalizar la compra, y SHALL incluir este dato en el mensaje de pedido generado.

#### Scenario: Visualización en checkout
- **GIVEN** que el cliente se encuentra en la página de compra
- **WHEN** la interfaz se carga
- **THEN** se muestra un texto indicando la edición a recibir basado en la fecha actual

#### Scenario: Inclusión en resumen de pedido
- **GIVEN** que el cliente completa el formulario
- **WHEN** hace clic en el botón de confirmación
- **THEN** el mensaje de WhatsApp generado incluye explícitamente el mes de la edición asignada

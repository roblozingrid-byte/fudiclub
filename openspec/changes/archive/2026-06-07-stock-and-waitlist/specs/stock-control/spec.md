## ADDED Requirements

### Requirement: Límite Operativo Mensual
El sistema SHALL limitar la capacidad operativa a 30 cajas por ciclo y SHALL reflejar esta disponibilidad a los usuarios.

#### Scenario: Visualización del stock inicial
- **GIVEN** que comienza un nuevo ciclo operativo mensual y el stock base es 30
- **WHEN** el usuario visualiza el widget flotante de disponibilidad
- **THEN** el widget indica "30 boxes restantes"

#### Scenario: Visualización de Edición Agotada
- **GIVEN** que el stock de la edición actual es 0
- **WHEN** el usuario visualiza la página
- **THEN** el widget flotante de stock indica "¡Edición Agotada!"

### Requirement: Opciones de Compra post-Agotamiento
El sistema SHALL ofrecer alternativas claras de "Pre-compra para el próximo mes" o "Waitlist" cuando el cupo mensual se haya agotado.

#### Scenario: Bifurcación del Checkout
- **GIVEN** que un usuario intenta unirse al club
- **AND** el stock disponible de la edición actual es 0
- **WHEN** el sistema despliega la sección de registro
- **THEN** el formulario de pago habitual se oculta
- **AND** se muestran dos opciones: "Asegurar caja próximo mes" y "Anotarme en la lista de espera"

#### Scenario: Pre-compra del próximo mes
- **GIVEN** que el usuario está en la pantalla de opciones por agotamiento
- **WHEN** selecciona "Asegurar caja próximo mes"
- **THEN** el formulario de checkout se reactiva
- **AND** la edición asignada visualmente y en el resumen de compra se fuerza al mes siguiente, sin importar el día del mes actual

### Requirement: Lista de Espera (Waitlist)
El sistema SHALL proveer un mecanismo alternativo para capturar el interés de los usuarios que no deseen pre-comprar.

#### Scenario: Captura de Email en Waitlist
- **GIVEN** que el usuario está en la pantalla de opciones por agotamiento
- **WHEN** selecciona "Anotarme en la lista de espera"
- **THEN** se muestra un formulario solicitando su email
- **AND** al enviarlo, el sistema confirma la recepción mostrando un mensaje de éxito

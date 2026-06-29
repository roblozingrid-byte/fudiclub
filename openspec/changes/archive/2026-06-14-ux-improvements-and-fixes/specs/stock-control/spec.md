## MODIFIED Requirements

### Requirement: Límite Operativo Mensual
El sistema SHALL limitar la capacidad operativa a 30 cajas por ciclo y SHALL reflejar esta disponibilidad a los usuarios obteniendo el stock dinámicamente desde la base de datos (Supabase).

#### Scenario: Visualización del stock dinámico
- **GIVEN** que el ciclo operativo tiene 5 órdenes confirmadas
- **WHEN** el usuario carga la página principal
- **THEN** el sistema consulta a Supabase y el widget flotante de stock indica "25 boxes disponibles".

#### Scenario: Visualización de Edición Agotada
- **GIVEN** que el stock calculado de la edición actual es 0 (30 o más órdenes)
- **WHEN** el usuario visualiza la página
- **THEN** el widget flotante de stock indica "¡Edición Agotada!"

### Requirement: Opciones de Compra post-Agotamiento o Fin de Venta
El sistema SHALL ofrecer alternativas claras de "Pre-compra para el próximo mes" o "Waitlist" cuando el cupo mensual se haya agotado O si la fecha actual es posterior al día 5 del mes.

#### Scenario: Venta Cerrada por Fecha
- **GIVEN** que el día actual del mes es mayor a 5
- **AND** el stock disponible es mayor a 0
- **WHEN** el sistema despliega la sección de registro
- **THEN** se asume "Edición Cerrada" para el mes actual
- **AND** se muestran las opciones de pre-compra para el próximo mes o waitlist, en lugar de ir directamente al checkout.

#### Scenario: Bifurcación del Checkout por Stock
- **GIVEN** que un usuario intenta unirse al club
- **AND** el stock disponible de la edición actual es 0
- **WHEN** el sistema despliega la sección de registro
- **THEN** el formulario de pago habitual se oculta
- **AND** se muestran dos opciones: "Asegurar caja próximo mes" y "Anotarme en la lista de espera"

#### Scenario: Pre-compra del próximo mes
- **GIVEN** que el usuario está en la pantalla de opciones por agotamiento o venta cerrada
- **WHEN** selecciona "Asegurar caja próximo mes"
- **THEN** el formulario de checkout se reactiva
- **AND** la edición asignada visualmente y en el resumen de compra se fuerza al mes siguiente.

### Requirement: Lista de Espera (Waitlist)
El sistema SHALL proveer un mecanismo alternativo para capturar el interés de los usuarios que no deseen pre-comprar.

#### Scenario: Interfaz Limpia tras Registro en Waitlist
- **GIVEN** que el usuario envió exitosamente el formulario de waitlist
- **WHEN** el sistema confirma la recepción
- **THEN** se oculta por completo el contenedor de opciones previas y el formulario de ingreso de correo
- **AND** se muestra un mensaje de éxito centrado indicando que se ha registrado.

# Spec: Branded Transactional Emails

## Purpose
Estandarizar las comunicaciones transaccionales vía correo electrónico con la identidad visual Neobrutalista de Fudi Club.

## Requirements

### Requirement: Paleta y Estilo Neobrutalista
Todos los correos electrónicos generados por el sistema DEBEN utilizar la paleta oficial y estilos consistentes.

#### Scenario: Elementos visuales del correo
- **GIVEN** cualquier plantilla generada (`buildReminderHtml`, `buildPaymentConfirmedEmail`, `buildTransferInstructionsEmail`, `buildAdminOrderNotificationEmail`)
- **THEN** utiliza fondo `#c79fef`, cabecera `#4ebaba`, acentos `#d1ff5e`, tarjetas `#ffffff`, bordes sólidos negros de 2-3px y sombras duras `#000000`

### Requirement: Email de Confirmación de Pago Trimestral
El correo de confirmación de pago DEBE adaptarse de forma dinámica para compradores de suscripciones trimestrales.

#### Scenario: Compra de Plan Trimestral Individual
- **GIVEN** una orden con `plan = 'quarterly'` y cantidad 1 (3 boxes en total)
- **WHEN** se genera el correo de confirmación
- **THEN** incluye:
  - Sticker superior `⭐ PLAN TRIMESTRAL CONFIRMADO`
  - Texto de bienvenida: `...con tu Plan Trimestral (3 Mystery Boxes en total)...` y la frase `sorpresas Fudi`
  - Resumen con píldora `Trimestral (3 Mystery Boxes)` sin repetir la palabra "Plan"
  - Encabezado `📅 Cronograma estimado de entregas:` desglosando los 3 meses cubiertos

#### Scenario: Compra de Múltiples Planes Trimestrales
- **GIVEN** una orden con `plan = 'quarterly'` y cantidad mayor a 1 (ej. 2 planes = 6 boxes)
- **WHEN** se genera el correo de confirmación
- **THEN** adapta dinámicamente los textos a:
  - `...con tus 2 Planes Trimestrales (6 Mystery Boxes en total)...`
  - Píldora `2x Trimestral (6 Mystery Boxes)`
  - Entregas mensuales indicando `(2 boxes)` en cada mes

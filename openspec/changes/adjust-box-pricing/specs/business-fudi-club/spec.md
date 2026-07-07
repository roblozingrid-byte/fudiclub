## MODIFIED Requirements

### Requirement: Box Product Model

Each monthly Fudi Club edition SHALL be one standard mystery box containing
between 6 and 10 packaged snack/treat items (with 10 as the maximum). The box SHALL support one-time purchase and a
prepaid quarterly plan.

The initial box mix SHALL target 50-70 percent local kiosk/supermarket products
and 30-50 percent special, imported, or viral products, adjusted by supplier
availability and margin.

#### Scenario: Monthly edition is planned

- **WHEN** a monthly edition is curated
- **THEN** the edition defines one standard box configuration
- **AND** the box contains between 6 and 10 items (with 10 as the maximum)
- **AND** the local/special product mix stays within the target range unless a
  margin or supplier issue is documented

### Requirement: Pricing And Margin Guardrails

The one-time box price hypothesis SHALL be between ARS 35,000 and ARS 39,000 before shipping.
The prepaid quarterly plan SHALL discount each box by no more than 5 percent.
Shipping MUST be priced separately from the box.

Fudi Club SHALL measure gross margin before shipping. Each cycle MUST target 40
percent or higher gross margin and MUST NOT proceed below a 35 percent minimum
gross margin unless the owner explicitly records an exception and reason.

#### Scenario: Quarterly price is calculated

- **WHEN** Fudi Club applies the maximum quarterly discount to an ARS 35,000 box
- **THEN** the discounted per-box price is ARS 33,250
- **AND** the prepaid three-box total is ARS 99,750 before shipping

#### Scenario: Cycle economics are reviewed

- **WHEN** a monthly cycle is approved for sale
- **THEN** the cost sheet verifies gross margin before shipping
- **AND** the cycle is paused, repriced, or reduced if the 35 percent minimum
  gross margin cannot be protected

### Requirement: Brand Color And Packaging System

Fudi Club SHALL use evergreen packaging for the base box, utilizing a standard physical corrugated white cardboard box of 23x21.5x9cm. Monthly differentiation SHALL rely on a DIY colored cardstock belly band (faja de cartulina lisa cortada a medida) sealed with a logo sticker, rather than redesigned packaging. The outer shipping bag SHALL be a 40x50 cm colored inviolable e-commerce bag (e.g. Lilac, Mint Green) to ensure an exceptional brand UX upon delivery.

Each box SHALL contain interior tissue paper (papel de seda) covering the products, a welcome/thank-you card, and a gift sticker sheet. The exterior package SHALL be enclosed in a protective plastic shipping bag.

The digital/base brand color SHALL be Lila Fudi `#C79FEF`. Monthly box
identification colors SHALL include Rosa Chicle `#FFB7D5`, Turquoise `#4EBABA`,
Lime Green `#D1FF5E`, and Pastel Yellow `#FFF4BD`.

#### Scenario: Monthly packaging is prepared

- **WHEN** a monthly edition is packed
- **THEN** the base packaging remains evergreen using the standard 23x21.5x9cm corrugated white box
- **AND** the interior products are wrapped in tissue paper alongside a thank-you card and gift sticker sheet
- **AND** the monthly edition is identified by the selected colored cardstock belly band and logo sticker
- **AND** the entire box is sealed inside an outer plastic shipping bag for dispatch

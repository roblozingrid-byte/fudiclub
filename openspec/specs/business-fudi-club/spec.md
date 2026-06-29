# Spec: Business Fudi Club

## Purpose

Define Fudi Club as a standalone physical-digital subscription-box business,
including the product promise, operating model, pricing, sourcing, fulfillment,
brand experience, customer policies, validation metrics, launch gates, and
scaling boundaries that future web, checkout, analytics, and operational tools
must honor.

## Requirements

### Requirement: Business Source Of Truth

Fudi Club SHALL be specified and operated as a standalone physical-digital
business. Any future web app, checkout, analytics setup, internal tool, supplier
workflow, or launch plan MUST treat this business spec as the source of truth
for Fudi Club behavior.

#### Scenario: Future implementation is planned

- **WHEN** an agent or operator plans a Fudi Club website, checkout, internal
  tool, supplier workflow, or launch action
- **THEN** the plan reads `business-fudi-club`
- **AND** treats the business operating requirements as primary over app-level
  convenience

### Requirement: Core Customer And Promise

Fudi Club SHALL optimize first for customers buying a monthly self-gift or
small accessible luxury experience. Gift purchases MAY be supported, but they
MUST NOT drive the initial operating model.

Fudi Club SHALL promise curated surprise combinations that feel special. It
MUST NOT promise that every item is individually inaccessible, rare, or worth
more at retail than the price paid.

#### Scenario: Customer-facing positioning is written

- **WHEN** Fudi Club product, web, social, insert, or checkout copy is created
- **THEN** it positions the box as a curated mystery experience and accessible
  monthly treat
- **AND** it explicitly mentions the inclusion of both rare/imported items and familiar classic treats
- **AND** it does not claim guaranteed retail arbitrage or absolute rarity

### Requirement: Box Product Model

Each monthly Fudi Club edition SHALL be one standard mystery box containing
10-12 packaged snack/treat items. The box SHALL support one-time purchase and a
prepaid quarterly plan.

The initial box mix SHALL target 50-70 percent local kiosk/supermarket products
and 30-50 percent special, imported, or viral products, adjusted by supplier
availability and margin.

#### Scenario: Monthly edition is planned

- **WHEN** a monthly edition is curated
- **THEN** the edition defines one standard box configuration
- **AND** the box contains 10-12 items
- **AND** the local/special product mix stays within the target range unless a
  margin or supplier issue is documented

### Requirement: Pricing And Margin Guardrails

The initial one-time box price hypothesis SHALL be ARS 45,000 before shipping.
The prepaid quarterly plan SHALL discount each box by no more than 5 percent.
Shipping MUST be priced separately from the box.

Fudi Club SHALL measure gross margin before shipping. Each cycle MUST target 40
percent or higher gross margin and MUST NOT proceed below a 35 percent minimum
gross margin unless the owner explicitly records an exception and reason.

#### Scenario: Quarterly price is calculated

- **WHEN** Fudi Club applies the maximum quarterly discount to an ARS 45,000 box
- **THEN** the discounted per-box price is ARS 42,750
- **AND** the prepaid three-box total is ARS 128,250 before shipping

#### Scenario: Cycle economics are reviewed

- **WHEN** a monthly cycle is approved for sale
- **THEN** the cost sheet verifies gross margin before shipping
- **AND** the cycle is paused, repriced, or reduced if the 35 percent minimum
  gross margin cannot be protected

### Requirement: Pilot Capacity And Budget

The initial pilot SHALL limit saleable customer boxes to 30 per monthly cycle.
Microinfluencer boxes SHALL be funded separately from customer-saleable stock
and limited to 3-5 boxes per pilot cycle.

Fudi Club SHALL plan runway for three pilot cycles while purchasing physical
stock cycle by cycle.

#### Scenario: Pilot sales open

- **WHEN** Fudi Club opens a pilot monthly cycle
- **THEN** no more than 30 customer-saleable boxes are made available
- **AND** microinfluencer boxes do not consume the customer-saleable cupo

#### Scenario: Pilot budget is estimated

- **WHEN** the first cycle budget is prepared
- **THEN** saleable-box COGS is budgeted from the current price and margin
  guardrails
- **AND** microinfluencer boxes, one-time brand work, packaging prototypes, web
  work, and tools are tracked outside the saleable-box COGS budget

### Requirement: Monthly Operating Cycle

Fudi Club SHALL operate on a fixed monthly cycle: orders/cupos close on day 5,
final curation and purchasing run from day 6 to day 10, manual packing runs
from day 11 to day 14, and shipping starts on day 15.

Orders placed after day 5 MUST enter the next monthly cycle unless leftover
current-cycle stock is explicitly marked and sold as an extra unit.

#### Scenario: Customer purchases after cutoff

- **WHEN** a customer purchases after day 5
- **THEN** the order is assigned to the next monthly edition by default
- **AND** the customer-facing confirmation identifies the first edition they
  will receive

### Requirement: Editorial Theme And Mystery

Fudi Club SHALL maintain a rolling three-month editorial planning horizon for
themes, supplier search, and marketing. Monthly themes MAY guide curation,
teasers, inserts, and recaps, but the exact SKU list MUST remain hidden before
delivery.

Each monthly edition SHALL define at least one hero product or hero moment based
on perceived impact, such as virality, visual appeal, nostalgia, unusual local
availability, taste surprise, or story.

After the main delivery window, Fudi Club MAY publish a partial recap showing
2-3 highlighted products, ideally including the hero, while keeping the full
box contents unrevealed.

#### Scenario: Monthly teaser is published

- **WHEN** Fudi Club promotes an upcoming edition before delivery
- **THEN** it may reveal theme, vibe, clues, or product category
- **AND** it does not reveal the exact full SKU list

#### Scenario: Post-delivery recap is published

- **WHEN** most customers have received the edition
- **THEN** Fudi Club may publish 2-3 highlighted products
- **AND** the recap does not turn the full mystery box into a public catalog

### Requirement: Supplier And Product Eligibility

Fudi Club SHALL source products only through formal local retailers,
wholesalers, distributors, or importers. Products MUST be legally sellable in
Argentina and have enough labeling or local information for safe consumer use.

Initial-phase boxes SHALL include only shelf-stable, sealed, packaged products
in original packaging. Fudi Club MUST NOT include cold-chain products, fresh
products, re-packed products, or products fractioned by Fudi.

Products SHOULD have at least 60 days of remaining shelf life at the estimated
delivery date.

#### Scenario: SKU is considered for inclusion

- **WHEN** a product is evaluated for a monthly box
- **THEN** the supplier channel, legal sellability, packaging state, shelf-life
  status, and available labeling are checked
- **AND** the product is rejected if it requires cold chain, re-packing,
  fractioning, or informal sourcing

### Requirement: Inventory Traceability

Fudi Club SHALL maintain minimum traceability for stock held at home/office
during the pilot. The traceability record MUST include SKU or product name,
supplier, quantity, purchase cost, expiration date, and lot information when
available.

#### Scenario: Stock is received

- **WHEN** Fudi Club receives purchased products for a cycle
- **THEN** each SKU or purchase lot is recorded before packing begins
- **AND** expiration dates and product condition are checked before the SKU is
  approved for use

### Requirement: Allergy And Food-Safety Boundaries

Fudi Club SHALL collect allergy or food restriction information during checkout,
but MUST NOT guarantee suitability for severe allergies or absence of traces.
Fudi Club MAY attempt reasonable substitutions when labeling and available stock
allow it.

Fudi Club SHALL rely on original product labels for product-specific allergen
information. Customer-facing checkout and inserts MUST remind customers to read
the original labels before consuming.

#### Scenario: Customer declares an allergy

- **WHEN** a customer enters allergy or restriction information at checkout
- **THEN** Fudi Club records it for operational review
- **AND** the customer accepts that Fudi Club cannot guarantee absence of traces
  or medical suitability

#### Scenario: Customer receives the box

- **WHEN** the customer prepares to consume any product
- **THEN** the insert or policy instructs them to review the original product
  label first

### Requirement: Brand Color And Packaging System

Fudi Club SHALL use evergreen packaging for the base box. Monthly differentiation
SHALL rely on sticker/color identification rather than redesigned packaging.

The digital/base brand color SHALL be Lila Fudi `#C79FEF`. Monthly box
identification colors SHALL include Rosa Chicle `#FFB7D5`, Turquoise `#4EBABA`,
Lime Green `#D1FF5E`, and Pastel Yellow `#FFF4BD`.

#### Scenario: Monthly packaging is prepared

- **WHEN** a monthly edition is packed
- **THEN** the base packaging remains evergreen
- **AND** the monthly edition is identified by the selected sticker/color
  treatment

### Requirement: Membership And Physical Inserts

The first Fudi Club box for each customer SHALL include a welcome/member card
with the customer name and member number. The member number SHALL serve as a
brand identity marker and lightweight operational identifier.

Every box SHALL include a sticker sheet using the vintage/digital sticker motifs
from the Fudi brand experience. Fudi Club SHALL keep the recurring sticker sheet
inside per-box cost and margin guardrails.

Fudi Club SHALL establish club identity without requiring a formal member
community in the initial phase.

#### Scenario: Customer receives first box

- **WHEN** a customer receives their first Fudi Club box
- **THEN** the box includes a welcome/member card with their name and member
  number
- **AND** the box includes the recurring sticker sheet

#### Scenario: Returning customer receives later box

- **WHEN** a returning customer receives a later monthly box
- **THEN** the welcome/member card is not required
- **AND** the sticker sheet remains part of the box experience

### Requirement: Fulfillment And Packing Control

Initial fulfillment SHALL be manual and owned by Fudi Club from home/office
stock. Each order MUST have a packing checklist before dispatch. Photos MAY be
captured by lot or for higher-risk cases.

Fudi Club MAY substitute products without prior customer approval when supplier
or stock conditions require it, provided substitutions are equivalent or higher
perceived value and respect allergy/restriction handling when reasonably
possible.

#### Scenario: Box is packed

- **WHEN** an order is prepared for dispatch
- **THEN** the packing checklist confirms the required items, insert materials,
  customer/member details when applicable, and shipment details
- **AND** the order is not dispatched until the checklist is complete

#### Scenario: SKU must be substituted

- **WHEN** a planned product is unavailable or unsuitable before packing
- **THEN** Fudi Club may replace it with an equivalent-or-better product
- **AND** the substitution is documented in the cycle notes

### Requirement: Shipping Coverage And Delivery Promise

Fudi Club SHALL launch shipping in phases. Phase 1 SHALL prioritize CABA/GBA
using courier or mensajeria where practical. Province/interior coverage SHALL
be a controlled expansion using mail or shipping integrators with tracking.

Shipping SHALL be charged separately and SHALL distinguish costs and promised
windows by zone. Fudi Club SHALL NOT offer physical pickup in the initial phase.

The default delivery estimate SHALL be 3-7 business days from dispatch, adjusted
by zone and carrier.

#### Scenario: Customer selects delivery zone

- **WHEN** a customer checks out
- **THEN** the delivery promise and shipping cost reflect their zone
- **AND** the confirmation distinguishes box price from shipping

#### Scenario: Province/interior expansion is considered

- **WHEN** Fudi Club expands beyond CABA/GBA
- **THEN** the expansion uses a carrier or integrator that can provide tracking
- **AND** the customer-facing promise is updated for that zone

### Requirement: Checkout, Payment, And Purchase Plans

Fudi Club SHALL support direct checkout from the beginning of sales. Mercado
Pago SHALL be the default payment method, and bank transfer MAY be offered as a
manual alternative.

The prepaid quarterly plan SHALL be paid in full at purchase and SHALL NOT
auto-renew. Quarterly customers SHALL have guaranteed cupo for their paid
three-box cycle and SHALL receive a 72-hour renewal priority email before cupos
open to the public.

The minimum checkout data SHALL include name, email, WhatsApp, complete address,
zone/locality, purchase option, allergy/restriction information, allergy policy
acceptance, payment method, and operational contact consent.

#### Scenario: Quarterly customer purchases plan

- **WHEN** a customer buys the quarterly plan
- **THEN** the full three-box amount is charged at the beginning
- **AND** the plan does not renew automatically
- **AND** the customer receives priority cupo for the three paid editions

#### Scenario: Quarterly renewal window opens

- **WHEN** a quarterly plan is active or recently completed
- **THEN** Fudi Club sends a renewal priority email before public cupos open
- **AND** the priority window lasts 72 hours

### Requirement: Stock, Sell-Out, And Waitlist

Fudi Club SHALL maintain exact internal stock/cupo counts and MAY communicate
external availability through thresholds, counters, or "few left" states. It
MUST NOT invent false scarcity.

Fudi Club SHALL allow monthly boxes to sell out. Waitlist capture SHALL collect
contact and intent without payment during the initial phase.

#### Scenario: Public stock display is updated

- **WHEN** monthly cupos change
- **THEN** the internal count remains exact
- **AND** the public display reflects real availability through an approved
  threshold or counter pattern

#### Scenario: Edition sells out

- **WHEN** all available monthly cupos are allocated
- **THEN** Fudi Club stops taking paid orders for that edition
- **AND** offers a no-payment waitlist for the next available cycle

### Requirement: Support And Claims

Fudi Club SHALL use WhatsApp as the primary support channel, email (`hola@fudiclub.shop`) as the formal
backup, and Instagram DM (`@somosfudiclub`) for acquisition or lightweight conversation. Support
SHALL target response within 1 business day, with priority during shipping week.

Damage, missing item, or packing-error claims MUST be reported within 48 hours
of receipt with reasonable evidence. Fudi Club SHALL act as the customer-facing
resolver even when a carrier caused shipping damage, while preserving the right
to evaluate the case and claim with the carrier.

#### Scenario: Customer asks for support

- **WHEN** a customer contacts Fudi Club about an order
- **THEN** WhatsApp is treated as the primary response channel
- **AND** the target response time is within 1 business day

#### Scenario: Customer reports damage

- **WHEN** a customer reports a damaged, incomplete, or incorrect box within 48
  hours of receipt
- **THEN** Fudi Club reviews evidence and order records
- **AND** may offer replacement, partial credit, carrier claim support, or a
  controlled goodwill gesture based on the case

### Requirement: Marketing And Acquisition

Fudi Club SHALL prioritize Instagram/TikTok (`@somosfudiclub`) organic content, selected
microinfluencer boxes, lightweight referrals, and user-generated content during
the pilot. Fudi Club MAY use paid ads later, but paid ads MUST NOT be the only
validation signal during the first three cycles.

Microinfluencer boxes SHALL be limited, selected intentionally, and measured
with simple referral or code tracking when practical.

#### Scenario: Microinfluencer cycle is planned

- **WHEN** Fudi Club allocates influencer boxes for a cycle
- **THEN** it limits allocation to 3-5 boxes
- **AND** records the recipient and expected measurement method

#### Scenario: User-generated content is encouraged

- **WHEN** insert, web, or social copy invites customers to share the unboxing
- **THEN** the invitation is lightweight
- **AND** Fudi Club does not require a permanent contest to justify sharing

### Requirement: Analytics And Pilot Validation

Fudi Club SHALL measure business analytics from the beginning of sales. Minimum
analytics SHALL include visits, checkout starts, one-time purchases, quarterly
plan purchases, waitlist signups, acquisition source, referral/code usage,
renewals, support reasons, delivery performance, claims, margin, and customer
feedback.

The three-cycle pilot SHALL evaluate validation in this order: margin and
operational fulfillment, sales and renewal behavior, then UGC/satisfaction and
acquisition signal.

Minimum validation targets SHALL include 30 boxes/month for useful pilot
demand, 50 boxes/month with healthy margin as a strong demand signal, at least
35 percent gross margin before shipping, 90 percent or more deliveries inside
the promised window, less than 5 percent operational claims per delivered box,
zero critical food-safety incidents, 30 percent minimum quarterly renewal, and
50 percent strong quarterly renewal.

#### Scenario: Pilot month is reviewed

- **WHEN** a monthly cycle closes
- **THEN** Fudi Club reviews sales, margin, delivery, claims, support, waitlist,
  acquisition, UGC, and feedback data
- **AND** the review compares results against the pilot validation targets

### Requirement: Launch Readiness Gate

Fudi Club MUST NOT open paid sales until launch readiness is satisfied.
Readiness SHALL include confirmed supplier/cost sheet for the edition, tested
packaging, working checkout and payments, visible allergy/cancellation/shipping
policies, defined stock/cupos, manual order/member/inventory/tracking controls,
carrier or courier plan, approved cycle budget, and a contador/asesor checkpoint
before taking payments.

#### Scenario: Owner wants to open sales

- **WHEN** the owner prepares to open paid sales for a monthly cycle
- **THEN** each launch-readiness item is checked
- **AND** sales remain closed if any critical item is unresolved

### Requirement: Pause Criteria

Fudi Club SHALL pause or limit a monthly edition when it cannot protect minimum
margin, formal sourcing, 60-day shelf-life target, packaging availability,
packing capacity, safe labeling/allergy boundaries, reliable delivery, or
customer support coverage.

#### Scenario: Critical operating constraint fails

- **WHEN** a monthly edition cannot satisfy a required margin, sourcing,
  safety, packaging, fulfillment, delivery, or support constraint
- **THEN** Fudi Club pauses sales, reduces cupos, reprices, or moves demand to
  the next cycle

### Requirement: Scaling And Formalization Gates

Fudi Club SHALL start lean without direct import operations or SRL formation as
default initial assumptions, subject to professional legal/tax review before
payment collection.

Fudi Club SHALL reevaluate legal structure, direct import, dedicated storage,
or external operational help when volume, revenue, supplier requirements, or
risk justify it. Specific trigger points include 75+ boxes/month for two
consecutive cycles or operational quality deterioration for fulfillment/storage
changes, 50+ boxes/month for two cycles or repeated manual errors for internal
software, and 100 boxes/month or sustained monthly revenue for broader
formalization review.

#### Scenario: Scale gate is reached

- **WHEN** Fudi Club reaches a defined volume, revenue, supplier, risk, or error
  trigger
- **THEN** the owner reevaluates operating structure before continuing to scale
- **AND** the decision is documented before changing legal, import, storage,
  fulfillment, or software commitments

### Requirement: Future Scope Boundaries

Fudi Club SHALL keep corporate boxes, special occasion drops, formal member
community features, prepaid waitlist reservations, broad taste personalization,
native mobile apps, and direct import operations outside the initial pilot
unless a new OpenSpec change documents why they are now required.

#### Scenario: Future opportunity is proposed

- **WHEN** Fudi Club considers corporate boxes, special drops, formal community,
  paid reservations, broad personalization, native apps, or direct importing
- **THEN** the owner creates or updates an OpenSpec change before implementing
  the new behavior

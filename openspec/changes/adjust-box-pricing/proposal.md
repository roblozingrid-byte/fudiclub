## Why

To make the Fudi Club mystery box more accessible and attractive to a broader audience, we need to adjust the sale price down to the range of $35,000 to $39,000 ARS (from the initial hypothesis of $45,000 ARS). Through BMad financial and volumetric validation, we verified that adopting a flexible product range of 6 to 10 items per box allows us to maintain an abundant, premium mystery box experience (such as our 10-item inaugural edition achieving a 53.2% gross margin at $35,000 ARS) while protecting our ≥40% gross margin target against wholesale price volatility and inflation. We also standardized the physical packaging around an optimized 23x21.5x9cm corrugated box that provides ideal visual density and protection across the 6-10 item range.

## What Changes

- **BREAKING**: Set the base one-time box price hypothesis to $44,900 ARS, explicitly including Free Shipping for CABA and GBA.
- Adjust the quarterly prepaid plan calculation to $127,900 ARS, displaying the total upfront cost prominently on the UI.
- Update the product cost budget (COGS) allowance to up to $15,000 ARS per box.
- Update the standard box configuration to a flexible range of between 6 and 10 items per box (with 10 as the maximum), giving curation flexibility for larger/premium items while protecting our ≥40% gross margin target without resorting to cheap filler products.
- Standardize physical packaging around a 23x21.5x9cm white corrugated box ($925.44 ARS), customized monthly with branding stickers (Logo $342 ARS, Sello $189 ARS) instead of a belly band. Interior includes tissue paper ($108 ARS), a gift sticker sheet ($517 ARS), a thank-you card ($375 ARS), and a member ID card ($167 ARS).
- Enclose the entire package in a 40x50 cm colored inviolable e-commerce bag (e.g., Lilac or Mint Green) at $380 ARS to ensure a premium, branded unboxing experience starting at delivery.

## Capabilities

### New Capabilities

### Modified Capabilities
- `business-fudi-club`: Update Box Product Model (item count), Pricing And Margin Guardrails (new base price of $35,000-$39,000 ARS and quarterly plan pricing), and Brand Color And Packaging System (physical dimensions).

## Impact

- `openspec/specs/business-fudi-club/spec.md`: Source of truth for business rules, pricing hypothesis, box contents, and packaging specs.
- `index.html`: Customer-facing text describing box price and product count.
- `src/checkout.js`: Base price constants and quarterly plan calculations.
- `supabase/functions/create-order/index.ts`: Backend validation of amounts and unit prices.

## 1. Frontend Updates (HTML & Checkout Logic)

- [ ] 1.1 Update base one-time box price from $45,000 ARS to $35,000 ARS in `index.html` text, hero section, and pricing selection cards.
- [ ] 1.2 Verify and ensure item count messaging in `index.html` consistently reflects a flexible range of between 6 and 10 items per box (with 10 as the maximum) alongside the new $35,000 ARS accessible price point.
- [ ] 1.3 Update base price constant ($35,000 ARS) and quarterly plan calculation (reflecting ≤5% discount per box) in `src/checkout.js`.

## 2. Backend Validation & Order Processing

- [ ] 2.1 Check and update unit price validation or default box prices in `supabase/functions/create-order/index.ts` to reflect the new $35,000 ARS baseline.

## 3. Operational & Specifications Alignment

- [ ] 3.1 Verify that operational documentation and spreadsheet templates (e.g., `Fudi_Club_Operaciones.xlsx` and `sync-to-sheets`) accommodate the new $35,000 ARS pricing, 6-to-10 item range, and standard 23x21.5x9cm corrugated box dimensions.
- [x] 3.2 Record pending vendor quotes for the colored cardstock belly band (faja de cartulina), logo sticker, gift sticker sheet, thank-you card, and e-commerce shipping bag to ensure total packaging costs remain under ~$3,000 ARS.
  - *Status*: Shipping bag finalized (40x50 cm Lilac/Mint at $380 ARS). Belly band finalized (DIY cartulina at ~$50 ARS). Awaiting quotes for stickers and cards.

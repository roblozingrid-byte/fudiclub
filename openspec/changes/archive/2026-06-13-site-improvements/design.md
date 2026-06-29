## Context

A multi-agent review (UX, QA, Architect) has surfaced critical bugs and performance bottlenecks in the current `main.js` and `style.css` implementation. The goal is to refactor these areas to create a stable, performant, and accessible frontend before adding new features.

## Goals / Non-Goals

**Goals:**
- Eliminate layout thrashing in the `requestAnimationFrame` loop.
- Fix all unhandled Javascript exceptions and logic traps in the checkout flow.
- Support alphanumeric Postal Codes (CP) in Argentina.
- modularize `main.js` into smaller domain-specific files.
- Fix iOS mobile zoom and touch target accessibility.
- Enhance the retro 90s aesthetic (Win 95 modals).

**Non-Goals:**
- We are not rewriting the entire CSS from scratch, just adding/tweaking.
- We will highlight that business logic (prices, CP) *should* be handled on the backend, but for this frontend scope, we will only fix the frontend validation and payload.

## Decisions

- **Layout Caching**: The `getBoundingClientRect` calls for the header and footer in the stickers loop will be cached and only updated on window `resize`.
- **Module Splitting**: `main.js` will become an entry point that imports `initCheckoutFlow` from `checkout.js`, `initDraggableStickers` from `stickers.js`, etc.
- **Alphanumeric CP**: We will use regex `replace(/\D/g, '')` to strip letters from Argentine CPs before running `parseInt` for shipping calculations.
- **Preorder Logic**: We will update `calculateCurrentEdition` to shift a month ahead not only if `day > 5` but also if `AVAILABLE_STOCK <= 0`.
- **Payload Completeness**: We will append `edition` and `is_preorder` to the `/create-order` POST body so the backend can properly tag orders.
- **Audio Autoplay**: We will ensure the Retro Player only attempts playback after a direct user interaction to respect browser autoplay policies.

## Risks / Trade-offs

- **Module Refactoring**: Splitting the JS file might cause temporary variable scoping issues during the refactoring process. We will need to carefully export/import shared state (like `AVAILABLE_STOCK`).
- **Backend API Contract**: Adding `edition` to the payload must be safely ignored by the backend if it hasn't been updated yet.

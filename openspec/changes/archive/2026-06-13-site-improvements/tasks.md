## 1. Architecture & Performance Refactoring

- [x] 1.1 Split `main.js` into `checkout.js`, `stickers.js`, `audio.js`, and `api.js`.
- [x] 1.2 Update `index.html` to import the new modular entry point.
- [x] 1.3 Cache `getBoundingClientRect()` in `updateStickers` and only update it on window `resize` to prevent layout thrashing.
- [x] 1.4 Add `requestAnimationFrame` debouncing to the `mousemove`/`touchmove` events in `initMysteryReveal`.
- [x] 1.5 Update Retro Audio player to strictly wait for user interaction before calling `play()`.

## 2. Functional Bug Fixes (QA)

- [x] 2.1 Update CP parsing in `checkout.js`: use `cpInput.value.replace(/\D/g, '')`.
- [x] 2.2 Fix `btnConfirm` ReferenceError in mock checkout flow by renaming to `btnSubmit`.
- [x] 2.3 Fix Waitlist loop to exclude `#btn-back-soldout` when hiding children.
- [x] 2.4 Update `calculateCurrentEdition` to shift a month forward if `AVAILABLE_STOCK <= 0`.
- [x] 2.5 Add `edition` and `is_preorder` to the `payload` object in the checkout submission.
- [x] 2.6 Add fallback handler for missing `init_point` in Mercado Pago response.

## 3. UX and Accessibility (Design)

- [x] 3.1 Update `.neo-input` font size to exactly `16px` on mobile media queries to prevent iOS auto-zoom.
- [x] 3.2 Increase padding/size of `.qty-btn` and audio player controls to achieve a `44x44px` touch target.
- [x] 3.3 Wrap the expanded checkout card and waitlist modals in a CSS "Windows 95" Title Bar style.
- [x] 3.4 Add `@media (prefers-reduced-motion: reduce)` to disable grain overlay and fast vibrations.
- [x] 3.5 Add `.ticker:hover .ticker-content { animation-play-state: paused; }` to `style.css`.
- [x] 3.6 Hide the floating stock widget on mobile (`max-width: 768px`) to prevent bottom-screen collision.

## Why

After a comprehensive audit by a multi-agent team (UX, QA, and Architecture), we've identified that the current site suffers from severe layout thrashing (performance), critical checkout flow bugs (such as crashing on simulated payments and miscalculating shipping for alphanumeric postal codes), and several mobile accessibility issues (like iOS auto-zooming). Fixing these will ensure a premium, bug-free Neo-Brutalist experience while drastically improving battery performance on mobile devices.

## What Changes

- **Performance**: Fix layout thrashing in the physics engine (`updateStickers`) by caching DOM measurements, and debounce rapid event listeners.
- **Architecture**: Split the monolithic `main.js` (900+ lines) into modular ES imports (`checkout.js`, `stickers.js`, `audio.js`).
- **Functional (Checkout/Waitlist)**: 
  - Fix `ReferenceError` crashes during mock payment processing.
  - Fix Argentine alphanumeric CP parsing which incorrectly resulted in $0 or $6000 shipping.
  - Fix preorder date desyncs (when stock runs out before the 5th of the month).
  - Include missing context (`edition`, `is_preorder`) in the backend payload.
  - Fix the waitlist success modal hiding the back button.
- **UX & Aesthetics**: 
  - Wrap modals in "Windows 95" classic UI borders to enhance the 90s aesthetic.
  - Fix iOS Auto-Zoom by enforcing `16px` font sizes on inputs.
  - Increase touch targets for mobile accessibility (to `44x44px`).
  - Add `prefers-reduced-motion` support and pause marquee animations on hover.

## Capabilities

### New Capabilities

- `performance-and-architecture`: Modularization, layout caching, and event debouncing.
- `ui-fixes`: Mobile accessibility, Windows 95 styling, motion accessibility, and contrast.

### Modified Capabilities

- `checkout-flow`: Fix payment mock logic, CP alphanumeric parsing, preorder state desync, and backend payload completeness.

## Impact

- `index.html`: Minor markup changes for Windows 95 styling and modular script imports.
- `main.js`: Will be split into multiple `.js` modules.
- `style.css`: Addition of media queries for accessibility, touch targets, and Neo-Brutalist UI enhancements.
- Checkout flow reliability and mobile battery life will drastically improve.

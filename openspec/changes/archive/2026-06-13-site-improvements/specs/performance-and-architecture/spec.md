## ADDED Requirements

### Requirement: Layout Thrashing Prevention
The physics engine for the stickers SHALL NOT trigger layout recalculations inside its animation frame loop.

#### Scenario: Running Physics Engine
- **WHEN** the `requestAnimationFrame` loop updates sticker positions
- **THEN** it uses cached boundaries of the header, footer, and window
- **AND** updates those caches only upon window `resize` events.

### Requirement: JavaScript Modularization
The core JavaScript logic SHALL be split into modular ES domains.

#### Scenario: Application Loading
- **WHEN** `index.html` loads the main script
- **THEN** it acts as a module entry point that imports distinct domains like `stickers.js`, `checkout.js`, and `audio.js` instead of executing a monolithic script.

### Requirement: Explicit Audio Autoplay Policy
The retro audio player SHALL NOT attempt to play audio before user interaction.

#### Scenario: Page Load
- **WHEN** the site loads
- **THEN** the audio player remains paused and waits for a specific `click` or `touchstart` event to begin playback.

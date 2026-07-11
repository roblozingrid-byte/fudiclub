# UI Fixes

## Purpose
TBD

## Requirements

### Requirement: Waitlist UI State
The waitlist UI SHALL allow the user to return to the sold-out options after a successful waitlist registration.

#### Scenario: Successful Waitlist Submission
- **WHEN** user successfully registers for the waitlist
- **THEN** the system displays the success message
- **AND** the system retains the visibility of the "Volver atrás" button.

### Requirement: iOS Font Size Accessibility
The system SHALL prevent native browser auto-zoom behavior on mobile by enforcing a `16px` minimum font size on inputs.

#### Scenario: Focusing Input on Mobile
- **WHEN** a user taps an input field on a mobile device
- **THEN** the input's font size is strictly `1rem` (16px) ensuring iOS Safari does not zoom in.

### Requirement: Touch Target Size
Interactive elements SHALL meet WCAG minimum touch target sizes on mobile devices.

#### Scenario: Interacting with controls
- **WHEN** a user is on a touch device
- **THEN** elements like the `.qty-btn` and audio controls have a minimum interactable area of 44x44 pixels.

### Requirement: Motion Sensibility Support
The UI SHALL respect the OS `prefers-reduced-motion` settings.

#### Scenario: OS with reduced motion enabled
- **WHEN** a user has "Reduce Motion" enabled at the OS level
- **THEN** the `.ticker` marquee, the rapid box vibration, and the grain overlay are disabled or gracefully degraded.

### Requirement: Windows 95 Modal Aesthetics
Modals and floating cards SHALL utilize the retro Windows 95 style title bars.

#### Scenario: Viewing Checkout
- **WHEN** the expanded checkout card or waitlist container is displayed
- **THEN** it renders with a thick top title bar imitating classic 90s OS windows.

### Requirement: Layout Separation and Uniformity
The system SHALL maintain consistent section padding and avoid forced text breaks on wide screens, while ensuring tight layouts on mobile.

#### Scenario: Mobile vs Desktop Layout
- **WHEN** viewed on mobile, sections like `.teaser` become `.neo-border-section` containers and texts use `.mobile-break` for forced newlines.
- **THEN** on desktop, the teaser remains transparent and texts flow naturally without hard breaks.

### Requirement: Retro Support Button
The WhatsApp support widget SHALL adapt to the platform's constraints while retaining the retro monospace typography.

#### Scenario: Support Button Styling
- **WHEN** the button is rendered on desktop, it displays as a pill containing the word "Soporte" and uses `--font-mono`.
- **THEN** on mobile, it gracefully collapses into a circular floating icon button.

### Requirement: Floating Decorative Stickers
Floating sticker elements SHALL adapt their behavior based on the device to avoid obstructing readable content.

#### Scenario: Mobile Sticker Separators
- **WHEN** the user views the site on a mobile device
- **THEN** the stickers behave as block separators between `.neo-border-section` elements instead of freely floating over content.
- **AND** the retro computer sticker is explicitly prioritized after the "Qué es Fudi Club?" section.

### Requirement: Current Month Indicators
The UI SHALL display the current operational month (Agosto) in relevant CTAs and stock widgets.

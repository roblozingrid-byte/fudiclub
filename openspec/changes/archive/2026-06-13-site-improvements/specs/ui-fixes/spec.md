## ADDED Requirements

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

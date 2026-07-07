# Waitlist Registration

## Purpose
TBD

## Requirements

### Requirement: Lead Capture Endpoint (formerly Waitlist)
The system SHALL expose a `join-waitlist` Edge Function that accepts an email address and inserts it into the `waitlist` database table to capture leads silently.

#### Scenario: User starts checkout (Lead Capture)
- **WHEN** a user submits their email on the pre-checkout form
- **THEN** the system saves the email to the database without sending any confirmation email (silent capture).

#### Scenario: User already in waitlist
- **WHEN** a user submits an email that is already registered
- **THEN** the system ignores the duplicate database error gracefully and responds with a success status so the frontend can display the confirmation message without errors.

### Requirement: Waitlist UI
The waitlist interface SHALL be integrated within the checkout/sold-out modal context without unnecessary nested bounding boxes. It MUST provide a clear path to return to the "Asegurar caja" (pre-order) option.

#### Scenario: User navigates waitlist options
- **WHEN** the user is viewing the waitlist form
- **THEN** a "Volver atrás" button is displayed to allow returning to the main sold-out options view.

#### Scenario: Waitlist Success Message
- **WHEN** the waitlist registration is successful
- **THEN** the system replaces the form with a two-line confirmation message ("¡Gracias por anotarte!" followed by "¡Te avisaremos pronto!").

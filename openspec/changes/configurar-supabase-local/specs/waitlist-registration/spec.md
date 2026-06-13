## ADDED Requirements

### Requirement: Waitlist Endpoint
The system SHALL expose a `join-waitlist` Edge Function that accepts an email address and inserts it into the waitlist database table.

#### Scenario: User joins waitlist successfully
- **WHEN** a user submits their email on the waitlist form
- **THEN** the system saves the email to the database and sends a welcome/confirmation email using the Resend API.

#### Scenario: User already in waitlist
- **WHEN** a user submits an email that is already registered
- **THEN** the system ignores the duplicate database error gracefully and responds with a success status so the frontend can display the confirmation message without errors.

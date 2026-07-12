# Checkout Flow

## Purpose
TBD

## Requirements

### Requirement: Checkout Endpoint
The system SHALL expose a `create-order` Edge Function that receives checkout details (including `quantity`, max 3), saves the customer, creates a pending order, calculates shipping (multiplied by quantity), and responds according to the selected payment method.

#### Scenario: Checkout with Mercado Pago
- **WHEN** a user submits the checkout form selecting `mercado_pago` with `quantity` N
- **THEN** the system generates an order in the database, communicates with Mercado Pago API to create a preference for the total price, and returns the checkout URL to redirect the user.

#### Scenario: Checkout with Transferencia Bancaria
- **WHEN** a user submits the checkout form selecting `transfer`
- **THEN** the system creates the order in the database, uses Resend API to send a neo-brutalist styled HTML email with transfer instructions (sender "Fudi Club") instructing them to send proof via WhatsApp, and returns a success response. The UI also directs them to WhatsApp.

### Requirement: Webhook for Mercado Pago
The system SHALL expose a `webhook-mp` Edge Function to process Instant Payment Notifications from Mercado Pago.

#### Scenario: Payment Approved
- **WHEN** Mercado Pago sends a notification that a payment is `approved`
- **THEN** the system updates the order status to `paid` and sends a confirmation email to the customer using Resend.

### Requirement: Alphanumeric CP Parsing
The frontend SHALL parse alphanumeric postal codes correctly to calculate shipping tiers.

#### Scenario: Argentine CP
- **WHEN** the user inputs an alphanumeric CP like "C1425AAB"
- **THEN** the system strips the letters and parses "1425" to assign the correct CABA shipping fee.

### Requirement: Contextual Order Payload
The frontend SHALL send preorder status and edition context to the backend.

#### Scenario: Checkout Submission
- **WHEN** the form is submitted
- **THEN** the payload includes `edition` and `is_preorder` fields.

### Requirement: Mock Payment Reference
The mock checkout flow SHALL safely re-enable the submit button upon mock completion without reference errors.

#### Scenario: Mock Completion
- **WHEN** the mock payment timeout completes
- **THEN** the submit button is re-enabled successfully.

### Requirement: Preorder Date Desync Fix
The system SHALL display the next month's edition if stock is depleted, regardless of the current day.

#### Scenario: Stock runs out before the 5th
- **WHEN** the day is the 3rd but stock is 0
- **THEN** the preorder edition shown corresponds to the following month.

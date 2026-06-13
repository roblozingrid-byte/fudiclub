## ADDED Requirements

### Requirement: Checkout Endpoint
The system SHALL expose a `create-order` Edge Function that receives checkout details, saves the customer, creates a pending order, calculates shipping, and responds according to the selected payment method.

#### Scenario: Checkout with Mercado Pago
- **WHEN** a user submits the checkout form selecting `mercado_pago`
- **THEN** the system generates an order in the database, communicates with Mercado Pago API to create a preference, and returns the checkout URL to redirect the user.

#### Scenario: Checkout with Transferencia Bancaria
- **WHEN** a user submits the checkout form selecting `transfer`
- **THEN** the system creates the order in the database, uses Resend API to send an email with transfer instructions, and returns a success response.

### Requirement: Webhook for Mercado Pago
The system SHALL expose a `webhook-mp` Edge Function to process Instant Payment Notifications from Mercado Pago.

#### Scenario: Payment Approved
- **WHEN** Mercado Pago sends a notification that a payment is `approved`
- **THEN** the system updates the order status to `paid` and sends a confirmation email to the customer using Resend.

## MODIFIED Requirements

### Requirement: Checkout Endpoint
The system SHALL expose a `create-order` Edge Function that receives checkout details, saves the customer, creates a pending order, calculates shipping, and responds according to the selected payment method. The client form SHALL remain locked/disabled while the request is processing to prevent duplicate submissions.

#### Scenario: Checkout with Mercado Pago
- **WHEN** a user submits the checkout form selecting `mercado_pago`
- **THEN** the system generates an order in the database, communicates with Mercado Pago API to create a preference, and returns the checkout URL to redirect the user.
- **AND** the submit button displays a processing state and form fields are disabled.

#### Scenario: Checkout with Transferencia Bancaria
- **WHEN** a user submits the checkout form selecting `transfer`
- **THEN** the system creates the order in the database, uses Resend API to send an email with transfer instructions, and returns a success response.
- **AND** the submit button displays a processing state and form fields are disabled.

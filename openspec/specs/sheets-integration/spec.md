## ADDED Requirements

### Requirement: Customer Sync to Sheets
The system SHALL synchronize newly created customers to a specific Google Sheets tab ("Clientes (Backup)").

#### Scenario: New customer registration
- **GIVEN** an active connection to Google Sheets API
- **WHEN** a new customer is inserted into the `customers` table
- **THEN** the system appends a new row to the Google Sheet with the customer data (ID, Nombre, Email, WhatsApp, Zona, Alergias, Fecha).

### Requirement: Order Sync to Sheets
The system SHALL synchronize newly created orders to a specific Google Sheets tab ("Pedidos (Backup)").

#### Scenario: New order creation
- **GIVEN** an active connection to Google Sheets API
- **WHEN** a new order is inserted into the `orders` table
- **THEN** the system appends a new row to the Google Sheet with the order data (ID Pedido, Fecha, Cliente, Mes Asignado, Estado Pago, Método, Total, Estado Envío, Tracking).

### Requirement: Database Webhooks Trigger
The system SHALL use Supabase Database Webhooks to trigger the synchronization asynchronously to avoid blocking the main transaction.

#### Scenario: Asynchronous webhook execution
- **WHEN** an insert operation occurs on `customers` or `orders`
- **THEN** Supabase fires an HTTP POST to the `sync-to-sheets` Edge Function without waiting for its response.

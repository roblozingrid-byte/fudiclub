## ADDED Requirements

### Requirement: Database Schema Initialization
The system SHALL have a relational database schema initialized with `customers`, `orders`, and `waitlist` tables to support Fudi Club's core workflows.

#### Scenario: First time setup
- **WHEN** the local Supabase environment is initialized
- **THEN** the initial migration script runs, creating the required tables with their respective fields and constraints.

### Requirement: Service Role Access
Edge Functions SHALL connect to the database using the Service Role Key to bypass Row Level Security policies, since users are not authenticated (Guest Checkout).

#### Scenario: Function database access
- **WHEN** an Edge Function attempts to insert a new order
- **THEN** the insertion succeeds without an authenticated user session because the Service Role Key is used.

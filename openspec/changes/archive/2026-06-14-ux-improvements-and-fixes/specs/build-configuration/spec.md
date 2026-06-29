## ADDED Requirements

### Requirement: Strict Environment Variables
The system build tool (Vite) SHALL be able to statically replace environment variables in production by accessing `import.meta.env` properties strictly.

#### Scenario: Production Build Env Replacement
- **WHEN** the application is compiled for production via Vite
- **THEN** `import.meta.env.VITE_SUPABASE_FUNCTIONS_URL` must be strictly accessed without optional chaining `?.` so it is replaced with the literal environment value.

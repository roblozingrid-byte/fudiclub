## ADDED Requirements

### Requirement: Waitlist Sync to Sheets
The system SHALL synchronize newly created waitlist entries to a specific Google Sheets tab ("Waitlist (Backup)").

#### Scenario: New waitlist registration
- **GIVEN** an active connection to Google Sheets API
- **WHEN** a new entry is inserted into the `waitlist` table
- **THEN** the system appends a new row to the Google Sheet with the waitlist data (ID, Email, Fecha).

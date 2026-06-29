## ADDED Requirements

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

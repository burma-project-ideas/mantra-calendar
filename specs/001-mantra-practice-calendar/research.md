# Research

## Daily state
Decision: Generate daily appointments in the existing schedule service and copy each mantra per date.
Rationale: Current generation shares references across days; the service can be checked without UI packages.
Alternative: Copying in the page alone would hide regression-prone logic from a simple check.

## Storage compatibility
Decision: Use typed Date/MantraName/IsPracticed records with the existing key and JSON naming policy.
Rationale: Dynamic JSON objects do not expose date/name properties reliably. Validate null/invalid rows
before applying any records. Ignore unknown date/name combinations. Block writes after a read failure.
Alternative: A new key or backend would risk orphaning existing progress and exceed the requirement.

## Editing and errors
Decision: Clone the appointment inside the dialog; save a prospective list before replacing live state.
Rationale: Close/Cancel cannot leak draft changes; a failed write cannot be displayed as saved success.
Alternative: Direct binding changes current state before users confirm.

## Calendar controls
Decision: Keep Radzen month/year views, open at first scheduled date and select only existing days.
Rationale: Creating arbitrary appointments is unsupported and currently passes invalid dialog parameters.
Alternative: New scheduler or arbitrary schedule editor adds unnecessary scope.

Research was reviewed by a read-only research agent as required by speckit-plan.
No unresolved technical questions remain. Active GetMantraTypes content is authoritative for this change.

# Saved schedule picker
Date: 2026-11-04

## Specification
Show a labeled saved-schedule dropdown with start/end dates, newest first and the active
schedule selected. Choosing an entry immediately opens it using the existing IndexedDB
selection flow. Retain the date form for new schedules. Include schedules with no progress.
Refresh the list on startup, new schedule selection and backup restoration. Disable switching
while a journal operation, practice edit or backup preview is active. Listing is read-only;
errors do not discard existing progress. Keep keyboard access and 320px reflow.

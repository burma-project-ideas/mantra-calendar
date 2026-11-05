# File backups
Date: 2026-11-04

## Specification
Export all IndexedDB schedules, progress and active start date as a versioned JSON download.
Import a JSON file up to 5 MiB. Validate its format, version, dates, progress and duplicate keys
before writing. Show schedule/overlap counts and an explicit Restore backup / Cancel preview.
Restoring replaces matching schedule starts, preserves unrelated schedules and selects the
backup's active schedule. Commit the whole restore in one IndexedDB transaction.
Invalid files and aborted transactions must leave existing state untouched. Keep mobile layout,
keyboard access and status/error feedback. No localStorage or new dependencies.

## Acceptance
- Multiple schedules export and round-trip with their progress and active start date.
- Selecting a file previews it without changing IndexedDB; Cancel makes no change.
- Matching schedules replace only after Restore; unrelated schedules remain.
- Malformed JSON, unknown versions, missing active schedule, invalid dates, duplicate schedules
  and duplicate progress rows are rejected without a partial write.
- Aborted restoration rolls back every write; UI updates only after commit.

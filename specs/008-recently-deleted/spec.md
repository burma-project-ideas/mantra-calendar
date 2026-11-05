# Recently deleted schedules
Date: 2026-11-04

## Specification
Replace the single Undo notice with a persistent Recently deleted schedules selector and Restore
selected schedule action. Keep a distinct recovery copy for every successful deletion, including
repeated deletions of the same start date. List newest first with each period and completion count.
Restore only the chosen copy with its progress; select it and preserve all other recovery copies
and saved schedules. A same-start saved schedule blocks restore without data loss.
Migrate the existing single lastDeletedSchedule record atomically on first use, preserving progress.
Keep recovery available after reload and in an empty journal. No expiry, bulk removal, permanent
purge UI, new dependencies or backup format changes.

## Plan
Use unique deleted: identifiers in the existing journal object store, timestamp each recovery copy,
and migrate the legacy single record with the existing transaction helper. Replace getUndoStartDate
and undoDelete with listDeletedSchedules and restoreDeletedSchedule(id). Return small list DTOs;
reuse Home's picker, state restoration, guards and feedback. Update confirmation, tests and README.

## Tasks
- [X] T001 Add multi-copy archive, legacy migration and targeted transactional restore in practice-db.js.
- [X] T002 Replace Undo UI with accessible deleted-schedule selection and update confirmation wording.
- [X] T003 Extend real IndexedDB assertions and isolated browser fixture checks for migration, multiple copies, rollback, reload and conflicts.
- [X] T004 Build, update documentation and record validation.

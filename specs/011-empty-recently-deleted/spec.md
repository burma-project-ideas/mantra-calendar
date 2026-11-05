# Empty recently deleted
Date: 2026-11-05

## Specification
Add Empty recently deleted to the recovery list. Confirm the number of listed recovery copies
and warn that browser recovery is permanently removed. Focus Keep recovery history; Keep,
Enter, Escape and Close cancel without writes. Only explicit confirmation removes the captured
list of IDs in one transaction. Saved schedules, active selection and backup files are untouched.
Copies added in another tab after confirmation opened are not part of the deletion. Failed writes
roll back the whole batch. Refresh the list/status after commit, including the empty-journal case.

## Plan
Extend the existing confirmation component with a bulk-recovery mode and count. Add a Home
handler that captures the current IDs before opening confirmation and reuses existing guards.
Add an array/prefix/duplicate-validated emptyDeletedSchedules(ids) IndexedDB operation. Extend
real IndexedDB assertions for rollback, captured scope, idempotence, active preservation and
empty history; verify cancellation/focus/mobile through isolated browser fixtures. No new packages.

## Tasks
- [X] T001 Add atomic confirmed-ID batch removal and storage assertions.
- [X] T002 Add Empty recently deleted button, counted confirmation, guards and feedback.
- [X] T003 Build and check cancellation/mobile plus existing confirmation/backup flows.
- [X] T004 Update README.md and validation notes.

# Permanently remove a recovery copy
Date: 2026-11-05

## Specification
Add Permanently delete selected copy beside the recently deleted restore action. Confirm with
the selected period, completion count and warning that browser recovery is removed. Focus Keep
recovery copy by default; Keep, Enter, Escape and Close cancel. Only explicit confirmation invokes
permanent removal. Remove only that deleted: ID, leaving active/saved schedules, other recovery
copies and external backup files untouched. Exported backups may reintroduce the removed copy.
Wait for transaction commit before refreshing/status success. Failed writes preserve everything.
Keep mobile layout and guards during edits, journal operations and backup previews.

## Plan
Add one prefix-validated IndexedDB operation using the current transaction helper. Reuse the
existing confirmation component with a permanent mode, retaining its focus and Escape handling.
Add a Home action and refresh the current lists afterward, including empty recovery history.
Extend IndexedDB assertions for scope, rollback, idempotence, missing-copy restore and backup
recovery; check cancellation paths with isolated browser fixtures. No bulk purge or retention options.

## Tasks
- [X] T001 Add targeted permanent removal and rollback/scope assertions.
- [X] T002 Add confirmation mode, button, busy guards and feedback to Home and DeleteSchedulePopup.
- [X] T003 Build and verify isolated cancellation/mobile and existing recovery/backup flows.
- [X] T004 Document behavior and validation.

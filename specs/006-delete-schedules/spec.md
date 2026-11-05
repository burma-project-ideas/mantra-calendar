# Delete saved schedules
Date: 2026-11-04

## Specification
A Delete selected schedule button opens a confirmation naming the start/end dates and warning
that recorded progress is removed. Keep schedule, Escape and closing the dialog make no change.
Only explicit Delete schedule commits deletion. Disable other journal actions during confirmation.
Delete only the selected start date; preserve all others and select the newest remaining schedule.
If no schedules remain, persist an empty-journal marker, show an empty state, allow creating a
new period or importing a backup, and do not reimport legacy data on reload.
Delete and update active selection in one transaction. Failed transactions leave data/UI intact.

## Plan
Use a small Radzen DialogService popup with Keep focused and Escape handling, existing IndexedDB transaction helpers and schedule selection
models. Add deleteSchedule in practice-db.js; support a null active marker through load/list and
nullable RestoreSchedule in Home. Hide calendar/progress with no active schedule and disable
export when empty. Extend existing browser assertions and test Cancel, Escape, confirm, rollback,
last deletion/reload and recovery through new schedule/backup in isolated browser contexts.

## Tasks
- [X] T001 Add transactional deletion and durable empty-state handling in wwwroot/js/practice-db.js.
- [X] T002 Add confirmation, failure/status feedback and empty-state UI in Pages/Home.razor and Home.razor.css.
- [X] T003 Extend tests/IndexedDb.checks.js and validate cancellation, reload and recovery; final confirmation click blocked by review.
- [X] T004 Update README.md and record results in validation.md.

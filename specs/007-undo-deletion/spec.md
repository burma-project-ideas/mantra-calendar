# Undo schedule deletion
Date: 2026-11-04

## Specification
Persist the most recently deleted schedule and all its progress in IndexedDB in the same
transaction that removes it. Show Undo deletion with the deleted start date after deletion
and after reload, including an otherwise empty journal. Undo restores and selects the saved
schedule, preserves other schedules, then consumes the recovery record atomically. A later
successful deletion replaces the one recovery record. Cancelled/failed deletion retains it.
Undo must not overwrite a recreated or imported schedule with the same start date; fail safely
and leave recovery data available. Aborted undo leaves both journal and recovery record intact.
No expiry timers, new dependencies, recycle-bin UI or backup format changes.

## Plan
Extend deleteSchedule with an atomic lastDeletedSchedule value. Add a read-only undo-date query
and transactional undoDelete in practice-db.js. Refresh undo state with saved schedules on
startup/delete/import/switch and after Undo. Reuse Home's state restoration and error/status
feedback; update the confirmation and README wording. Extend real IndexedDB assertions and
isolated browser fixture checks for reload, empty recovery, collisions and failed writes.

## Tasks
- [X] T001 Persist latest deletion and implement validated atomic undo in wwwroot/js/practice-db.js.
- [X] T002 Add persistent Undo action and update confirmation wording in Pages/Home.razor, Home.razor.css and DeleteSchedulePopup.razor.
- [X] T003 Extend tests/IndexedDb.checks.js and check recovery UI with isolated fixtures.
- [X] T004 Build, update README.md and record validation results.

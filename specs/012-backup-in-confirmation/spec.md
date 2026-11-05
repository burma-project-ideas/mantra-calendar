# Export before permanent deletion
Date: 2026-11-05

## Specification
Add an optional Export backup button inside both permanent single-copy and empty-history
confirmation dialogs. Reuse the current complete version 2 JSON download, including saved
schedules and recovery history. Export must leave the dialog open and never confirm deletion.
Show progress, download-start status and actionable errors within the dialog. Disable final
deletion while export is running; retain Keep/Enter/Escape/Close cancellation and default Keep
focus. Ordinary saved-schedule deletion stays unchanged. No mandatory backup or new format.

## Plan
Pass Home's existing IndexedDB module reference to the two confirmation callers. Let the
confirmation invoke downloadBackup directly with local busy/error/status state; Home's normal
export is guarded during modal editing. Reuse existing button styles and add only a full-width
backup action row. Verify actual downloads, errors, retry, busy deletion guard, dialog persistence,
zero storage removals and both cancel paths in isolated 320px browser fixtures.

## Tasks
- [x] T001 Add export action/state to DeleteSchedulePopup and pass its database reference from Home.
- [x] T002 Build and verify download, errors/retry, busy guard and no deletion for both dialogs.
- [x] T003 Update README.md and validation notes.


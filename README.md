# Mantra Practice Calendar

A local Buddhist mantra practice tracker built with .NET 8 Blazor WebAssembly,
Radzen.Blazor and native IndexedDB. Choose a start date for the supplied Burmese 90-day
sequence (162 individual mantra entries); the end date is calculated automatically.

## Run

Requires the .NET 8 SDK or a compatible installed SDK.

```powershell
dotnet run --project BlazorWasm.MantraCalendarApp --launch-profile http
```

Open http://localhost:5094. Choose a practice start date and press Use schedule.
Select a calendar day, check practiced mantras and Save practice. Uncheck to undo.
Cancel or close discards draft changes. Tab reaches appointments; Enter or Space opens them.
A fresh journal starts on the device's current date. Supported start dates are 0001-01-01
through 9999-10-02 so the entire 90-day schedule fits.

## Verify

```powershell
dotnet run --project tests/MantraCalendar.Checks
dotnet build BlazorWasm.MantraCalendarApp
```

The package-free runner checks inclusive dates, sequence totals, independent daily state,
isolated drafts, JSON compatibility, selected start dates, year boundaries and leap days.
Browser validation records are under specs/.

## IndexedDB storage

Database: mantra-practice-calendar, version 1. Object store: journal.
The activeStartDate key remembers the selected schedule. schedule:YYYY-MM-DD keys hold
that schedule's Date/MantraName/IsPracticed records. Switching schedules retains earlier
progress; overlapping dates in different schedules remain independent.

Writes finish only after the IndexedDB transaction commits. Storage failures block editing
and show an error; failed saves do not change displayed progress. There is no localStorage fallback.

On the first IndexedDB initialization only, existing mantraProgress localStorage records are
read and imported into their original July 9, 2025 schedule. No localStorage writes or deletion
occur. The legacy value remains an untouched backup and is never read again once initialization
has committed. Malformed legacy data is reported without writing a partial journal.

Data stays in this browser and origin. Clearing site data removes it. There are no accounts,
cloud synchronization or automatic cross-device backups. Concurrent tabs editing the same
schedule use the last committed full-schedule save.

## Spec Kit

Specify CLI 1.3.0 initialized with the Codex integration and PowerShell scripts.
Skills live in .agents/skills, shared infrastructure in .specify/, and the current constitution
in .specify/memory/constitution.md. Feature specifications, plans, tasks and validation are
in specs/001-mantra-practice-calendar, specs/002-modern-mobile-ui and
specs/003-selectable-indexeddb-schedules. Earlier fixed-date/localStorage docs are historical.

The real IndexedDB assertion function is tests/IndexedDb.checks.js. In a fresh isolated browser
context, open /manifest.webmanifest on the running server, paste the file into DevTools and call
checkIndexedDb(). It refuses to run if a journal already exists; it writes only the test context.

## Export and restore backups

Use Export backup to download mantra-backup.json containing every saved schedule, its
progress, the selected start date and all recently deleted recovery copies. Unpracticed
schedules and recovery-only journals are included. The file stays
on your device; it is not uploaded to a service.

To restore, choose the JSON file under Import a backup (maximum 5 MiB), review the schedule
and replacement counts plus the recovery-history counts, then select Restore backup. Cancel discards the preview. Progress
for matching start dates is replaced by the file; schedules absent from the file are kept.
The entire restore commits together in IndexedDB. Invalid files or failed transactions leave
the journal unchanged. Recovery entries merge by their unique IDs: existing entries are kept
unchanged, unrelated history remains, and repeated imports do not create duplicate copies.
Reload retains the restored selection, progress and recovery list. A backup containing only
recovery history preserves the current active schedule, if one exists.

New exports use format "mantra-practice-calendar", version 2, activeStartDate, schedules and
deletedSchedules. Each saved schedule contains startDate and a progress array with date,
mantraName and isPracticed. Each deleted copy also includes its id and UTC deletedAt timestamp.
activeStartDate is null when there are no saved schedules. Dates, timestamps, record types,
schedule membership and duplicate keys are validated. The file limit remains 5 MiB.
Version 1 backups (saved schedules only) remain importable and leave recovery history intact.
Unknown versions are rejected. Save another export before replacing progress you
may want to retain; backup files contain readable practice history.

## Switch between saved schedules

Use the Saved schedules dropdown to open a previous practice period immediately, without
re-entering its start date. Periods are listed newest first with their start and end dates,
including schedules with no recorded progress. The current period is selected automatically.
The list refreshes after creating a period or restoring a backup, and the selected schedule
is remembered after reload. Keep using Practice start date and Use schedule to create a period.

## Delete a saved schedule

Open the period in Saved schedules and choose Delete selected schedule. The confirmation names
the dates and warns that progress will be removed. Keep schedule is focused by default;
Keep, Enter on that button, Escape and Close cancel. Only Delete schedule confirms removal.
Other schedules and exported backup files are kept. The newest remaining period opens afterward.
Deleting the final period leaves an empty journal after reload. Use Recently deleted to recover it,
create another period, or import a backup. Legacy progress is not reimported.

## Recently deleted schedules

Recently deleted schedules lists recovery copies newest first, with their practice periods and
completion counts. Choose a copy and press Restore selected schedule to restore its progress
and open it. Other deleted and saved schedules are kept. The list remains available after reload,
including when no saved schedules remain; copies have no automatic expiry.

Every successful deletion creates a separate copy, including repeated deletions of the same
start date. The previous single Undo record is migrated automatically without losing progress.
Restoring removes only the selected recovery entry. Failed writes leave it available for retry.

Restoration never overwrites a saved schedule with the same start date. Such conflicts leave
both copies unchanged. Recovery copies remain in this browser's IndexedDB and are included in
version 2 JSON backups, so they can be exported and restored without first undeleting them.

## Permanently remove recovery history

Choose an entry under Recently deleted schedules and select Permanently delete selected copy.
The confirmation identifies the period and completion count and explains the loss of browser
recovery. Keep recovery copy is focused by default; Keep, Enter, Escape and Close cancel.
Only Permanently delete removes that recovery ID. Saved schedules, active selection, other
deleted copies (even for the same period) and downloaded backup files remain unchanged.

The removed copy can no longer be restored from Recently deleted. Recovery requires an existing
backup containing it; importing that backup can put the copy back. Removing the last recovery
entry hides the list. Failed transactions preserve the entire journal and recovery history.

## Empty recently deleted

Empty recently deleted removes all recovery copies currently listed after a separate counted
confirmation. Keep recovery history is focused by default; Keep, Enter, Escape and Close cancel.
Only the final Empty recently deleted confirmation removes those copies, together in one
IndexedDB transaction. Failed transactions roll back the full batch.

Saved schedules, their progress, active selection and exported backup files are kept. Copies
added in another tab while confirmation is open are also kept because they were not confirmed.
The removed history cannot be restored from this browser; an existing version 2 backup that
contains those copies can recover it later.

Both permanent-removal confirmations offer Export backup before deletion. This downloads the
complete version 2 JSON backup, including saved schedules, progress and all recently deleted
copies, while keeping the confirmation open. Deletion is disabled while the export is running;
Keep and cancellation remain available. Export errors appear in the dialog and allow retry.
Save the downloaded JSON file before confirming deletion: a download-start message does not
confirm that the file has been saved. The existing 5 MiB backup limit applies.

Permanent-delete dialogs show the last backup download start time in the browser's local
time, or state that no export is recorded. The timestamp is kept in IndexedDB and updated
by both the main backup action and dialog exports. It stays local to this browser; importing
a backup does not replace it. It does not guarantee a file was saved or cover later edits.

Permanent-delete confirmations warn when the current backup contents differ from the last
exported snapshot (schedules, progress, active selection or recovery history). Exporting a
fresh backup refreshes this warning. A SHA-256 fingerprint is stored alongside the export
time in IndexedDB, outside the backup format. Older exports without a fingerprint show
coverage as unknown. While either permanent-delete dialog is open, its backup warning and last-export time refresh every two seconds, including changes and exports from other tabs. Checking stops when the dialog closes. Background timers may pause, so returning to a visible tab or focusing its window also refreshes the warning immediately. These listeners are removed when the dialog closes.




During initial and automatic backup-status checks, permanent-delete confirmations show
Checking backup status and disable permanent deletion and export until the check finishes.
Keep, Escape and Close remain available. Failed checks show the coverage warning and finish
the checking state, allowing users to review that warning before choosing whether to proceed.
Ordinary saved-schedule deletion is unchanged.

The backup-safety flow is verified together in `specs/018-backup-safety-complete/spec.md`.
A return-to-tab refresh arriving during a check queues another check, keeping deletion
blocked until the latest check finishes. Closing during a pending check or export stops
further dialog updates. Checks do not lock other tabs; another tab can still change data
after a completed check.

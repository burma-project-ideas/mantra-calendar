# Validation — 2026-11-04

## Build and regression checks
- dotnet build BlazorWasm.MantraCalendarApp --no-restore: PASS, zero warnings/errors.
- Console schedule assertions: PASS.
- Extended tests/IndexedDb.checks.js: PASS against real IndexedDB in a fresh browser context.
  Covers JSON round-trip, active start, empty schedules, preview/no mutation, matching-schedule
  replacement, unrelated-schedule preservation, malformed JSON, unknown version, missing active
  schedule, duplicate schedules/records, out-of-range progress, file-size limit and transaction rollback.
- Tests continue to block localStorage reads/writes after initialization.

## Actual file UI
Executed with an existing Playwright installation in separate headless Edge contexts;
the user's browser profile and journal were not changed.
- Export button triggered a real download named mantra-backup.json containing two schedules.
- Imported the downloaded file through the actual Blazor InputFile control.
- Preview displayed counts without mutating IndexedDB. Cancel retained the exact journal snapshot.
- Restore replaced matching progress, retained an unrelated schedule, selected the backup start
  and displayed the restored completion. Full reload retained progress and selection.
- Malformed and oversized files produced errors without changes to the journal.
- At 320x700, the backup controls and calendar had no horizontal page overflow; screenshot reviewed.

## Limits
No physical-phone, Safari or screen-reader testing. Download delivery was checked in Edge.
Backups are readable JSON, capped at 5 MiB. Confirmed restore replaces progress for matching
start dates, including when the backup is older than current progress.

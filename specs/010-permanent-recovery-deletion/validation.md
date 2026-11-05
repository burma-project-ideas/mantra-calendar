# Validation — 2026-11-05

- Build: PASS, zero warnings/errors. Console schedule checks: PASS.
- Real IndexedDB assertions: only the chosen recovery ID is removed; active selection, saved
  progress and every other recovery copy remain unchanged. Invalid/non-recovery keys are
  rejected. Aborted removal rolls back fully; repeated removal is harmless. The removed entry
  cannot be restored directly, but an existing backup can restore it. Removing final history
  preserves active schedules or leaves an already empty journal empty as appropriate.
- Existing backup/saved-picker/file checks pass after the new storage operation.
- Isolated headless Edge at 320x700: confirmation names the selected period and completion count,
  warns about loss of browser recovery, and focuses Keep recovery copy. Keep, Enter, Escape and
  Close preserve the exact journal snapshot and make zero storage-removal calls. Switching is
  disabled during confirmation and controls fit without horizontal page overflow.
- Ordinary saved-schedule confirmation cancellation and empty-journal backup recovery still pass.
- Tests did not alter the user's browser data. The final destructive confirmation UI click was
  not automated after the earlier approval-review restriction; the storage operation was tested
  separately in fresh isolated browser contexts.

Limits: recovery after permanent removal requires an existing backup containing that entry.
No physical-phone, Safari or screen-reader checks.

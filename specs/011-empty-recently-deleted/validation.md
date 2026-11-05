# Validation — 2026-11-05

- Build: PASS, zero warnings/errors. Console schedule assertions: PASS.
- Real IndexedDB assertions: captured recovery IDs are removed as one batch; a copy added after
  the confirmation snapshot survives. Saved schedules, progress and active selection remain
  unchanged. Invalid/non-recovery/duplicate IDs are rejected and an empty list is a no-op.
- Injected abort after a removal succeeds rolls back the entire batch. Repeating the same batch
  is harmless. Clearing final history preserves active data or an already empty journal, and a
  prior backup can restore the removed copies. Existing backup/file/saved-picker checks pass.
- Isolated headless Edge at 320x700: confirmation names the number of copies, warns about loss of
  browser recovery and focuses Keep recovery history. Keep, default Enter, Escape and Close
  preserve the exact snapshot and make zero storage-removal calls. Other controls are disabled
  during confirmation and the layout has no horizontal overflow.
- Existing single-copy permanent-removal and ordinary saved-schedule cancellation checks pass.
- No user browser data was altered. The final destructive confirmation UI click was not
  automated after the earlier approval-review restriction; atomic storage removal was exercised
  separately in fresh isolated contexts.

Limits: recovery after emptying requires a pre-existing backup containing the copies.
No physical-phone, Safari or screen-reader checks.

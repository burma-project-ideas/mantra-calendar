# Validation — 2026-11-05

- Build passed with zero warnings/errors; console schedule assertions passed.
- `tests/DialogBackup.checks.cjs`: isolated headless Edge at 320x700 verified both
  permanent-copy and empty-history dialogs download complete version 2 JSON, remain
  open, preserve the exact journal snapshot, and make zero storage-removal calls.
- A held IndexedDB transaction verified busy state disables export and final deletion
  while Keep remains enabled. Releasing it completes the download successfully.
- Injected download failure showed an inline alert; retry succeeded. Downloaded JSON
  contained saved schedules, both recovery copies and their progress.
- Existing ordinary-delete, permanent-copy and empty-history cancellation checks passed:
  default Keep focus, Enter, Escape and Close preserve data and mobile layout fits.
- Run the new check with an externally available playwright-core on NODE_PATH,
  installed Edge, and the app running at localhost:5094. No dependency was added.

Final destructive UI clicks were not automated because of the earlier approval-review
restriction; no user browser data was touched. Physical phones, Safari and screen readers
were not checked. Users must save the downloaded file before confirming deletion.

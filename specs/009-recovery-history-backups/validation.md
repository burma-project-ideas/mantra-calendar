# Validation — 2026-11-05

- Build: PASS, zero warnings/errors. Console schedule assertions: PASS.
- Real IndexedDB checks: version 2 exports include complete recovery IDs, timestamps and progress;
  round-trip restores consumed archive entries; repeated import creates no duplicates; existing-ID
  recovery content remains unchanged. Version 1 import retains all recovery history.
- Archive-only preview/export/import works with null active selection; importing history alone
  preserves an existing selected schedule or leaves an empty journal empty.
- Invalid/duplicate recovery IDs, missing history, impossible/malformed timestamps and invalid
  progress are rejected before changes. Injected failure while adding history rolls back saved
  schedule updates, active selection and all archive additions together.
- Actual JSON downloads and Blazor InputFile restores in isolated headless Edge contexts at 320px:
  mixed and archive-only files contain both recovery records and exact metadata. Preview shows
  recovery/existing counts; Cancel leaves data unchanged; import preserves unrelated history and
  same-ID content; reimport does not duplicate; reload retains entries and individual recovery
  restores their recorded completion. Actual version 1 file import keeps history intact.
- Existing backup, saved-picker, invalid-file and mobile reflow checks pass. No user browser
  journal was changed; tests used isolated prepared fixtures and temporary browser contexts.

Limits: backups remain readable JSON capped at 5 MiB. Existing recovery copies with matching IDs
are intentionally kept unchanged. No physical-phone, Safari or screen-reader testing.

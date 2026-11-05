# Validation — 2026-11-04

- Build: PASS, zero warnings/errors. Console schedule assertions: PASS.
- Real IndexedDB assertions: deletion selects the newest remaining schedule, preserves unrelated
  records, rejects invalid dates and rolls back failed deletion. Final deletion remains empty;
  new-period creation and backup recovery work. LocalStorage remains blocked after initialization.
- Existing backup and saved-picker browser regression checks: PASS.
- Isolated headless Edge at 320x700: Keep receives focus; Keep, Enter, Escape and Close all cancel
  without data changes. Confirmation fits the viewport and disables schedule switching.
- Empty-state fixture: reload stays empty, calendar hidden, delete/export disabled; backup import
  restores visible progress and selection, and a new period can be created afterward.
- Test contexts did not alter the user's browser journal.

Automatic approval review blocked the test clicking the final delete confirmation with reason
"blocked by policy". That click was not tested; cancellation and actual IndexedDB deletion,
rollback and recovery were tested separately. No physical-phone, Safari or screen-reader checks.

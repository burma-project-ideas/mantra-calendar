# Validation — 2026-11-04

- Build: PASS, zero warnings/errors. Console schedule assertions: PASS.
- Real IndexedDB checks: distinct recovery IDs for successive deletions and repeated start dates;
  older-copy restoration preserves other deleted entries; aborted writes preserve journal and
  archive; recreated-date conflicts never overwrite; invalid IDs are rejected. Legacy single Undo
  migrates once with progress intact. Existing backup and saved-schedule checks also pass.
- Isolated headless Edge fixtures at 320x700: three deleted entries, including a legacy Undo copy,
  appear newest first and survive reload. Failed restoration preserves all three. Restoring the
  oldest then other copies restores their individual progress, selects each recovered period,
  preserves unrelated saved schedules and removes only the chosen archive entries.
- Both populated and empty journals recover successfully. Restored state survives reload;
  native controls produce no horizontal page overflow.
- Confirmation Keep/default Enter/Escape/Close, backup recovery and new-schedule creation pass.
- No user browser data was changed; restoration UI checks used prepared archive fixtures. The
  final delete-confirmation UI click was not repeated after the earlier approval-review restriction.

Limits: deleted copies remain browser-local and are excluded from version 1 JSON backups.
No physical-phone, Safari or screen-reader checks. Same-start saved schedules block restoration.

# Validation — 2026-11-04

- Build: PASS, zero warnings/errors. Existing console assertions: PASS.
- Extended IndexedDB browser assertions: practiced and empty schedules appear, newest first;
  listing does not change journal data; unrelated schedules remain listed after backup restore.
- Isolated headless Edge UI at 320x700: selector starts on the active schedule; selecting another
  period opens it immediately with its saved completion, updates the date form and survives reload.
- Switching back restores the earlier period's completion without changing it.
- Creating a new period adds/selects it immediately. Importing an additional empty schedule
  refreshes the dropdown immediately, and that schedule opens successfully.
- Switching is disabled during backup preview. Backup download, import/cancel/restore, invalid
  and oversized file handling still pass. No horizontal page overflow at 320px.
- No user browser data was altered. Tests used fresh isolated browser contexts.

Limits: no physical-phone, Safari or screen-reader testing. Other-tab changes appear when this
page next refreshes the saved list or reloads; no live multi-tab synchronization was added.

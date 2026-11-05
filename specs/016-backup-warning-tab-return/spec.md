# Refresh backup status on tab return

Both permanent-delete dialogs subscribe to visibilitychange and window focus while open.
When visible, the callback reuses the same backup status check as the two-second timer.
It updates warning and export time without moving focus. Concurrent callbacks are ignored
while a refresh or dialog export runs. Closing the component stops polling, removes both
listeners and disposes its JS/.NET references; ordinary deletion adds no listeners.
No storage format, dependencies or localStorage changes.

Validation: build passed, zero warnings/errors. DialogBackup.checks.cjs passed in isolated
Edge at 320px with the confirmation page clock paused, preventing polling from refreshing:
second-tab progress changes followed by focus, and schedule/recovery changes followed by
visibilitychange, refreshed each open dialog within a 1.5-second assertion window. A fresh
export in the second tab cleared warnings on focus. Existing export/retry/busy checks and
focus preservation passed. Events were dispatched in the test; physical tab-switching,
phones, Safari and screen readers were not checked. Final destructive clicks not automated.

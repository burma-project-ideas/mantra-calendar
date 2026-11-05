# Refresh backup warnings across tabs

The shared permanent-delete dialog rechecks IndexedDB every two seconds while open,
using its existing timestamp and fingerprint comparison. This covers schedule/progress/
recovery changes and exports in other tabs without per-writer changes, messaging or
localStorage. Checks run sequentially, skip an in-progress dialog export and stop on
component disposal. Warning errors remain visible via the existing coverage error state.
Focus, cancellation and the confirmed recovery-copy snapshot are preserved.

Validation: build passed with zero warnings/errors. Console assertions passed.
DialogBackup.checks.cjs passed at 320px in isolated Edge: a second tab changes progress,
schedule selection and imported recovery history for each open permanent-delete dialog;
each change shows the warning without reopening. An actual backup download in the second
tab clears the warning, and focus is preserved. Existing export, retry, busy-state and
cancellation assertions pass. No user browser data was touched.

Limits: two-second refresh interval; background-tab timers may be throttled. No physical
phone, Safari, screen-reader or final destructive-click checks.

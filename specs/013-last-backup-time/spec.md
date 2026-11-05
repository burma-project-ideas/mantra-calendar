# Last backup export time

Both permanent-copy and empty-history confirmations display the most recent download-start
time in browser local time, with explicit missing/unavailable states. The shared download
helper records an ISO timestamp in IndexedDB after initiating a download, and returns its
local display value to refresh an open dialog. No localStorage or backup schema change.
Importing a backup does not claim a local export occurred. Failed download creation keeps
the existing timestamp. Existing cancellation and busy deletion guards remain.

Validation: build passed with zero warnings/errors; console schedule checks passed.
`tests/DialogBackup.checks.cjs` passed in isolated Edge at 320x700: no prior export,
updated timestamps in each dialog, persistence across reload, failed export preserves the
previous timestamp, download/retry, intact backup contents and busy deletion guard.

Not checked: physical mobile devices, Safari, final destructive UI clicks. Download start
cannot establish that the user saved the file, and later changes may not be in that backup.

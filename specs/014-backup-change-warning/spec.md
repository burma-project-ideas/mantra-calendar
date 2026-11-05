# Warn about changes since export

Both permanent-delete confirmations compare the current full v2 backup snapshot against
a SHA-256 fingerprint of the actual downloaded snapshot. Shared downloadBackup stores
fingerprint and timestamp atomically after starting download. Metadata is excluded from
backup data, so imports cannot falsely mark themselves backed up. Missing fingerprints
(including old timestamp-only exports) and check failures warn that coverage is unknown.
No per-mutation bookkeeping, new dependency, backup-format change or localStorage writes.

Validation: build passed with zero warnings/errors using IntermediateOutputPath on C:
(the D: disk filled during work). Generated obj/Debug was moved to workspace work, after
automatic approval review rejected deletion. Restarted the dev server with new assets.
DialogBackup.checks.cjs passed in isolated Edge at 320px: schedule, progress and recovery
changes detected, identical restored contents clean, both dialog warnings visible, fresh
exports clear warnings, failed downloads/retry and busy guards preserved. Console checks pass.

Not checked: physical phones, Safari, final destructive UI clicks. Warning refreshes on
opening and after export, not continuously across tabs. Download initiation cannot confirm
that the user saved a file. Fingerprint represents exported content, not a mutation log.

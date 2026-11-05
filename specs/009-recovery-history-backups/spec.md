# Back up recovery history
Date: 2026-11-05

## Specification
Export version 2 JSON containing saved schedules, active selection and all recently deleted
copies with IDs, deletion timestamps and progress. Allow archive-only backups when no saved
schedules remain. Continue importing version 1 (saved schedules only) without changing history.
Validate all recovery records, IDs, timestamps and progress before any writes. Import saved
schedules with existing replacement semantics; merge deleted copies by ID, keeping any existing
copy unchanged. Reimport must not duplicate history. Unrelated saved/deleted entries remain.
Archive-only import preserves the current active schedule if any. Preview shows saved/recovery
counts and existing-copy handling. The restore commits together or rolls back completely.
Keep the 5 MiB limit and existing file controls. No additional packages or backup options.

## Plan
Extend practice-db.js validation/export/preview/restore; reuse schedule validation for archived
progress. Preserve IDs and canonical UTC timestamps, and merge recovery entries transactionally.
Support nullable active selection in version 2. Update Home export guards/preview/status/errors,
BackupPreview DTO, tests and README. Verify v1 compatibility, archive-only files, real downloads,
restoration, reload, malformed history, duplicates, conflicts and abort rollback.

## Tasks
- [X] T001 Extend JSON schema and atomic IndexedDB backup operations with version 1 compatibility.
- [X] T002 Update UI preview, archive-only export and messaging.
- [X] T003 Extend real IndexedDB and browser file-flow checks for complete recovery history.
- [X] T004 Build, document version 2 and record results.

# Plan
Extend existing practice-db.js transaction and validation helpers with exportBackup,
downloadBackup, previewBackup and restoreBackup. Read keys/values together in one readonly
transaction; include an empty selected schedule when it has no progress entry yet.
Use native Blob download and Blazor InputFile (5 MiB stream bound). Add a small responsive
backup section in Home with preview/confirmation and nonblocking feedback separate from
journal storage errors. Extend existing browser IndexedDB assertions and test actual file UI.

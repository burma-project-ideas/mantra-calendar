# Plan
Use native IndexedDB through a small ES module imported with existing Blazor JS interop;
no replacement storage package. One journal object store holds the active start date and progress
arrays keyed by schedule start. Resolve writes only after transaction completion. Validate dates
and records at the JS/C# boundaries. Import legacy data once during initialization without writes
or deletion in localStorage. Remove Blazored.LocalStorage package and service registration.
Parameterize the existing service's generation using offsets from its supplied sequence.
Update Home with a responsive start-date form, loading/error states and per-schedule persistence;
recreate scheduler when the active date changes. Extend console regression checks, then verify
real IndexedDB transactions, reload, migration, schedule isolation and failure behavior in browser.
User instructions supersede earlier fixed-2025/localStorage constitution constraints.

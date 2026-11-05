# Plan
Add listSchedules to the existing IndexedDB module using the journal's keys and active date
in one read transaction. Validate and return sorted ISO start dates. Use a native labeled
select in Home; route changes through ApplySchedule. Refresh via one small helper with
independent error feedback. Add module and isolated browser assertions for list ordering,
empty schedules, immediate switching, reload, backup import refresh and mobile width.

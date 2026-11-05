# Validation — 2026-11-04

## Build and automated checks
- dotnet build BlazorWasm.MantraCalendarApp: PASS, zero warnings/errors.
- Console assertions: PASS for all original checks plus chosen starts, year boundary,
  identical mantra sequence, leap day and unsupported date range rejection.
- tests/IndexedDb.checks.js executed against the real browser IndexedDB API in a fresh
  isolated context: PASS for persisted active date, progress, overlapping-schedule isolation,
  invalid dates, failed transactions and no localStorage reads/writes after initialization.

## Browser journeys
Used isolated contexts only; existing user data was not altered.
- Fresh journal defaults to the device's current date, November 4, 2026.
- Complete one mantra on November 4 and save. Switch to November 5: zero completion.
  Switch back: original completion returns. Reload: chosen date and completion retained.
- Block all localStorage reads/writes after initialization: normal save, switching and reload work.
- Import a PascalCase legacy record: July 9, 2025 and 1/9 completion restored.
  Legacy source remains untouched. Reload with reads/writes blocked: import is not repeated.
- Malformed legacy JSON: error shown, legacy untouched, IndexedDB store left empty.
- Force transaction abort after a put request succeeds: no false success, UI unchanged;
  reload confirms the last committed record remains.
- Deny IndexedDB open: visible storage error and disabled schedule button; no localStorage fallback.
- Mobile viewport 320x700: schedule form fits without horizontal page overflow.

## Remaining limits
No physical-device, Safari or screen-reader testing. IndexedDB remains local to this browser
and origin. Clearing site data removes it. Concurrent edits to the same schedule in multiple
tabs use the last committed full-schedule save.

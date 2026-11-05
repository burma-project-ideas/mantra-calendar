# Selectable schedules and IndexedDB
Date: 2026-11-04

## Specification
The user chooses a start date for the existing 90-day sequence; the end date is start plus 89 days.
Keep all Burmese names and sequence offsets. Each start date owns independent saved progress.
Remember the selected schedule and progress in IndexedDB. Fresh users start on their device's
current date. Existing localStorage progress is imported once into its original July 9, 2025
schedule; it is never written by the new app and remains untouched as a backup.
Do not fallback to localStorage if IndexedDB fails. Show errors and do not claim failed writes saved.

## Acceptance
- Any supported start date generates 90 inclusive dates and the same 162 mantra entries.
- Start date, progress and selected calendar survive refresh.
- Switch between start dates and restore their separate progress, including overlapping dates.
- Legacy PascalCase/camelCase progress imports only once and is retained after refresh.
- Malformed legacy data is preserved, reported and not overwritten.
- Blocked/unavailable IndexedDB or failed transactions preserve displayed and persisted data.
- Schedule picker fits 320px; existing save/cancel/undo and keyboard interactions remain.

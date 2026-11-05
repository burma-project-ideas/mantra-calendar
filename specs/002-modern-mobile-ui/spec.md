# Feature: Modern, mobile-friendly practice calendar
Date: 2026-11-04

## Specification
Refresh the existing calendar with a calm green/neutral palette, clear heading hierarchy,
readable overall progress and a cohesive application header. Retain all calendar views,
keyboard editing, Burmese names, supplied dates, and existing storage/save/cancel behavior.
On phones, controls wrap, appointments retain readable counts, and the practice dialog fits
within the viewport with reachable actions. No accounts, new schedules or packages.

## Acceptance
- At 320, 390, 768 and 1280 CSS pixels, the page has no horizontal overflow.
- Calendar navigation and view buttons remain reachable; each appointment is at least 44px high.
- Long Burmese labels wrap, with Save/Cancel available in a scrollable phone dialog.
- Completion and pending status use text as well as color; visible focus remains available.
- Save, Cancel, undo and reload keep their existing results.

# UI validation — 2026-11-04

- dotnet build BlazorWasm.MantraCalendarApp --no-restore: PASS, zero warnings/errors.
- Existing tests/MantraCalendar.Checks runner: PASS.
- Isolated browser checks at 320, 390, 768 and 1280 CSS pixels: no page horizontal overflow;
  month appointments have 44px minimum height and readable view labels.
- Six-week August 2025 checked at 320px: calendar weeks fit without nested vertical scrolling.
- Phone Planner, Timeline, Year and Month switch without page overflow or Blazor error UI.
- At 320x700, dialog width is 296px with 12px margins; long Burmese labels wrap and
  sticky Save/Cancel stay reachable while the list scrolls.
- Label tap toggles correctly. Cancel discards draft changes. Save updates July 9 only;
  July 10 remains pending. Reload preserves progress. Undo returns the saved count to zero.
- Keyboard Enter opens the focused day; Space toggles the focused checkbox.
- Visual review: desktop calendar, narrow phone calendar and phone practice dialog.
- Reduced-motion CSS and visible focus indicators provided; text status retained alongside color.

Limits: tested with browser viewport emulation, not physical phones, Safari or a screen reader.
No claim of full WCAG conformance. Existing 2025 schedule and browser-local progress remain.

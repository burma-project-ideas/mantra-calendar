# Validation — 2026-11-04

## Installation and workflow
- Specify CLI 1.3.0 installed with uv from the official specify-cli PyPI distribution.
- Nine official generated speckit-* skills installed globally in the user's Codex skills directory.
- Codex integration initialized in this existing repository with PowerShell scripts.
- Constitution 1.0.0, feature specification, research, plan, model, contracts and tasks produced.
- Specification-quality checklist: 4/4 satisfied. No extensions.yml exists; no extension hooks apply.
- Current Git branch remains main. Pre-existing moved/deleted paths were not restored or staged.

## Automated checks
- Initial regression runner failed because production GetAppointments and MantraProgress did not exist.
- After implementation, runner PASS: 90 inclusive dates, 162 mantra records, boundary dates,
  correct per-day counts, independent daily state, isolated drafts, legacy JSON and required fields.
- dotnet build BlazorWasm.MantraCalendarApp --no-restore: PASS, 0 warnings, 0 errors.

## Browser checks
Used an isolated Chrome context at http://localhost:5094; no user browser progress was changed.
- Initial calendar: July 2025, supplied period, 0/162 completed.
- July 9: nine named mantra controls rendered; July 18: one scheduled mantra.
- Toggle followed by Cancel: no displayed change; reopening shows the original state.
- Toggle followed by Save: 1/162, July 9 is 1/9; July 10 remains 0/9.
- Full reload restores the saved completion. Uncheck + Save returns to 0/162.
- Invalid JSON shows the read error, preserves original storage and blocks editing.
- Simulated QuotaExceededError shows the save error, leaves live state unchanged and writes no data.
- Keyboard Enter opens an appointment; Space toggles the focused checkbox.
- Unscheduled July 1 opens no editor.
- Month, planner, timeline and year views render without the Blazor error UI;
  planner and timeline each render all 90 appointments.

## Limits
No production deployment, published PWA/offline-install validation, cross-browser/device matrix,
or synchronization testing. The supplied 2025 schedule and browser-local storage remain intentional.

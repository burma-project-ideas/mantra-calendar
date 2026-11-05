# Tasks: Mantra Practice Calendar
**Input**: Design documents in specs/001-mantra-practice-calendar/
**Tests**: Required by FR-008 and the constitution; package-free regression checks plus browser validation.

## Phase 1: Setup
- [X] T001 Install Codex integration and record principles in .specify/memory/constitution.md.

## Phase 2: Foundational
- [X] T002 Add executable assertion runner in tests/MantraCalendar.Checks/Program.cs and MantraCalendar.Checks.csproj; demonstrate failure before implementation.

## Phase 3: User Story 1 - Find scheduled practice (P1, MVP)
Goal: display the existing practice period, with safe blank-date behavior.
Independent test: verify first/last dates, 90 generated days, July 2025 initial view and no blank-day editor.
- [X] T003 [US1] Generate independent daily appointments in BlazorWasm.MantraCalendarApp/Services/MantraScheduleService.cs; keep strings non-null and Mantras a non-null list; End is Start plus one day.
- [X] T004 [US1] Set initial schedule date and ignore unscheduled clicks in BlazorWasm.MantraCalendarApp/Pages/Home.razor.

## Phase 4: User Story 2 - Record daily practice (P1)
Goal: reversible completion and isolated dialog drafts.
Independent test: complete July 9 without affecting July 10; cancel changes; undo completion.
- [X] T005 [US2] Clone draft appointment and add labeled toggle, Save and Cancel controls in BlazorWasm.MantraCalendarApp/Pages/EditMantraPopup.razor.
- [X] T006 [US2] Add text completion counts and calendar status in BlazorWasm.MantraCalendarApp/Pages/Home.razor and Home.razor.css.

## Phase 5: User Story 3 - Resume saved practice (P2)
Goal: reload compatible typed records and report storage failures safely.
Independent test: round-trip legacy JSON; refresh persisted selection; malformed storage is preserved.
- [X] T007 [US3] Define MantraProgress with required Date, MantraName and IsPracticed JSON fields in BlazorWasm.MantraCalendarApp/Services/MantraScheduleService.cs; Date is non-default and MantraName is non-empty.
- [X] T008 [US3] Load and validate all records before applying; save prospective data before changing live state; block writes after storage errors in BlazorWasm.MantraCalendarApp/Pages/Home.razor.

## Phase 6: Polish & Validation
- [X] T009 Document run/check commands and local-only storage in README.md; ignore work/ backups in .gitignore.
- [X] T010 Run tests/MantraCalendar.Checks, build BlazorWasm.MantraCalendarApp and browser scenarios from specs/001-mantra-practice-calendar/quickstart.md; record results in validation.md.

## Dependencies & Execution Order
Setup -> assertion runner -> US1 -> US2 -> US3 -> final validation.
US2 and US3 share Home.razor and are sequential. No parallel implementation is needed.
Parallel examples: US1 date assertions, US2 draft assertions and US3 JSON assertions can run together
once their production methods exist, within the single console runner.

## Implementation Strategy
Deliver the existing calendar as the MVP, then isolated edits, then durable progress. Validate each
story through its assertion/browser scenario. Retain current packages and the active schedule content.


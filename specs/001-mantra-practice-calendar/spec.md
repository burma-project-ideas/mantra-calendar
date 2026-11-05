# Feature Specification: Mantra Practice Calendar

**Feature Branch**: Existing working branch (unchanged)
**Created**: 2026-11-04
**Status**: Implemented and validated
**Input**: Install github/spec-kit in Codex and use it to create Mantra Practice Calendar,
building on the existing Blazor project.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find scheduled practice (Priority: P1)
A practitioner opens the calendar and sees the supplied practice period and daily mantras.
**Why this priority**: Finding a scheduled day is the core purpose.
**Independent Test**: Open the app with empty storage and inspect July 9 and July 18, 2025.
**Acceptance Scenarios**:
1. Given no saved progress, when opening the calendar, then the initial view shows July 2025.
2. Given the calendar, when selecting July 9, then all nine supplied mantras appear as pending.
3. Given an unscheduled date, when selecting it, then no empty edit dialog or error appears.

### User Story 2 - Record daily practice (Priority: P1)
A practitioner opens a scheduled day, toggles individual mantras and saves or cancels.
**Why this priority**: Daily completion is the primary interaction.
**Independent Test**: Complete one mantra on July 9 and verify July 10 remains pending.
**Acceptance Scenarios**:
1. Given pending practice, when toggling and saving, then only that date changes and status updates.
2. Given a completed mantra, when toggling it off and saving, then it becomes pending.
3. Given draft edits, when cancelling or closing the dialog, then no draft changes are retained.

### User Story 3 - Resume saved practice (Priority: P2)
A returning practitioner sees saved completion after refreshing the page.
**Why this priority**: A progress tracker must retain recorded practice.
**Independent Test**: Save a completion, reload, and inspect the same and adjacent dates.
**Acceptance Scenarios**:
1. Given existing Date/MantraName/IsPracticed records, when reloading, then matching records restore.
2. Given malformed storage, when loading, then an error appears and original storage is preserved.
3. Given a failed storage write, when saving, then an error appears without claiming success.

### Edge Cases
- Inclusive date ranges must include both the first and last date.
- Empty dates must not appear completed or create invalid appointments.
- Unknown saved dates or names are ignored without changing known practice.
- Storage failures block further saves until reload, preserving unreadable data.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Retain existing month and yearly calendar views and supplied Burmese schedule.
- **FR-002**: Start at the first scheduled date and show the practice period.
- **FR-003**: Store independent completion state per date and mantra.
- **FR-004**: Support completion, undo, explicit save and cancel without draft leakage.
- **FR-005**: Restore existing saved progress and preserve its storage format and key.
- **FR-006**: Display saved completion counts and pending/completed text, with optional color.
- **FR-007**: Show actionable load/save errors and preserve stored data on failure.
- **FR-008**: Include an executable regression check proving daily state isolation and saved-progress compatibility.

### Key Entities
- Practice day: a date and its ordered list of required mantras.
- Mantra: supplied name, type, description, repetition count and completion flag.
- Progress record: date, mantra name and completion flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: All 90 supplied practice dates are visible through calendar navigation.
- **SC-002**: Completing a mantra changes zero other dates in the regression check.
- **SC-003**: Saved completion survives a full page reload in the browser smoke check.
- **SC-004**: Cancelled edits produce zero persisted or displayed completion changes.
- **SC-005**: The app builds without errors and invalid stored data does not crash the calendar.

## Assumptions
- This is a local, single-user calendar with the existing 2025 schedule.
- Accounts, cloud sync, new schedules and arbitrary appointments are outside this version.
- The existing .NET 8 stack and browser storage remain the implementation platform.


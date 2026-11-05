<!-- Sync impact: 1.0.0 -> 2.0.0. User explicitly replaces fixed dates and localStorage
with selectable 90-day schedules and IndexedDB. Historical feature specs remain historical. -->
# Mantra Practice Calendar Constitution

## Core Principles

### I. Preserve practice data
Store schedules and progress in IndexedDB. Existing mantraProgress records MAY be read once
for migration, but MUST NOT be written or deleted in localStorage. Unreadable data MUST be
reported without overwriting it. Failed transactions MUST NOT be displayed as saved success.

### II. Independent daily and schedule progress
Every date MUST own its mantra state. Each schedule start date MUST own separate progress,
including when dates overlap. Switching schedules MUST preserve prior progress.

### III. Reuse the existing stack
Use the existing .NET 8 Blazor WebAssembly app, Radzen components and native IndexedDB via JS interop.
New packages, backend services and accounts require an actual product requirement.

### IV. Accessible and reversible interaction
Practice controls MUST have readable labels, keyboard access and text status.
Users MUST be able to undo completion. Cancelling a dialog MUST discard draft edits.

### V. Verify the core journey
Changed schedule logic MUST have an executable assertion-based regression check.
Before completion, build the app and verify its save/reload journey in a browser.

## Product Constraints
Retain the supplied Burmese mantra names and 90-day sequence. Users choose the start date;
the final practice day is start plus 89 days. Do not infer religious dates or add cloud sync.

## Development Workflow
Write a feature specification, implementation plan and task list before changing application code.
Keep changes scoped to requested behavior, affected callers, tests and documentation.

## Governance
Review each change against these principles. Amendments MUST record rationale and update this file.
Use semantic versioning: major for incompatible principles, minor for new principles, patch for wording.

**Version**: 2.0.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04

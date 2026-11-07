# HeroUI interface and Mantra brand

Date: 2026-11-07

## Scope

Replace the rendered Blazor/Radzen UI with React 19, HeroUI 3.2.7 and Tailwind 4. Use the
real HeroUI component system throughout, not a CSS approximation. Preserve journal data,
the supplied sequence, Myanmar-default language, backup formats and recovery behavior.
Create and apply a matching logo to every active brand surface and app icon.

## Implementation

- Root Vite app with typed React components. The former UI and historical browser scripts
  are retained in legacy/ as reference; .NET is not required to run the active interface.
- Calendar, Select, Tabs, Card, Modal, Checkbox, ProgressBar, Alert, Skeleton and Button are
  actual @heroui/react controls. Raw HTML is semantic layout and the hidden browser file
  input used by a HeroUI upload button.
- Public storage module is identical to the original; same database, object store, keys,
  transaction semantics, language preference and version 1/2 backups. Existing journals
  remain available on the same origin. No schema change, localStorage writes or reset.
- Sequence JSON was exported from the C# service. A .NET check verifies every entry's name,
  description and count; JS tests cover 90 days, 162 entries, independent state and shifts.
- Progress summary, selected-day card, responsive navigation, clear schedule tools and
  recovery/backup panels. All four views remain available with HeroUI date/list layouts.
- Stateful dialogs retain safe default focus, queued backup refresh, two-second checks,
  focus/visibility refresh, inline errors, disabled deletion while busy, optional export,
  cancellation and captured recovery IDs for bulk deletion.
- Original generated logo saved with exact prompt and source. Sharp creates verified
  transparent 256px logo, 48px favicon, 180px touch icon, 192/512px app icons and an opaque
  512px maskable variant. Applied to navigation/footer/empty states/README/manifest/HTML.
- A compatibility worker retires the old Blazor shell cache, never IndexedDB. New frontend
  does not claim offline reload support. Root-path hosting is currently required.

## Validation

- npm run build: TypeScript and production Vite build pass. Vite reports a large JS chunk;
  it is about 199 kB gzip, not a build failure. No unused alternative UI library is bundled.
- npm test: sequence/date tests, exact brand dimensions/transparency and valid manifest
  assets pass. Storage-module identity was checked separately.
- Original .NET assertions and exact exported-sequence comparison pass.
- HeroUiFlow.checks.cjs passes against the production preview: existing-journal load,
  Myanmar default/English persistence, real practice save/cancel/keyboard input, all four
  views, 320/390/768/1024/1440px overflow/logo checks, actual JSON exports/imports, final
  selected-copy and bulk deletion, reload and recovery-history restoration.
- HeroUiSafety.checks.cjs passes: original IndexedDB validation/rollback/batch scope checks,
  delayed initial and tab-return checks, disabled destructive/export actions, cancellation
  during checks, export failure/retry, stale/fresh cross-tab warnings, check failure and
  inline practice-save failure with preserved progress.
- Desktop/mobile screenshots reviewed; no browser page errors. Fresh browser contexts and
  synthetic data only; no user journal was changed.

## Limits

Physical phones, Safari and screen readers were not exercised. React Aria's internal
announcements may fall back to English for Myanmar; visible controls and dates are translated.
Browser-native date/file dialogs follow OS locale. Keep the same origin to retain journal
access. Downloads still require the user to save the file. The app is designed for root-path
hosting and requires a reachable app shell for a fresh load; IndexedDB remains local.

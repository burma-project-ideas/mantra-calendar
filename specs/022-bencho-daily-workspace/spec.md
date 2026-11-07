# Bencho-style daily workspace

Date: 2026-11-07

Apply the requested reference's visual language across the active app: white/charcoal
palette, rounded gray stages and white inner surfaces, pill buttons/selects/segmented tabs,
restrained press/hover feedback and clear typography. No paid Bencho code or third-party
branding copied. Existing HeroUI components remain the accessible behavior layer.

Replace the left rail and duplicate breadcrumb bar with compact top navigation. Desktop
links show the selected section; a HeroUI mobile dropdown provides the same destinations.
Selecting a menu item scrolls and focuses its target. Continue practice opens the selected
day directly; an empty journal still offers the new-schedule path. Translate both additions.

Rework calendar, progress summary, selected day, schedule forms, recovery/backup panels,
practice editor, safety dialogs, popovers and states consistently. Keep touch targets,
readable Myanmar leading, reduced-motion handling and safe confirmation action order.
The existing logo remains intact. No storage, schema, sequence, backup or delete logic changes.

Validation:
- TypeScript and production build pass; existing Vite size warning is unchanged in nature.
- Unit/data/logo checks pass.
- English full-flow and original IndexedDB/safety suites pass: actual exports/imports,
  final single/bulk delete, reload, backup recovery, failed writes/exports and tab-return checks.
- English checks now verify Continue practice cancellation preserves data and mobile-menu
  navigation focuses Backups and Calendar.
- Full Myanmar flow runs in a touch-enabled mobile browser context. Continue practice and
  menu selection are tapped; menu navigation focuses the schedule tools. Complete save,
  export/import, recovery and final deletion tests pass.
- Layouts checked from 320 through 1440px, including short landscape confirmations.
  Desktop/mobile screenshots reviewed; no horizontal page overflow or browser page errors.
- All browser data is synthetic in fresh contexts. No user journal was read or modified.

Limits: physical phones, Safari and screen readers were not exercised. Existing root-hosting
and online-shell requirements remain. The design follows the reference throughout the app;
it is not a claim that Bencho is the installed component library or that paid blocks were used.

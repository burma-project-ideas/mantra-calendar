# Design System: Mantra / HeroUI

## 1. Atmosphere and hierarchy

A quiet daily journal: forest green, clean surfaces, restrained typography and actual
practice data. The active application uses React 19 and HeroUI 3. All visible controls,
calendar cells, selectors, tabs, cards, progress, alerts and dialogs are HeroUI components.
Custom CSS controls composition and theme; it does not recreate a separate UI kit.

Desktop has a narrow journal navigation rail, a compact header, a wide progress summary
and an asymmetric calendar/detail grid. The selected-day card invites the next useful
action. Schedule tools, recovery and backups remain discoverable without dominating the
practice calendar. Navigation collapses into labelled icon links on mobile.

## 2. Identity and palette

The mark combines a three-petal lotus with a calendar outline. Use the generated assets
in `public/brand/`; do not substitute a font icon or unrelated lotus illustration.
The transparent master and generation prompt are retained in `docs/brand/`.

- Forest `#315D4A`: HeroUI accent, primary actions, logo and progress.
- Canvas `#F7F9F6`: the page background.
- White `#FFFFFF`: cards, dialogs and menus.
- Ink `#26382E`: primary text.
- Readable sage `#596C59`: secondary text on light surfaces.
- Line `#E3E9E2`: structural borders.
- Soft forest `#F0F5EC`: the progress surface and active practice states.
- Muted red `#A84440`: destructive confirmation and error semantics only.

No decorative gradients, neon, stock images or fake statistics.

## 3. Typography

Self-hosted Geist with Myanmar Text/system Burmese fallbacks. Titles are restrained,
25–34px in English and 23–30px in Myanmar. Burmese text has relaxed line-height and no
negative tracking. Counts use tabular figures. Keep safety explanations at 14px with
comfortable leading. Small dates and badges support the hierarchy rather than replacing
plain labels. Localize visible date names explicitly when platform locale data falls back.

## 4. Components

HeroUI Calendar provides keyboard navigation and selection; each practice cell adds the
real completed/total count. Month is the main working view. Planner, Timeline and Year
show the same schedule grouped for scanning. HeroUI Select handles period, recovery and
language choices. Checkbox handles draft practice selection. Changes commit through the
existing IndexedDB module before completion is shown.

Cards use 14–17px corners, subtle borders and quiet shadows. Buttons have tactile feedback
and 44px targets. Primary actions use forest; destructive confirmation uses HeroUI danger.
Safety dialogs focus Keep, show coverage warnings, disable deletion during checks/exports,
and keep errors inside the open dialog. Initial loading uses HeroUI Skeleton. A short-lived
HeroUI Spinner accompanies checking text. Never hide safety meaning in color alone.

## 5. Responsive composition

Desktop: 224px navigation, fluid workspace, 316px detail column. At intermediate widths,
detail cards wrap below the calendar. Below 768px, every content region becomes a single
column, the navigation becomes a compact header, and calendar progress reduces to readable
counts. At 320px, reserve enough calendar width for seven touchable cells. No horizontal
page overflow. Dialogs scroll within the viewport and their actions wrap on narrow screens.

## 6. Motion and accessibility

Keep HeroUI's focus, press, keyboard and overlay behavior. Use transform/opacity for small
feedback; do not add perpetual decorative movement. Honor prefers-reduced-motion. Preserve
focus across status refreshes. Keep and Escape cancel confirmation without modifying data.
Use real labels, accessible icon names, a skip link and explicit validation text.

## 7. Invariants

Myanmar is the default and English is available. Language selection stays in IndexedDB.
The 90-day, 162-entry sequence, journal keys and version 1/2 backup behavior must remain
compatible. The public storage module is byte-for-byte identical to the archived version.
Never clear IndexedDB to deploy a redesign. Do not add accounts, cloud storage, localStorage
writes, fabricated streaks, forced backups, paid templates or unrelated product features.

# Design System: Mantra daily workspace

## 1. Atmosphere and hierarchy

A quiet daily journal with the visual language of bencho.dev: white space, charcoal type,
soft gray stages, rounded controls and tactile micro-interactions. Show actual practice data. The active application uses React 19 and HeroUI 3. All visible controls,
calendar cells, selectors, tabs, cards, progress, alerts and dialogs are HeroUI components.
Custom CSS controls composition and theme; it does not recreate a separate UI kit.

A compact horizontal navigation replaces the side rail. A direct Continue practice action
opens the selected day's editor. The calendar remains the main working surface; a selected
day and journal tools sit alongside it. On smaller screens, a labelled HeroUI menu jumps to
calendar, schedules, backups and recovery, moving focus to the chosen section.

## 2. Identity and palette

The mark combines a three-petal lotus with a calendar outline. Use the generated assets
in `public/brand/`; do not substitute a font icon or unrelated lotus illustration.
The transparent master and generation prompt are retained in `docs/brand/`.

- Charcoal `#202022`: HeroUI accent, primary actions, selected states and progress.
- White `#FFFFFF`: canvas and inner card surfaces.
- Soft gray `#F1F1F3`: rounded outer stages and navigation pills.
- Track gray `#E7E7EA`: segmented controls and secondary surfaces.
- Muted ink `#66666F`: small readable labels and metadata.
- Line `#E6E6E9`: subtle structure and field outlines.
- Muted red `#B34843`: destructive confirmation and error semantics only.
- The existing forest-green logo is retained as the brand's small identity accent.

Do not copy the reference site's branding, paid component code, promotional blocks or
statistics. Use its visual language throughout this original, functional daily workspace.

## 3. Typography

Self-hosted Geist with Myanmar Text/system Burmese fallbacks. Titles are restrained,
27–38px in English and 24–32px in Myanmar. Burmese text has relaxed line-height and no
negative tracking. Counts use tabular figures. Keep safety explanations at 14px with
comfortable leading. Small dates and badges support the hierarchy rather than replacing
plain labels. Localize visible date names explicitly when platform locale data falls back.

## 4. Components

HeroUI Calendar provides keyboard navigation and selection; each practice cell adds the
real completed/total count. Month is the main working view. Planner, Timeline and Year
show the same schedule grouped for scanning. HeroUI Select handles period, recovery and
language choices. Checkbox handles draft practice selection. Changes commit through the
existing IndexedDB module before completion is shown.

Cards use 28px gray outer stages and 22px white inner surfaces with minimal shadow.
Buttons and segmented tracks use pill shapes, tactile feedback and 44px targets. Charcoal
primary actions carry the hierarchy; destructive confirmation uses HeroUI danger.
Safety dialogs focus Keep, show coverage warnings, disable deletion during checks/exports,
and keep errors inside the open dialog. Initial loading uses HeroUI Skeleton. A short-lived
HeroUI Spinner accompanies checking text. Never hide safety meaning in color alone.

## 5. Responsive composition

Desktop: a centered 1280px workspace under a horizontal header, with a flexible calendar
and 320px detail column. Detail cards wrap below the calendar at intermediate widths.
Navigation becomes a HeroUI dropdown below 1050px. Below 768px, content uses one column;
at 320px the calendar reaches the page edges to preserve seven usable day targets.
No horizontal page overflow. Long dialogs scroll within the viewport, with Keep first in
both DOM and visual order. All maintenance actions remain available through navigation.

## 6. Motion and accessibility

Keep HeroUI's focus, press, keyboard and overlay behavior. Use transform/opacity for small
feedback: a 0.97 press scale, soft hover tints and a spring-like pill response. Do not add
perpetual decorative movement or effects that obscure destructive actions. Honor prefers-reduced-motion. Preserve
focus across status refreshes. Keep and Escape cancel confirmation without modifying data.
Use real labels, accessible icon names, a skip link and explicit validation text.

## 7. Invariants

Myanmar is the default and English is available. Language selection stays in IndexedDB.
The 90-day, 162-entry sequence, journal keys and version 1/2 backup behavior must remain
compatible. The public storage module is byte-for-byte identical to the archived version.
Never clear IndexedDB to deploy a redesign. Do not add accounts, cloud storage, localStorage
writes, fabricated streaks, forced backups, paid templates or unrelated product features.

# Design System: Mantra Practice Calendar

## 1. Visual Theme & Atmosphere
A quiet working journal, rather than a landing page. Balanced density (5/10), asymmetric
layout (6/10), restrained fluid motion (3/10). The calendar is the main working surface;
schedule management and backup controls form a narrow, clearly separated side column.
The first screen should invite recording practice rather than managing files.

## 2. Color Palette & Roles
- Paper (#F8FAF9): neutral canvas, consistent cool undertone.
- Surface (#FFFFFF): calendar and dialog surfaces.
- Charcoal Ink (#202927): headings and body text; never pure black.
- Slate (#61716B): secondary text with readable contrast.
- Mist (#DCE5E0): dividers and input borders.
- Forest (#315D4A): the single accent, selected states and primary actions.
- Forest Wash (#EDF3EF): active-day backgrounds and backup information.
Destructive/error states use charcoal, explicit wording and warning icons rather than
adding a second decorative accent. No purple, neon, gradients or glow shadows.

## 3. Typography Rules
Self-hosted Geist variable sans-serif, 400–700, with Myanmar Text for Burmese glyphs.
Display: clamp(1.75rem, 3.5vw, 2.75rem), tight tracking and 1.15 leading. Body: 14–16px,
1.6 leading, max 65ch. Metadata: 12px minimum; dates and counts use tabular figures.
No Inter or serif type. Preserve the actual Burmese mantra text.

## 4. Component Stylings
Buttons: 44px minimum height, 10px corners, Forest primary, outlined secondary. Dark,
plainly named destructive confirmations. Hover changes tint; active translates 1px.
Surfaces: a single elevated calendar and dialog; sidebar sections use dividing rules,
not a stack of floating cards. Inputs have persistent labels, 44px height and readable
helper/error text. Backup checking uses an inline status stripe with subtle opacity
motion; initial loading uses a skeleton, never an indeterminate circular spinner.
Dialogs keep the safe action first and focused, and remain scrollable at small heights.
Errors stay inline and distinguishable by wording, border and icon, not color alone.

## 5. Layout Principles
Maximum shell width 1440px. Header: compact brand and truthful browser-local storage note.
Intro: left-aligned title with a small inline botanical glyph; actual completion data on
the right. Main grid: flexible calendar plus 320px journal tools, 28px gap. Calendar comes
first in both DOM and visual reading order. Below 768px: strict single column, calendar
then tools; an accessible Manage schedules link jumps to the tools. No overlapping
content, fixed-height page sections, equal three-card rows or horizontal page overflow.
Small-screen calendar toolbar wraps intentionally. All controls retain labels and focus.

## 6. Motion & Interaction
160–220ms transform/opacity transitions with cubic-bezier(.22,1,.36,1), approximating a
restrained spring. Short staggered entrance for the two main regions. Only a busy status
loops; idle calendar cells remain quiet so motion never competes with reading practice.
Reduced-motion disables animation/transition. Every refresh preserves focus and content
dimensions. No animation of layout geometry. No framework or animation dependency.

## 7. Anti-Patterns (Banned)
No emojis, pure black, decorative gradients, neon shadows, serif dashboards, oversized
marketing hero, filler links, stock photos, fictional statistics, unlabelled icons, hidden
destructive controls, custom cursors, floating labels or duplicated card chrome. No changes
to IndexedDB, backup format, mantra sequence or deletion safety for visual convenience.

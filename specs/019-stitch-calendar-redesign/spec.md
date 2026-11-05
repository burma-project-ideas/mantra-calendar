# Calendar-first journal redesign

Apply the user-requested stitch-design-taste skill locally. DESIGN.md defines the palette,
typography, layout, components, motion and forbidden patterns. No Stitch connector was
available, so no claim of Stitch-generated screens is made. Self-hosted variable Geist
comes from vercel/geist-font with its OFL license; no runtime font service is required.

Calendar and progress now lead the page. Desktop places schedule/recovery/backup tools
in a narrow, divided sidebar instead of stacking cards above the calendar. Below 768px,
the calendar precedes tools in a single column. Manage schedules moves focus directly to
the tools. Labels, tap targets, dialog contrast, checking status and initial skeleton are
consistent with the neutral/forest design. Reduced motion suppresses entrance and busy
animations. Storage and backup format are unchanged. Existing safety checks are preserved.

Validation:
- Build: zero warnings/errors.
- ResponsiveUi.checks.cjs: 1440, 1024, 768, 390 and 320px layout fits; local font loads;
  calendar leads mobile; tools link focuses correctly; real mantra label toggles/save,
  new period, period switching with preserved progress and keyboard day entry pass.
- DialogBackup.checks.cjs: checking/queued refresh guards, failure recovery, cancellation,
  real exports, other-tab changes, paused polling and no Blazor errors pass at 320px.
- CompleteDeleteFlow.checks.cjs: final single/bulk delete confirmations, export/import,
  progress preservation, reload and recovery-history restoration pass.
- IndexedDB/file-backup regression script passes validation, rollback, merge and scope checks.
- Desktop/mobile screenshots reviewed. No user journal changed; fresh Edge contexts only.

Limits: physical devices, Safari and screen readers not checked. Native multi-view calendar
layouts may scroll internally, but the page does not overflow horizontally. Downloads still
require users to save the file; no backup/deletion guarantee was added by visual changes.

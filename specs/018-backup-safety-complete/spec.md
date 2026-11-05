# Complete backup safety flow

Scope: finish and verify the existing backup/permanent-delete workflow as a whole,
without adding unrelated options or dependencies.

Completed behavior:
- Export/import v2 JSON includes saved schedules, progress and recovery history.
- Both destructive confirmations provide an optional export and local last-export time.
- Content comparison warns about changed data, missing coverage or check failure.
- Status refreshes on opening, every two seconds, tab visibility and window focus.
- Initial and subsequent checks visibly block export/deletion; export blocks deletion.
- Return events received during a check queue another check, keeping deletion blocked
  until the queued check completes. Export-time requests are checked afterward.
- Keep/Enter/Escape/Close cancel safely; closing during a check/export prevents further
  dialog updates and removes event listeners/timers. Exporting never confirms deletion.
- Failed checks finish with an explicit unknown-coverage warning for user review;
  failed exports preserve data and allow retry. No mandatory backup policy added.

Validation, 2026-11-05:
- Build: zero warnings/errors. Console schedule assertions pass.
- DialogBackup.checks.cjs: delayed initial/return checks, queued return, check failure,
  cancellation while checking, download/failure/retry, full backup content, second-tab
  schedule/progress/history changes and exports, paused polling, preserved focus and
  320px layout pass with no browser page errors.
- Existing permanent-copy, empty-history and ordinary-delete cancellation checks pass.
- IndexedDB and backup UI regression checks pass: batch scope, atomic rollback,
  idempotence, backup recovery, selector/reload, real JSON download, import preview/cancel,
  progress restore, unrelated-data preservation and invalid/oversized file rejection.

Limits: final destructive UI clicks were not automated due to the earlier approval-review
restriction; storage removals were verified in isolated test databases. No user browser
data changed. Physical devices, Safari and screen readers not checked. Download start
is not proof of a saved file. Two-second polling can be throttled in background tabs;
visibility/focus refreshes immediately on return. Changes can occur after any completed
check in a different tab; checks do not lock other tabs or turn export into a required step.

## Full UI flow checked — 2026-11-05

Ran the rebuilt app at http://localhost:5094 in a fresh Edge browser profile using only
synthetic schedules. CompleteDeleteFlow.checks.cjs now verifies actual final UI confirmation
clicks for saved-schedule deletion, selected permanent recovery-copy removal and Empty
recently deleted. Confirmed restore preserves progress, canceled deletion preserves data,
exports inside both dialogs clear stale warnings, final removals survive reload, unrelated
saved progress remains intact, and importing each exported file restores recovery copies.

The visual review caught a cleanup exception absent from pageerror events: watchBackupTab
returned an explicitly wrapped JS object reference while Blazor already wraps the return
value for IJSObjectReference. Returning the plain disposable object fixes listener cleanup.
Rebuilt and restarted the dev server, then reran both full UI and dialog regression suites.
Both pass, including Blazor console errors and visible error-banner assertions, at mobile
widths. Screenshots were reviewed after rerun. Previous final-click test limitation is now
resolved for isolated test data. Physical phones, Safari and screen readers remain untested.

The app is left running; no user browser journal was modified. The new check requires an
externally available playwright-core, installed Edge and the app running at localhost:5094.

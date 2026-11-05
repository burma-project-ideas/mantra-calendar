# Disable permanent deletion during backup checks

Reuse the existing refreshing flag for initial, timer, tab-return and post-export status
checks. Set it before initial rendering, render an accessible checking status/aria-busy,
and guard both the disabled attribute and confirmation click handler. Keep cancellation
available. Export is also disabled while checking to avoid overlapping status results.
Release busy state in finally, including when checks fail; the existing coverage error
warning then remains available for review. No storage, format or dependency changes.

Validation: build passed with zero warnings/errors; console assertions passed.
DialogBackup.checks.cjs passed in isolated Edge at 320px with held IndexedDB transactions:
both dialogs show the indicator and disable final deletion during initial and focus-triggered
checks, then re-enable after completion. Injected metadata-read errors show coverage failure
and release checking state. Existing cross-tab, export/retry and data-preservation checks pass.
Physical phones, Safari, screen readers and final destructive UI clicks not checked.

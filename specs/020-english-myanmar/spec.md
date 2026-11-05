# English / Myanmar interface

Myanmar (mm) is the default regardless of browser language. The header offers မြန်မာ and
English; the chosen code is validated and saved in the existing IndexedDB journal. Startup
reads it before rendering the app and updates the HTML language to my or en. Preference
writes never use localStorage and are excluded from backups and backup fingerprints.

UiLanguage contains shared UI translations and explicit Myanmar month/day names. Every
calendar control, date label, editor action, backup preview, warning, status/error message
and delete confirmation has a Myanmar translation. English is retained as the stable lookup
text. ISO storage values, native date binding and the supplied Burmese mantras stay intact.
Full globalization assets are enabled. Browser-native date/file controls follow OS/browser
locale. Language save failure keeps the previous selection and displays an inline error.

Keyboard testing found that disabling the clicked Export button could lose dialog focus;
after export/failure, focus now returns to the safe Keep action so Escape works reliably.

Validation:
- Build passed with zero warnings/errors; dev server restarted for full ICU asset manifest.
- Language.checks.cjs passes: mm default, HTML lang, translated month header, EN/MM switch
  and reload persistence, editor and both backup dialogs, real exports/localized timestamps,
  safe Escape after export, invalid preference rejection, simulated preference-write failure,
  no localStorage writes, journal preservation and 320/390/768/1440px overflow checks.
- Existing English dialog, full final-delete/restore, responsive and .NET checks pass after
  selecting English explicitly. All status/error lookup keys checked for Myanmar coverage.
- No account, schema upgrade, backup format or third-party localization package added.

Limits: physical devices, Safari and screen readers were not tested. The language preference
is local to the browser/origin and is not transferred by a journal backup. No user data was
changed during testing; tests use new browser contexts with synthetic schedules.

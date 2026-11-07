<p><img src="public/brand/logo.png" alt="Mantra lotus calendar logo" width="72" height="72" /></p>

# Mantra Practice Calendar — နေ့စဉ် ဂုဏ်တော်ရွတ်ဖတ်မှု မှတ်တမ်း

နေ့စဉ် ဂုဏ်တော်ရွတ်ဖတ်မှုကို ပြက္ခဒိန်ပေါ်မှာ မှတ်သားပြီး မိမိလေ့ကျင့်မှုကို ပြန်ကြည့်နိုင်ဖို့ ရေးထားတဲ့ Web App ဖြစ်ပါတယ်။ စတင်မယ့်ရက်ကို ကိုယ်တိုင်ရွေးချယ်ပြီး ရက် ၉၀ အတွက် သတ်မှတ်ထားတဲ့ ဂုဏ်တော်အစီအစဉ်အတိုင်း အသုံးပြုနိုင်ပါတယ်။

React၊ TypeScript နဲ့ HeroUI ကို အသုံးပြုထားပြီး ပြက္ခဒိန် UI၊ နေ့စဉ်မှတ်တမ်း၊ IndexedDB နဲ့ browser ထဲမှာ data သိမ်းဆည်းခြင်း၊ JSON backup နဲ့ data ပြန်ယူခြင်းတို့ကို လေ့လာနိုင်တဲ့ project တစ်ခုလည်း ဖြစ်ပါတယ်။

## Summary

> စတင်မယ့်ရက်ကို ရွေးပါ။ ပြက္ခဒိန်ထဲက နေ့တစ်နေ့ကို နှိပ်ပြီး ရွတ်ဖတ်ပြီးတဲ့ ဂုဏ်တော်တွေကို အမှန်ခြစ်ပါ။ **Save practice** နှိပ်လိုက်ရင် မှတ်တမ်းကို ဒီ browser ထဲမှာ သိမ်းထားပေးပါမယ်။

1. **Practice start date** မှာ စတင်မယ့်ရက်ကို ရွေးပြီး **Use schedule** နှိပ်ပါ။
2. ပြက္ခဒိန်ထဲက ရက်တစ်ရက်ကို နှိပ်ပြီး မိမိရွတ်ဖတ်ပြီးတဲ့ ဂုဏ်တော်တွေကို မှတ်သားပါ။
3. **Save practice** နှိပ်ပြီး သိမ်းပါ။ **Cancel** နှိပ်ရင် အခုဖွင့်ထားတဲ့ ပြင်ဆင်မှုတွေကို မသိမ်းပါ။
4. **Saved schedules** ကနေ အရင်သိမ်းထားတဲ့ အစီအစဉ်တွေကို ပြန်ဖွင့်နိုင်ပါတယ်။
5. **Export backup** နဲ့ JSON ဖိုင်ထုတ်သိမ်းထားပြီး နောက်မှ **Import a backup** နဲ့ ပြန်ယူနိုင်ပါတယ်။

နေ့စဉ် အသုံးပြုရာတွင် **Continue practice** ကနေ ရွေးထားသော နေ့ရက်၏ ရွတ်ဖတ်မှုကို တိုက်ရိုက် မှတ်သားနိုင်ပါသည်။

## ဘာသာစကား ရွေးချယ်မှု

ပုံမှန်အားဖြင့် **မြန်မာ (MM)** ဘာသာဖြင့် ဖွင့်ပေးပါသည်။ စာမျက်နှာအပေါ်ရှိ ဘာသာစကားရွေးချယ်မှုမှ **English (EN)** သို့ ပြောင်းနိုင်ပြီး ရွေးချယ်မှုကို IndexedDB တွင် သိမ်းထားသောကြောင့် နောက်တစ်ကြိမ် ပြန်ဖွင့်လည်း ဆက်အသုံးပြုနိုင်ပါသည်။ ဘာသာစကားပြောင်းခြင်းက အစီအစဉ်နှင့် ရွတ်ဖတ်မှုမှတ်တမ်းများကို မပြောင်းလဲပါ။

Calendar controls, month/day names, the practice editor, backup messages and deletion confirmations support both languages. The English control names used below are available by selecting **English** in the header. Browser-native date/file picker text follows your browser or operating system language.

## Preview

![Desktop calendar with daily progress and schedule tools](docs/images/calendar-desktop.png)

Desktop မှာ ပြက္ခဒိန်နဲ့ မှတ်တမ်းစီမံခန့်ခွဲတဲ့ controls တွေကို ဘေးချင်းယှဉ် ပြထားပါတယ်။ Mobile မှာ ပြက္ခဒိန်ကို အရင်ပြပြီး controls တွေကို အောက်မှာ ပြထားပါတယ်။ Desktop navigation သို့မဟုတ် mobile menu မှ **Saved schedules**၊ **Backups** နှင့် **Recovery history** ဆီ တိုက်ရိုက်သွားနိုင်ပါတယ်။

## Features

- စတင်ရက်ကို ရွေးချယ်နိုင်တဲ့ ရက် ၉၀ ဂုဏ်တော်အစီအစဉ်။
- နေ့စဉ် ရွတ်ဖတ်ပြီးမှုနဲ့ အစီအစဉ်တစ်ခုလုံးရဲ့ တိုးတက်မှုကို ကြည့်နိုင်ခြင်း။
- Month, Planner, Timeline နဲ့ Year ပြက္ခဒိန် view များ။
- အစီအစဉ်တစ်ခုချင်းစီရဲ့ မှတ်တမ်းကို သီးခြားသိမ်းထားပြီး ပြန်ရွေးနိုင်ခြင်း။
- IndexedDB ထဲမှာ သိမ်းထားတဲ့အတွက် page reload လုပ်ပြီးလည်း မှတ်တမ်းကျန်ရှိခြင်း။
- အစီအစဉ်၊ ရွတ်ဖတ်မှုမှတ်တမ်းနဲ့ Recently deleted recovery copies တွေကို JSON backup ထုတ်သိမ်းခြင်း၊ ပြန်ယူခြင်း။
- ဖျက်ထားတဲ့ အစီအစဉ်တွေကို **Recently deleted schedules** ကနေ ပြန်ယူနိုင်ခြင်း။
- Recovery copy တစ်ခုချင်းစီ အပြီးဖျက်ခြင်းနဲ့ Recently deleted အားလုံးရှင်းခြင်းမတိုင်မီ confirmation ပြခြင်း။
- Backup ထုတ်ခဲ့တဲ့အချိန်နဲ့ နောက်ပိုင်း data ပြောင်းလဲမှု ရှိမရှိကို permanent-delete dialog ထဲမှာ ပြခြင်း။
- Mobile layout၊ keyboard navigation နဲ့ reduced-motion setting ကို ပံ့ပိုးထားခြင်း။

The supplied sequence covers **90 days and 162 individual mantra entries**. Its original template runs from **9 July to 6 October 2025**; choosing another start date shifts the same sequence to that period.

## Tech Stack

| Part | Technology |
| --- | --- |
| Language | TypeScript / JavaScript |
| Application | React 19, Vite |
| UI components | HeroUI 3 throughout the active interface |
| Browser storage | Native IndexedDB |
| Backup files | JSON |
| Styling | HeroUI theme tokens, Tailwind CSS 4, self-hosted Geist |
| Checks | Node assertions, Playwright/Edge, optional original C# sequence checks |

No backend server or account is required for saving practice data. The development server serves the application; journal data is stored in the browser.

## Getting Started

### Requirements

- Node.js 22.12 or newer (tested with Node.js 24).
- A modern browser with IndexedDB enabled.
- Git to clone the repository.

### Run locally

Clone this repository, open its root directory, then run:

```sh
npm ci
npm run dev
```

Open [http://localhost:5094](http://localhost:5094).

A fresh journal starts with the device's current date. To use a different period, choose a start date and select **Use schedule**. Existing periods retain their progress when you switch.

### Production build

```sh
npm run build
npm run preview
```

The production build is written to **dist/**. Serve that directory at the site root. **npm run preview** serves the built app at the same local address; stop the development server before starting preview.

The active interface uses real HeroUI Calendar, Select, Tabs, Modal, Checkbox, ProgressBar, Card, Alert and Button components. The white/charcoal design uses soft gray rounded surfaces, pill controls and restrained press feedback. HeroUI continues to provide the accessible component behavior.

### Existing journals

Keep the same browser profile and site address, including the port, to keep using an existing journal. The IndexedDB module, database name and backup format are unchanged. **Do not clear site data to update the UI.** The old Blazor interface and its historical UI tests are retained under **legacy/** as reference; the active app runs with npm.

The production frontend does not promise offline reloads. A compatibility service worker retires the old Blazor shell cache without touching IndexedDB.

## Backup & Restore

### Export a backup

**Export backup** downloads a file named **mantra-backup.json** containing:

- All saved schedules and their practice progress.
- The currently selected schedule.
- All recently deleted recovery copies.

Save the downloaded file somewhere you can find again. Backup files contain readable practice history; keep them somewhere appropriate for that information.

### Restore a backup

1. Under **Import a backup**, choose a JSON file of **5 MiB or less**.
2. Review the schedule, replacement and recovery-copy counts.
3. Select **Restore backup**, or **Cancel** to leave everything unchanged.

For matching start dates, imported progress replaces the stored progress. Schedules absent from the file remain saved. Recovery copies merge by unique ID; existing copies are kept, and importing the same file again does not duplicate them.

New exports use backup **version 2**. Older **version 1** files remain importable and do not remove existing recovery history. Invalid files and failed restore transactions leave the journal unchanged.

## Delete & Recover

| Action | Result |
| --- | --- |
| **Delete selected schedule** | Moves that schedule and its progress into Recently deleted after confirmation. |
| **Restore selected schedule** | Returns the selected recovery copy to saved schedules and opens it. |
| **Permanently delete selected copy** | Removes only the selected recovery copy after confirmation. |
| **Empty recently deleted** | Removes the recovery copies listed when confirmation opened; saved schedules remain. |

Recovery copies remain available after reload and have no automatic expiry. Repeated deletions create separate copies, even for the same start date. Restoring a copy does not overwrite an existing saved schedule with the same start date.

Both permanent-delete dialogs let you export a backup before confirming. They show the last export time and warn if schedules, progress or recovery history differ from that backup. Status refreshes while the dialog is open and when you return to the tab. Permanent deletion is disabled while a status check or export is running; **Keep**, **Escape** and **Close** remain available.

If a status check fails, a coverage warning is shown before the delete button becomes available again. Exporting is optional: a warning does not prevent you from confirming permanent deletion.

**A download-start time does not prove the file was saved.** Once recovery history is permanently removed, restoring it requires a backup that contains those copies. Status checks do not lock other tabs, so data can change after a check finishes.

## Data & Privacy

Practice data stays in the current browser profile and site address. There are no accounts or cloud synchronization. Using another browser, device or site address creates a separate journal.

- Clearing site data or removing the browser profile can erase schedules and recovery history.
- Export a backup before clearing data or moving to another device.
- Simultaneous edits to the same schedule in different tabs use the last committed full-schedule save.
- Normal storage uses IndexedDB; there is no localStorage fallback.
- On first initialization only, progress from the older localStorage version can be imported into its original July 2025 schedule. That legacy value is not changed or deleted.

## Project Structure

```text
src/
├── App.tsx                     # HeroUI calendar and journal workspace
├── PracticeDialog.tsx          # Daily mantra recording
├── ConfirmDialog.tsx           # Delete confirmation and live backup checks
├── data/                       # Original mantra sequence and Myanmar translations
├── schedule.mjs                # Date shifting and independent daily progress
└── styles.css                  # HeroUI theme and responsive layout
public/
├── brand/                      # Logo, favicon, touch and app icons
├── fonts/                      # Self-hosted Geist and its license
└── js/practice-db.js            # Preserved IndexedDB and backup implementation
docs/brand/                     # Generated logo master, prompt and reproduction notes
scripts/brand.mjs               # Reproducible logo sizes
tests/                          # Schedule, branding, storage and browser checks
legacy/                         # Previous Blazor interface, retained for reference
specs/                          # Feature specifications and validation records
DESIGN.md                       # UI design guidelines
```

## Testing

Run the schedule and brand-asset assertions:

```sh
npm test
```

For full browser checks, install Microsoft Edge and keep the app running at **http://localhost:5094**. Playwright is included in the development dependencies:

```sh
npm run test:browser
```

These checks use fresh browser contexts and synthetic schedules. They cover existing-journal compatibility, default Myanmar and EN persistence, keyboard practice entry, 320–1440px layouts, backup files, final single/bulk deletion, recovery after reload, delayed checks, failed exports, failed saves and cross-tab warnings. They do not use your existing browser journal. Screenshots are written to the Git-ignored **outputs/** directory.

The original IndexedDB assertions remain in **tests/IndexedDb.checks.js** and run as part of the browser suite. They refuse to run against an existing journal.

Optional original sequence comparison, requiring .NET 8 or newer:

```sh
dotnet run --project tests/MantraCalendar.Checks
```

This verifies every exported mantra name, description and repetition count against the original C# sequence retained in **legacy/**.

Feature details and validation records are in [specs/](specs/). The interface rules are in [DESIGN.md](DESIGN.md).

## Logo & Identity

The lotus/calendar logo is used in the navigation, footer, empty states, browser favicon, Apple touch icon, app manifest and this README. The generated master, final prompt and asset roles are documented in [docs/brand/](docs/brand/README.md).

Regenerate the icon sizes with:

```sh
npm run brand
```

## Contributing

Bug reports, documentation improvements and pull requests are welcome. Include reproduction steps for bugs, and run the checks relevant to your change. Changes to persistence, backup or deletion behavior should include checks that existing progress remains recoverable.

The bundled Geist font includes its [SIL Open Font License](public/fonts/OFL.txt).

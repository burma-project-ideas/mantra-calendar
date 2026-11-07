# Previous Blazor interface

The active application is the React/HeroUI interface in the repository root. Use `npm ci`
and `npm run dev` there. These files are retained as a reference for the original C# mantra
sequence and previous UI implementation; they are not imported by the React app.

The original package-free .NET checks still reference the schedule service here.
`legacy/tests/` contains historical UI scripts for the former Radzen interface; use the
root `tests/HeroUiFlow.checks.cjs` and `tests/HeroUiSafety.checks.cjs` for the active app.

The public IndexedDB module is preserved byte-for-byte from this version. Its database
name, object store, schedule keys, language preference and backup format are unchanged.

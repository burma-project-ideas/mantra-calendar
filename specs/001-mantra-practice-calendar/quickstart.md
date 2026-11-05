# Quickstart
Prerequisite: .NET 8 SDK and a modern browser.

```powershell
dotnet run --project BlazorWasm.MantraCalendarApp --launch-profile http
dotnet run --project tests/MantraCalendar.Checks
```
Open http://localhost:5094. Expect July 2025 and the July 9-October 6 practice period.
Open July 9, toggle a mantra, Cancel: no progress changes.
Repeat and Save: count increases by one; July 10 remains pending.
Reload: the saved July 9 completion remains. Toggle it off and Save to undo.
Inspect October 6 for final date inclusion and October 7 for no appointment.
In isolated browser storage, put invalid text in mantraProgress and reload: expect an error,
no crash, no overwrite, and edits disabled until storage is corrected and the page reloaded.
Do not replace a user's saved browser data for testing; back it up or use an isolated context.
See contracts/ui-and-storage.md for the durable storage contract.

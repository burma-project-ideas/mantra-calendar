# UI and Storage Contract
- Route / displays Mantra Practice Calendar, supplied period and completed/total count.
- Radzen month and yearly views remain available, initially at July 9, 2025.
- Selecting a scheduled day opens a labeled list of mantra completion controls.
- Save persists all progress before changing displayed state. Cancel/close discards the draft.
- Blank dates cannot create appointments. Pending/completed status is conveyed with text.
- mantraProgress remains a JSON array of Date, MantraName, IsPracticed records.
- Existing PascalCase fields are written using the installed library defaults; camelCase input is also accepted.
- Loading invalid JSON/schema shows a storage error and blocks editing until reload.
- Failed saves show a storage error, keep live state unchanged and block editing until reload.
- No remote API, accounts or synchronization is introduced.


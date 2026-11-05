# Plan
Reuse Blazor and Radzen. Update MainLayout and its CSS for the shell; Home markup and isolated
CSS for hierarchy/progress/calendar styling; EditMantraPopup markup and isolated CSS for touch
rows; app.css for shared color tokens, Radzen theming, dialog sizing and focus treatment.
Use system fonts with Myanmar Text fallback. No packages, schedule or persistence changes.
Validate via existing regression runner and build, then isolated desktop/phone browser checks.

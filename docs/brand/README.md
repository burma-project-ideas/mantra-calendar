# Mantra identity

The logo combines a lotus with a calendar: daily practice within a simple, recognizable
frame. Forest green matches the application's HeroUI accent; sage is a supporting detail.

## Files

- `logo-source.png`: generated transparent master, retained without overwriting the original.
- `../../public/brand/logo.png`: optimized 256px transparent mark, used in navigation,
  footer, empty states and the repository README.
- `../../public/brand/favicon.png`: 48px browser icon.
- `../../public/brand/apple-touch-icon.png`: 180px Apple touch icon.
- `../../public/brand/icon-192.png` and `icon-512.png`: standard app icons.
- `../../public/brand/maskable-512.png`: opaque icon with a safe inset for adaptive masks.

Run `npm run brand` to reproduce the sizes from the master. The app manifest and HTML
reference these assets; legacy icon files are also updated for consistency.

## Generation

Generated with the built-in imagegen tool; not the CLI fallback. Variants were resized and
padded with Sharp. No external brand or stock-logo asset was used.

Final prompt:

> Create one production logo icon for a quiet Buddhist mantra practice calendar application.
> Brand mark only, no letters, no words, no presentation sheet, no mockup. A geometric
> three-petal lotus formed within a soft square calendar outline, two subtle calendar
> binding strokes at top; clear bold simple silhouette readable at 24px. Flat vector-like
> precision, confident balanced symmetry, forest green #315D4A and a small restrained sage
> #B5CABB highlight, no gradients, no shadows, no religious deity illustration, no thin
> hairlines. Icon centered occupying 82% of square canvas. Genuine transparent background.
> This will be used as header logo, favicon, installed application icon and README branding.

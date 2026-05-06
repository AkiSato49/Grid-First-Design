# Aeonik Font Files

Aeonik is a commercial typeface by [Cantine Type](https://cantine.type/).
You must license it before using it in a project.

→ https://www.cantinetypefoundry.com/products/aeonik

## Required files

Place the following WOFF/WOFF2 files in this directory:

| File | Weight | Style |
|------|--------|-------|
| `Aeonik-Light.woff2` + `.woff` | 300 | Normal |
| `Aeonik-LightItalic.woff2` + `.woff` | 300 | Italic |
| `Aeonik-Regular.woff2` + `.woff` | 400 | Normal |
| `Aeonik-RegularItalic.woff2` + `.woff` | 400 | Italic |
| `Aeonik-Medium.woff2` + `.woff` | 500 | Normal |
| `Aeonik-Bold.woff2` + `.woff` | 700 | Normal |

## Fallback

Until the fonts are placed here the design will fall back to:
```
'Helvetica Neue', Arial, sans-serif
```
which preserves layout integrity while you obtain the license.

## @font-face declarations

All declarations live in `src/app.css`. No extra setup needed once
the files are in this folder.

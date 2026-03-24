# Triptych Block

## Overview

`triptych` renders an editorial composition with a large oval copy panel, decorative cartography, and three floating media cards with captions.

The desktop layout stays close to the inspiration, while mobile simplifies the floating cards into a stacked sequence below the oval.

## DA.live Block Table

### Copy-paste

1. Open [`triptych-table.txt`](triptych-table.txt)
2. Select all and copy it
3. In DA.live or Google Docs, create a 1-column table or paste into the first cell so tabs/newlines become rows
4. Make sure the first row contains only `triptych`

The starter table intentionally uses text placeholders for the media rows. Replace those rows with real images in DA.live.

## Authoring Model

Author using a **1-column** table named `triptych` with 13 rows after the block name.

| Row | Field | Expected Value |
|---|---|---|
| 1 | `line1` | Oval copy line |
| 2 | `line2` | Oval copy line |
| 3 | `line3` | Oval copy line |
| 4 | `line4` | Oval copy line |
| 5 | `line5` | Oval copy line |
| 6 | `line6` | Oval copy line |
| 7 | `line7` | Oval copy line |
| 8 | `media1` | Image |
| 9 | `caption1` | Caption text |
| 10 | `media2` | Image |
| 11 | `caption2` | Caption text |
| 12 | `media3` | Image |
| 13 | `caption3` | Caption text |

### Notes

- Empty copy rows are skipped at render time.
- If every copy row is empty, the block falls back to the default sample text.
- Missing images render a styled placeholder instead of breaking the layout.

## Section Metadata

Place section metadata immediately above the block when you want to override the defaults.

| Key | Values | Default | Effect |
|---|---|---|---|
| `triptych-tone` | `sage`, `stone` | `sage` | Changes the palette |
| `triptych-motion` | `on`, `off` | `on` | Enables or disables reveal/parallax motion |

## Behavior

- Decorative cartography is rendered as inline SVG inside the block.
- Reveal motion uses `IntersectionObserver` when available.
- Parallax uses `requestAnimationFrame` throttling and only runs on desktop when motion is enabled.
- `prefers-reduced-motion: reduce` disables motion-heavy behavior automatically.

## Accessibility

- Decorative layers are `aria-hidden`.
- Captions remain text content in normal document flow on mobile.
- Reduced-motion users get a fully visible static layout.

## Registration

Add the block path to `models/_component-definition.json`, then run:

```bash
npm run build:json
```

## Files

```text
blocks/triptych/
├── triptych.js
├── triptych.css
├── _triptych.json
├── triptych-table.txt
└── README.md
```

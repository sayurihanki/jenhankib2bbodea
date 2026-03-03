# How It Works + Stats Block

## Overview

The `how-it-works-stats` block renders a 4-step process section followed by a
4-metric stats band, matching the enterprise dashboard information style.

## DA.live Authoring Model

Author with a one-column table named `how-it-works-stats` and 10 rows.

| Row | Field | Expected Value |
|---|---|---|
| 0 | Section Tag | Example: `How It Works` |
| 1 | Title | Rich text (supports line breaks) |
| 2 | Step 1 | `icon | title | description` or `01 | icon | title | description` |
| 3 | Step 2 | `icon | title | description` or `02 | icon | title | description` |
| 4 | Step 3 | `icon | title | description` or `03 | icon | title | description` |
| 5 | Step 4 | `icon | title | description` or `04 | icon | title | description` |
| 6 | Stat 1 | `value | label` |
| 7 | Stat 2 | `value | label` |
| 8 | Stat 3 | `value | label` |
| 9 | Stat 4 | `value | label` |

## Example Content

- Step row: `🏢 | Set Up Your Account | Create your company profile...`
- Step row: `🔍 | Browse & Quote | Search 40,000+ enterprise-grade products...`
- Stat row: `40K+ | Products in catalog`
- Stat row: `99.9% | Platform uptime SLA`

## Behavior

- Step numbers (`01` to `04`) are generated automatically.
- Step and stat values are parsed from pipe-delimited text.
- The stat value supports suffix highlighting (for example `K+`, `B`, `%`).
- Mobile layout collapses the 4-column grids into single-column stacks.
- Title supports real rich-text line breaks and typed `<br>` text.

## Dependencies

None.

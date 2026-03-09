# Live Block Premium

## Overview

`live-block-premium` is a standalone premium dashboard block with a distinct visual language while keeping the same commerce data contract as `live-block`.

It is account-scoped and storefront-safe:

1. Guests only see a sign-in CTA.
2. Authenticated users get live account/B2B metrics and charts.
3. Source-level failures are isolated so one API issue does not blank the full block.

## Configuration

`live-block-premium` keeps all `live-block` keys for portability and adds optional premium visual settings.

| Key | Type | Default | Description |
|---|---|---|---|
| `title` | string | `Live Commerce Dashboard` | Dashboard heading |
| `guest-cta-label` | string | `Sign in` | Guest CTA label |
| `guest-cta-href` | string | `/customer/login` | Guest CTA href |
| `rows-limit` | number | `3` | Activity rows per panel (`1..5`) |
| `show-sparkline` | boolean | `true` | Shows header sparkline when data exists |
| `order-window-days` | number | `90` | Order KPI window (`30..365`) |
| `trend-points` | number | `12` | Max trend points (`6..24`) |
| `show-finance-section` | boolean | `true` | Enable finance section |
| `show-operations-section` | boolean | `true` | Enable operations section |
| `show-sourcing-section` | boolean | `true` | Enable sourcing section |
| `show-charts` | boolean | `true` | Enable chart section |
| `show-last-updated` | boolean | `true` | Show last updated text |
| `refresh-label` | string | `Refresh data` | Refresh button text |
| `premium-accent` | string | `emerald` | Accent palette (`emerald`, `cyan`, `gold`) |
| `premium-surface` | string | `glass` | Surface style (`glass`, `solid`) |
| `premium-motion` | boolean | `true` | Enable premium reveal motion |

## Data Scope and Behavior

Data scope matches `live-block` exactly:

1. Same API sources and auth gating.
2. Same KPI and chart value mapping contract.
3. Same refresh behavior (`authenticated`, `purchase-order/refresh`, manual refresh, and sourcing events when enabled).
4. No polling and no backend/admin API usage.

This block is opt-in and does not replace existing `live-block` instances.

# Live Block

## Overview

`live-block` renders a portable, authenticated dashboard card backed by Adobe Commerce account-level data.
It combines customer orders, purchase orders, and company credit into a mixed KPI view.

## Configuration

Configured as a key-value block.

| Key | Type | Default | Description |
|---|---|---|---|
| `title` | string | `Live Commerce Dashboard` | Card heading text |
| `guest-cta-label` | string | `Sign in` | CTA label for guest mode |
| `guest-cta-href` | string | `/customer/login` | CTA href for guest mode |
| `rows-limit` | number | `3` | Max recent PO rows (`1..5`) |
| `show-sparkline` | boolean | `true` | Shows sparkline when order totals are available |

## Data Sources

When authenticated, the block initializes and requests:

1. `getOrderHistoryList(20, 'viewAll', 1)` from `@dropins/storefront-account/api.js`
2. `getCompanyCredit()` from `@dropins/storefront-company-management/api.js`
3. `getPurchaseOrders({}, 20, 1)` from `@dropins/storefront-purchase-order/api.js`
4. `getPurchaseOrders({ myApprovals: true }, 20, 1)` from `@dropins/storefront-purchase-order/api.js`
5. `getPurchaseOrders({ companyPurchaseOrders: true }, rowsLimit, 1)` from `@dropins/storefront-purchase-order/api.js`

Each request is independently guarded so partial failures do not blank the block.

## Behavior

1. **Guest mode**: No private commerce requests are made. A sign-in CTA is shown.
2. **Authenticated mode**: Live metrics are shown for credit, orders, and pending approvals.
3. **B2B unavailable**: B2B-derived values show `Not available` while order metrics remain.
4. **No activity data**: Shows `No recent commerce activity`.
5. **Refresh hooks**: Re-fetches on `authenticated` and `purchase-order/refresh` events.

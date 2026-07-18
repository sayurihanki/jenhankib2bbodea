# Razer Minipage Block 3

## Overview

`razer-minipage-block3` is a compact, purchase-first product detail block. It
keeps the Bodea page header and footer, uses three product images, and avoids
the long internal navigation and editorial story used by Block 2. Block 3 is
independent: authoring or publishing it does not change
`razer-minipage-block2`.

Its block-scoped presentation follows Razer's storefront language: a black
showroom canvas, cinematic gallery with a thumbnail rail, condensed product
hierarchy, green price and purchase action, native option cards, and a compact
three-item highlight band. Motion is limited to a short first-paint entrance
and restrained control transitions; reduced-motion preferences disable both.

The parent uses filtered child rows. Authors insert one **Razer Minipage Block
3** and add typed rows inside it. DA.live serializes the child components as
ordinary rows of the parent block.

## Row contract

Block 3 keeps Block 2's field names and field order for all 13 row types:

| Type | Fields after `type` |
| --- | --- |
| `setting` | `key`, `value` |
| `brand` | image and alt, `width`, `height` |
| `product` | `sku`, `color`, `title`, `subtitle`, `price`, `original-price`, `discount`, `url`, `pickup` |
| `gallery-image` | `key`, `enabled`, image and alt, `width`, `height` |
| `option-group` | `key`, `enabled`, `label` |
| `option` | `group-key`, `key`, `enabled`, `label`, `price`, `selected` |
| `delivery` | `key`, `enabled`, `label`, `value` |
| `trust` | `key`, `enabled`, `text` |
| `highlight` | `key`, `enabled`, `text` |
| `feature` | `key`, `enabled`, `side`, `eyebrow`, `title`, `subtitle`, `body`, `bullets`, `details`, `note`, `link` |
| `feature-media` | `feature-key`, `key`, `enabled`, image and alt, `width`, `height` |
| `specification` | `key`, `enabled`, `label`, `value` |
| `related-product` | `key`, `enabled`, image and alt, `title`, `price`, `original-price`, `discount`, `url`, `cta-label` |

The `brand` type remains accepted for Block 2 compatibility, although the
compact default has no block-owned product navigation or footer and does not
need a brand row.

The first field in every child model is a generated one-option `type`
selector. Keep it unchanged. Image alt text is stored in the same DA image cell
as its image; width and height are positive intrinsic pixel dimensions.

## Settings

Block 3 exposes only settings that affect the compact experience:

| Key | Default | Purpose |
| --- | --- | --- |
| `content-mode` | `merge` | Selects `merge` or `replace` behavior for authored collections |
| `show-options` | `true` | Shows native option radios |
| `show-delivery` | `true` | Shows delivery choices and pickup copy |
| `show-trust` | `true` | Shows purchase-assurance items |
| `show-highlights` | `true` | Shows the three concise highlights |
| `show-features` | `false` | Shows optional feature panels |
| `show-specifications` | `false` | Shows optional specs in native `<details>` |
| `show-related-products` | `true` | Shows related-product cards |
| `sticky-purchase` | `true` | Enables the mobile sticky purchase strip |
| `ui-buy-label` | `Buy now` | Purchase-link label |
| `ui-delivery-heading` | `Delivery` | Delivery heading |
| `ui-pickup-heading` | `Pickup` | Pickup heading |
| `ui-specifications-heading` | `Technical specifications` | Specifications summary |
| `ui-related-heading` | `Complete your setup` | Related-product heading |
| `token-accent` | `#44d62c` | Validated scoped accent color |

Unknown Block 2 settings are ignored safely. Required accessibility labels
remain internal and do not need setting rows. Boolean settings accept `true`
or `false`; invalid values retain their defaults. `token-accent` accepts a
safe CSS color and rejects declarations, URLs, and other unsafe values.

## Merge, replace, and clearing

`merge` is the default. A row whose stable key matches a preset item overrides
that item, a new key adds an item, and `enabled=false` removes a matched item.
Blank cells retain preset values. Use the exact literal `__empty__` to clear an
optional text value such as a subtitle, price adjustment, original price,
discount, note, or link.

In `replace` mode, authored rows replace only the collection they target. A
collection with no authored rows keeps its preset. Authored option groups
replace the group collection; authored options replace options within their
matching group. Authored feature media replaces media within its matching
feature.

Use stable, zero-padded keys:

- `gallery-01`, `group-01`, `option-01`, `delivery-01`
- `trust-01`, `highlight-01`, `feature-01`, `media-01`
- `spec-01`, `related-01`

An option's `group-key` must match an option-group key. A feature-media row's
`feature-key` must match a feature key. Rows render in stable-key order, not
DA.live editing order. If no enabled option is selected, Block 3 selects the
first enabled option; when several are selected, the first selected option
wins.

## Performance limits

Limits are applied after stable-key sorting:

| Collection | Maximum |
| --- | ---: |
| Gallery images | 3 |
| Option groups | 3 |
| Options per group | 4 |
| Delivery items | 2 |
| Trust items | 3 |
| Highlights | 3 |
| Feature panels | 2 |
| Images per feature | 1 |
| Specifications | 8 |
| Related products | 3 |

Only the active gallery image is created as a full image request. The first
image is eager and high priority; authored alternate images are materialized
only after gallery selection. Related-product and optional feature images are
lazy. Keep meaningful alt text and accurate dimensions on every image.

Product and related-product URLs accept safe HTTP(S), site-relative,
document-relative, or hash URLs. Unsafe and protocol-relative URLs are
rejected. Option selection is presentational: it does not change price, SKU,
gallery content, or the Bodea cart.

## Default handoff

`razer-minipage-block3-da-live.html` is the complete compact starting page. It
contains only:

- one Block 3 with the concise setting rows;
- one product;
- three gallery images;
- three option groups containing four, three, and two options;
- two generic delivery choices, three trust items, and three highlights;
- three related products; and
- a native Metadata sibling with Title, Description, and Image.

The default has no feature or specification rows. Paste the full HTML into a
blank DA.live document and publish it at `/razer-minipage-block3`.
`razer-minipage-block3-table.txt` is a smaller merge-mode starter for sparse
edits.

The default gallery and related-product image cells are intentionally blank:
their stable keys reuse the optimized preset media from Block 3 JavaScript.
This keeps alternate full-resolution gallery assets out of the initial DA
payload. Add a DA image reference only when replacing a preset image.

The default metadata is:

| Metadata | Value |
| --- | --- |
| Title | Razer Basilisk V3 Pro 35K |
| Description | Fully Customizable Wireless Ergonomic RGB Gaming Mouse |
| Image | `https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h5a/h1c/9821720576030/basilisk-v3-pro-35k-500x500.png` |

Update all three metadata fields when changing products. The handoff contains
no visible instructions, feature rows, specification rows, or Template
metadata.

## Files and verification

```text
blocks/razer-minipage-block3/
├── _razer-minipage-block3.json
├── generate-authoring.mjs
├── razer-minipage-block3-da-live.html
├── razer-minipage-block3-table.txt
├── razer-minipage-block3.css
├── razer-minipage-block3.js
└── README.md
```

Regenerate and validate authoring artifacts with:

```sh
node blocks/razer-minipage-block3/generate-authoring.mjs
node -e "JSON.parse(require('node:fs').readFileSync('blocks/razer-minipage-block3/_razer-minipage-block3.json'))"
```

The local integration page is `/razer-minipage-block3-demo.html`. Run the
repository's Razer tests, ESLint, Stylelint, and `npm run build:json` before
publishing.

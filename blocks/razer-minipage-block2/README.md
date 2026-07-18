# Razer Minipage Block 2

## Overview

`razer-minipage-block2` is the fully authorable version of the Razer product
minipage. It uses the same visual system and interactions as
`razer-minipage`, but its product copy, images, links, UI labels, accessibility
copy, section inventory, and principal theme tokens can all be edited in
DA.live.

The block uses a filtered child-row architecture instead of a single
300-field form. Authors insert one **Razer Minipage Block 2** parent and then
add typed rows inside it. DA.live serializes those child components as ordinary
rows in the one parent block; they are not nested EDS blocks at runtime.

The parent filter permits these row types:

```text
setting
brand
product
gallery-image
option-group
option
delivery
trust
highlight
feature
feature-media
specification
related-product
```

The first field in every child model is a one-option `type` selector. Keep that
generated value unchanged because the decorator uses it to identify the row.

## Content modes and overrides

Block 2 begins with the complete Basilisk V3 Pro 35K content preset. A
`setting` row with the `content-mode` key controls how authored repeatable rows
interact with that preset.

### Merge mode

`merge` is the default and recommended mode for normal editing.

- An authored row whose stable key matches a preset row overrides that item.
- A new stable key adds an item.
- A blank field keeps the preset value when the row matches an existing item.
- `enabled=false` removes a matched item.
- Deleting an override row restores the preset item; it does not remove it.
- Use the literal `__empty__` when a field must be intentionally cleared.

For example, authoring a `gallery-image` row with key `gallery-02` changes the
second preset image. A row with key `gallery-07` adds a seventh image.

### Replace mode

Set `content-mode` to `replace` when an authored collection should become its
complete source of truth. Replace mode is scoped to each collection that is
actually targeted:

- One or more `gallery-image` rows replace the gallery.
- One or more `delivery`, `trust`, `highlight`, `feature`, `specification`, or
  `related-product` rows replace that respective collection.
- Authored `option-group` rows replace the option-group collection.
- Authored `option` rows replace the options for the matching group.
- Authored `feature-media` rows replace the media for the matching feature.
- A collection with no authored rows continues to use its preset content.

This per-collection behavior makes it possible to replace recommendations
without having to re-author all twelve feature panels.

### Clearing values with `__empty__`

An ordinary empty cell means “not authored” in merge mode. Enter the exact
literal below to author an intentional empty string:

```text
__empty__
```

Typical uses include removing a subtitle, original price, discount, feature
eyebrow, note, optional price adjustment, or feature link. Use
`enabled=false` to remove an entire repeatable item. Do not use `__empty__` for
the `type`, relationship keys, booleans, or image dimensions.

## Stable keys and ordering

Every repeatable row has a stable lowercase key. Keys are both identities and
sort positions, so use zero-padded values:

| Row | Recommended keys |
| --- | --- |
| Gallery image | `gallery-01`, `gallery-02`, … |
| Option group | `group-01`, `group-02`, … |
| Option within a group | `option-01`, `option-02`, … |
| Delivery item | `delivery-01`, `delivery-02`, … |
| Trust item | `trust-01`, `trust-02`, … |
| Highlight | `highlight-01`, `highlight-02`, … |
| Feature | `feature-01`, `feature-02`, … |
| Media within a feature | `media-01`, `media-02`, … |
| Specification | `spec-01`, `spec-02`, … |
| Related product | `related-01`, `related-02`, … |

Numeric shorthand such as `2` is normalized to the correct prefixed key, but
the full key is clearer in DA.live and safer when copying rows.

Two relationships depend on exact key matches:

- An `option` row's `group-key` must match an `option-group` key.
- A `feature-media` row's `feature-key` must match a `feature` key.

Changing a parent key also requires updating its related rows. In merge mode,
renaming a preset key creates a new item instead of moving the preset item. To
replace or reposition a preset item, disable the old key and add the new key,
or keep the original identity and adjust the surrounding keys.

Rows may appear in any DA.live editing order. Repeatable content is rendered in
stable-key order. Avoid duplicate keys. If a setting key is repeated, the last
setting row wins, but one row per setting is strongly preferred.

## Child-row reference

The image and alt fields share one DA image cell. Width and height are positive
intrinsic pixel dimensions used to reserve layout space.

| Type | Fields after `type` | Purpose |
| --- | --- | --- |
| `setting` | `key`, `value` | Behavior, UI copy, accessibility copy, or theme token override |
| `brand` | image and alt, `width`, `height` | Product-navigation logo; normally author one row |
| `product` | `sku`, `color`, `title`, `subtitle`, `price`, `original-price`, `discount`, `url`, `pickup` | Hero product identity, commerce snapshot, shared Buy/Add-to-cart URL, and pickup copy |
| `gallery-image` | `key`, `enabled`, image and alt, `width`, `height` | Gallery slide and its generated thumbnail |
| `option-group` | `key`, `enabled`, `label` | Product choice group |
| `option` | `group-key`, `key`, `enabled`, `label`, `price`, `selected` | One choice inside an option group |
| `delivery` | `key`, `enabled`, `label`, `value` | Delivery window and price |
| `trust` | `key`, `enabled`, `text` | Trust or service statement |
| `highlight` | `key`, `enabled`, `text` | Numbered product highlight |
| `feature` | `key`, `enabled`, `side`, `eyebrow`, `title`, `subtitle`, `body`, `bullets`, `details`, `note`, `link` | One editorial feature panel |
| `feature-media` | `feature-key`, `key`, `enabled`, image and alt, `width`, `height` | One image belonging to a feature |
| `specification` | `key`, `enabled`, `label`, `value` | One technical specification row |
| `related-product` | `key`, `enabled`, image and alt, `title`, `price`, `original-price`, `discount`, `url`, `cta-label` | One related-product carousel card |

Only one `brand` and one `product` row should normally be authored. If more
than one exists, later authored values override earlier values.

Within each option group, mark exactly one enabled option as
`selected=true`. If multiple authored options are selected, the first selected
row is used. If none are selected, the decorator preserves the existing
selection or selects the first enabled option.

## Rich-text authoring

Several rows use rich text so the experience can preserve semantic structure.

### Feature body

Use normal paragraphs in `body`. Each paragraph becomes a paragraph in the
feature copy.

### Feature bullets

Use a list in `bullets`. Bold text at the beginning of a list item becomes its
lead:

```text
Tactile Cycling Mode — Distinct steps for precise selection.
```

In DA.live, bold **Tactile Cycling Mode**. The separator displayed between the
lead and description is controlled by
`ui-feature-bullet-separator`.

### Feature details

Use an `h3` heading followed by a paragraph for each entry in `details`. A
bold phrase at the start of the paragraph becomes the detail lead. This format
is used by the “More Advanced Features” panel.

### Feature link

Author one linked label in `link`, such as
`[Learn more](https://www.razer.com/technology/...)`. A plain-text fallback can
use:

```text
Learn more || https://example.com
```

Use `__empty__` to remove an inherited link.

### Specification value

Use a paragraph for a single value or a list for multiple values. For example,
Connectivity can be authored as a list containing Razer HyperSpeed Wireless,
Bluetooth, and Wired.

## Setting rows

Add one **Razer Minipage Setting** row for each override. Behavior values use
`true` or `false`. Unrecognized boolean values retain the default. Unsafe token
values and unsafe URLs are rejected by the decorator.

### Behavior settings

| Key | Default | Description |
| --- | --- | --- |
| `content-mode` | `merge` | Uses `merge` or `replace` collection semantics |
| `navigation` | `true` | Shows the sticky product navigation |
| `footer` | `true` | Shows the internal Razer footer |
| `motion` | `true` | Enables entrance and reveal choreography |
| `scroll-progress` | `true` | Shows progress beneath the product navigation |
| `background-grid` | `true` | Shows the minipage background grid texture |
| `show-highlights` | `true` | Shows the numbered highlight section |
| `show-features` | `true` | Shows all enabled feature panels |
| `show-specifications` | `true` | Shows the technical-specification section |
| `show-related-products` | `true` | Shows the related-product carousel |
| `sticky-offset` | automatic | Optional safe CSS length used to clear the host header |

Leave `sticky-offset` un-authored for the recommended automatic host-header
behavior. Valid examples include `72px`, `4rem`,
`var(--nav-height, 64px)`, and a safe `calc()` or `clamp()` expression.

### UI and accessibility settings

Pattern settings preserve their named placeholders. `{alt}` inserts an image
alt, `{label}` inserts the selected option label, and `{current}` and
`{total}` insert carousel/gallery positions.

| Key | Default |
| --- | --- |
| `ui-region-label` | `Razer Basilisk V3 Pro 35K product experience` |
| `ui-skip-navigation-label` | `Skip product navigation` |
| `ui-gallery-show-image-pattern` | `Show {alt}` |
| `ui-gallery-previous-label` | `Previous product image` |
| `ui-gallery-next-label` | `Next product image` |
| `ui-gallery-previous-symbol` | `‹` |
| `ui-gallery-next-symbol` | `›` |
| `ui-gallery-counter-pattern` | `{current} / {total}` |
| `ui-gallery-images-label` | `Product images` |
| `ui-delivery-heading` | `Order now, delivered by` |
| `ui-pickup-heading` | `Pickup at RazerStore` |
| `ui-add-to-cart-label` | `Add to cart` |
| `ui-option-selection-pattern` | `{label} selected` |
| `ui-highlights-label` | `Product highlights` |
| `ui-feature-bullet-separator` | ` — ` |
| `ui-specifications-eyebrow` | `Technical data` |
| `ui-specifications-title` | `Full Technical Specifications` |
| `ui-specifications-caption` | `Razer Basilisk V3 Pro 35K full technical specifications` |
| `ui-related-eyebrow` | `Complete your setup` |
| `ui-related-title` | `More Gamer Gear You’ll Dig` |
| `ui-related-card-position-pattern` | `Product {current} of {total}` |
| `ui-related-view-details-label` | `View details` |
| `ui-related-previous-label` | `Previous related products` |
| `ui-related-next-label` | `Next related products` |
| `ui-related-previous-symbol` | `‹` |
| `ui-related-next-symbol` | `›` |
| `ui-related-region-label` | `Related products` |
| `ui-navigation-brand-aria-label` | `Razer product overview` |
| `ui-navigation-aria-label` | `Razer product navigation` |
| `ui-navigation-overview-label` | `Overview` |
| `ui-navigation-features-label` | `Features` |
| `ui-navigation-specifications-label` | `Tech specs` |
| `ui-navigation-related-label` | `More gear` |
| `ui-navigation-buy-now-label` | `Buy now` |
| `ui-footer-tagline` | `FOR GAMERS. BY GAMERS.™` |
| `ui-footer-descriptor` | `Razer Basilisk V3 Pro 35K product prototype` |

These settings include visible labels and screen-reader-only copy. When
localizing the page, update the whole UI set rather than only visible buttons.

### Theme-token settings

Theme settings map to a fixed allowlist of scoped CSS custom properties. They
do not accept arbitrary CSS declarations.

| Key | Default or expected value |
| --- | --- |
| `token-black` | `#000`; page background |
| `token-ink` | `#0a0a0a`; dark ink surface |
| `token-surface` | `#141414` |
| `token-surface-raised` | `#1a1a1a` |
| `token-border` | `#2a2a2a` |
| `token-border-strong` | `#454545` |
| `token-green` | `#44d62c`; primary accent |
| `token-green-rgb` | `68 214 44`; space-separated RGB channels |
| `token-green-hover` | `#5af042` |
| `token-green-deep` | `#2ea91d` |
| `token-white` | `#fff`; primary foreground |
| `token-muted` | `#b3b3b3` |
| `token-dim` | `#7d7d7d` |
| `token-display` | Display-font stack |
| `token-body` | Body-font stack |
| `token-mono` | Monospace-font stack |
| `token-content-max` | `1280px` |
| `token-copy-max` | `70ch` |
| `token-gutter` | `clamp(16px, 4vw, 64px)` |
| `token-section-space` | `clamp(56px, 8vw, 128px)` |
| `token-nav-height` | `57.6px` |
| `token-grid-size` | `64px` |
| `token-fast` | `160ms ease` |
| `token-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `token-green-shadow` | A safe CSS box-shadow list, or `none` |

When changing `token-green`, also set `token-green-rgb` if the accent is not a
six-digit hex value. For a six-digit hex accent, its RGB channels are derived
automatically when `token-green-rgb` is absent.

Color tokens accept safe CSS colors. Size tokens accept safe CSS lengths,
including `calc()`, `min()`, `max()`, `clamp()`, and CSS custom-property
references. Font tokens accept font-family stacks. Transition, easing, and
shadow values are validated separately; declarations containing semicolons,
braces, or `url()` are rejected.

## Native Metadata sibling

Page metadata must remain a separate native DA.live `Metadata` block after the
minipage. Do not try to reproduce it with `setting` rows: block decoration
occurs too late to replace EDS's document metadata and social-card pipeline
reliably.

Use:

| Metadata | |
| --- | --- |
| Title | Razer Basilisk V3 Pro 35K |
| Description | Fully Customizable Wireless Ergonomic RGB Gaming Mouse |
| Image | `https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h5a/h1c/9821720576030/basilisk-v3-pro-35k-500x500.png` |
| Template | `pdp` |

Update the Metadata title, description, and image whenever the authored
product changes. Keep `Template` set to `pdp`.

## DA.live authoring workflow

For a complete editable starting point, open
`razer-minipage-block2-da-live.html`, select all, copy, and paste into a blank
DA.live document. It contains every current row plus the native Metadata
sibling. For sparse overrides, paste `razer-minipage-block2-table.txt` or
insert **Razer Minipage Block 2** from the component picker.

1. Insert or paste **Razer Minipage Block 2**.
2. Decide whether the page needs sparse overrides (`merge`) or authored
   replacement collections (`replace`). Add a `setting` row only when changing
   the default.
3. Add a `brand` row to replace the navigation logo and alt text.
4. Add one `product` row for the SKU, title, product copy, prices, shared
   commerce URL, and pickup text.
5. Add or override gallery, option, delivery, trust, highlight, feature,
   specification, and related-product rows using stable zero-padded keys.
6. For every option, verify `group-key`. For every feature image, verify
   `feature-key`.
7. Upload approved images through the DA reference field. Write meaningful alt
   text and retain accurate intrinsic dimensions.
8. Mark only one enabled option per group as selected. Preview gallery,
   options, sticky navigation, feature layout, specifications, and the related
   carousel with a keyboard and at mobile and desktop widths.
9. Add the native Metadata sibling with `Template` set to `pdp`.
10. Preview, publish, and verify that unsafe or mistyped values did not fall
    back unexpectedly.

For a small edit, author only the affected rows in merge mode. For a completely
new product, replacing each targeted collection is clearer than attempting to
disable every preset item individually.

## Production notes

- Product prices, delivery dates, pickup inventory, and option surcharges are
  authored snapshots; this block does not fetch live commerce data.
- Option selection is presentational. It does not recalculate price, change the
  SKU or gallery, or perform a Commerce cart mutation.
- Product, feature, and related-product URLs accept HTTP(S), site-relative,
  document-relative, or hash URLs. Unsafe schemes and protocol-relative URLs
  are rejected.
- Empty or unsafe required images are dropped from repeatable collections.
- The original `razer-minipage` preset remains available for fixed-content
  pages. Block 2 is appropriate when authors need control over the complete
  experience.

## Files and verification

```text
blocks/razer-minipage-block2/
├── _razer-minipage-block2.json
├── generate-authoring.mjs
├── razer-minipage-block2-da-live.html
├── razer-minipage-block2-table.txt
├── razer-minipage-block2.css
├── razer-minipage-block2.js
└── README.md
```

`generate-authoring.mjs` regenerates the full DA.live handoff and compact
starter table from the canonical default content. The local integration page
is `/razer-minipage-block2-demo.html`.

Targeted checks:

```sh
node blocks/razer-minipage-block2/generate-authoring.mjs
npx eslint blocks/razer-minipage/*.js blocks/razer-minipage-block2/*.js blocks/razer-minipage-block2/*.mjs
npx stylelint blocks/razer-minipage/razer-minipage.css blocks/razer-minipage-block2/razer-minipage-block2.css
node --test tests/razer-minipage/*.test.mjs tests/razer-minipage-block2/*.test.mjs
npm run build:json
```

# Razer Minipage

## Overview

`razer-minipage` is a full-bleed DA.live preset block that recreates the
standalone Razer Basilisk V3 Pro 35K product experience inside this EDS site.
It intentionally consolidates the source prototype's hero, highlights, twelve
editorial feature panels, full specification table, recommendations carousel,
product sub-navigation, scroll progress, and prototype footer into one block.

The visible page content is created after normal EDS document decoration. This
is important in this repository: it prevents the global auto-hero and button
decorators from moving the minipage heading, images, or links before this block
loads.

## DA.live authoring

For the complete page handoff, open `razer-minipage-da-live.html`, select all,
copy, and paste into a blank DA.live document. It includes both the block and
native Metadata. For only the block, paste `razer-minipage-table.txt` into a
blank section, or insert **Razer Minipage** from the component picker.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | select | `basilisk-v3-pro-35k` | Fixed experience/content preset |
| `navigation` | boolean | `true` | Shows the sticky product navigation and progress line |
| `footer` | boolean | `true` | Shows the internal Razer prototype footer |
| `motion` | boolean | `true` | Enables section reveals and entrance choreography |
| `product-url` | URL | Razer Basilisk PDP | Overrides both Buy now and Add to cart |
| `sticky-offset` | CSS length | automatic | Optional host-header offset, for example `72px` |

Leave `sticky-offset` out of the DA table for the recommended responsive
behavior. The block then uses the site's fixed navigation height below 900px
and returns the product navigation to the top edge on desktop.

Add native page Metadata after the block:

| Metadata | |
| --- | --- |
| Title | Razer Basilisk V3 Pro 35K |
| Description | Fully Customizable Wireless Ergonomic RGB Gaming Mouse |
| Image | `https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h5a/h1c/9821720576030/basilisk-v3-pro-35k-500x500.png` |

Metadata remains outside the block so DA.live and EDS continue to own the
document title, description, and social-card pipeline.

## Experience details

- Six-image gallery with previous/next controls, thumbnail tabs, image counter,
  roving keyboard focus, Home/End support, and fine-pointer depth movement.
- Three exclusive product-option groups with click, arrow, Home, and End
  keyboard handling plus announced selection state.
- Sticky Razer product navigation with instance-safe anchors, active-section
  state, Buy now override support, and minipage-relative scroll progress.
- Twelve alternating feature panels containing all imagery and product-story
  content from the source prototype.
- Twenty-one-row semantic technical specification table.
- Five-card related-product carousel with buttons, keyboard navigation, touch
  scrolling, snap points, and responsive card widths.
- Full reduced-motion handling. Content is never hidden unless the reveal
  observer has initialized successfully.
- Multiple instances are supported; all gallery, navigation, and carousel IDs
  are generated per block instance.

## Files

```text
blocks/razer-minipage/
├── _razer-minipage.json
├── razer-minipage-content.js
├── razer-minipage-da-live.html
├── razer-minipage-table.txt
├── razer-minipage.css
├── razer-minipage.js
└── README.md
```

`razer-minipage-content.js` is the structured source of truth for this preset.
The decorator owns all internal rendering and interaction behavior. CSS is
fully namespaced under `.razer-minipage`, aside from narrowly targeted EDS
container/wrapper resets.

## Responsive behavior

- Base/mobile: one-column hero and feature panels, horizontal gallery
  thumbnails, stacked highlights/specification cells, and approximately
  viewport-width recommendation cards.
- 600px: three-column trust badges, two-column specs, and two-up carousel
  rhythm.
- 700px: highlights become three columns.
- 860px: product navigation links become visible and the internal footer lays
  out horizontally.
- 900px: split hero, sticky gallery with vertical thumbnails, alternating
  two-column feature panels, and four-up recommendation rhythm.
- 1200px: recommendation cards settle at a fixed 248px width.

All pixel values intentionally preserve the source prototype's 16px-root
proportions even though the host site uses `html { font-size: 62.5%; }`.

## Dependencies and production notes

- No JavaScript package or nested block dependency is required.
- Rajdhani and Titillium Web are loaded once from Google Fonts by the decorator,
  with local site-font fallbacks.
- At runtime, the block produces 40 image elements representing 33 unique
  visible Razer CDN assets, including the navigation logo. Gallery thumbnails
  reuse the six gallery sources. The native Metadata section adds one further
  unique social-image URL, bringing the complete DA.live handoff to 34 unique
  remote assets. Upload approved assets into DA.live and replace the URLs in
  `razer-minipage-content.js` before production.
- Product price, sale, delivery dates, pickup inventory, option surcharges, and
  recommendations are a static captured snapshot.
- Option selection is presentational. It does not recalculate price, change the
  SKU/gallery, or perform a Commerce cart mutation.
- Buy now and Add to cart intentionally navigate to the configured external
  product URL.

## Local verification

Open `/razer-minipage-demo.html` through `npm start` or another local HTTP
server. The demo imports the real block module and both the host and block
stylesheets.

Targeted checks:

```sh
npx eslint blocks/razer-minipage/*.js tests/razer-minipage/*.test.mjs
npx stylelint blocks/razer-minipage/razer-minipage.css
node --test tests/razer-minipage/razer-minipage.test.mjs
npm run build:json
```

Test at 375×812, 768×1024, and 1440×900. Verify gallery controls, all three
option groups, product navigation, the related-products carousel, keyboard
focus, reduced motion, no horizontal overflow, and unchanged host content
before and after the block.

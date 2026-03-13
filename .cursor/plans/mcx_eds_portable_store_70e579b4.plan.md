---
name: MCX EDS Portable Store
overview: "Plan to convert the MCX (Marine Corps Exchange) single-file HTML prototype into a portable AEM Edge Delivery Services (EDS) store experience in a new GitHub repo: EDS scaffold, MCX theme layer, block decomposition with content models, and optional commerce integration path."
todos: []
isProject: false
---

# MCX EDS Portable Store — Implementation Plan

## Goal

Produce a **new GitHub repository** that delivers the MCX website experience as an AEM EDS Store: content-driven, theme-portable, and ready to connect to Adobe Commerce. The experience will be **portable** so it can be forked, themed, or consumed as a block/theme package by other EDS repos.

---

## 1. New repo and scaffold

**Create a new repo** (e.g. `mcx-eds-store`) with a minimal EDS scaffold. Do **not** migrate the full jenhankib2bbodea codebase; keep the new repo focused on MCX only.

**Include:**

- Standard EDS layout: `blocks/`, `scripts/`, `styles/`, `models/`, `fonts/`, `icons/`, `head.html`, `package.json`
- Core scripts: `aem.js`, `scripts.js` (eager/lazy/delayed, `buildHeroBlock` only if you use default hero; otherwise remove or keep for fallback), and minimal `commerce.js` stubs if you plan to add Commerce later
- No dropins in the first phase; add Commerce wiring in a later phase when connecting to an Adobe Commerce backend

**Reference:** EDS project layout and load sequence are described in [aem-edge-delivery-services SKILL](.cursor/skills/aem-edge-delivery-services/SKILL.md) and [eds-block-patterns SKILL](.cursor/skills/eds-block-patterns/SKILL.md). Use the existing [scripts/scripts.js](scripts/scripts.js) and [scripts/aem.js](scripts/aem.js) as patterns; do not copy the entire `ui-ux-portability-package` into the new repo — only what’s needed for MCX.

---

## 2. MCX theme layer (portable design tokens)

Extract all `:root` CSS custom properties and global/base styles from the provided HTML into a **single, portable theme file** so the look can be moved or overridden without touching block CSS.

**Deliverables:**

- `**styles/mcx-theme.css`** (or equivalent) containing:
  - All variables from the HTML: `--scarlet`, `--scarlet-dark`, `--gold`, `--black`, `--surface-1`–`--surface-4`, `--border`, `--text-primary/secondary/muted`, `--font-display`, `--font-condensed`, `--font-body`, `--font-tactical`, `--radius-*`, `--shadow-*`, `--transition`, etc.
  - Base resets and body/typography that depend on those tokens (no block-specific layout).
- `**styles/fonts.css`** (or a section in the theme) loading: Bebas Neue, Barlow Condensed, Barlow, Rajdhani from Google Fonts (with `preconnect` already in `head.html`).
- `**styles/styles.css**` in the new repo: minimal base (e.g. box-sizing, scroll-behavior) and an import of `mcx-theme.css`, so swapping the theme file changes the whole look.

**Portability:** Document in the repo README that “to reuse this experience in another EDS site, copy `styles/mcx-theme.css` and `styles/fonts.css` (and optionally the MCX blocks) and import the theme.” Optionally add a one-page “Portability” doc that lists theme files and block names.

---

## 3. Block decomposition (section → block mapping)

Map each section of the MCX HTML to an EDS block: either **new MCX block** or **reuse** of an existing pattern (e.g. Block Collection). Prefer reusing when the structure and behavior match; otherwise create a new block and keep content models author-friendly (max 4 cells per row, semantic formatting).


| Section in HTML                                       | Block approach                                                             | Content model                                                               | Notes                                                                                                                                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Announcement bar                                      | **New** `mcx-announcement-bar`                                             | Standalone: 1 row, multiple cells (items + optional close)                  | Author: list of short lines; close button optional.                                                                                                                                                                                |
| Header (logo, search, nav, mega menu)                 | **New** `mcx-header`                                                       | Configuration + fragment or nav table                                       | Logo, search placeholder, nav links; mega menu content as table (e.g. 3 columns: Men’s / Women’s / Footwear). Register in shell so it loads with header.                                                                           |
| Hero (eyebrow, H1, gold line, desc, CTAs, KPIs, dots) | **New** `mcx-hero`                                                         | Standalone: rows for eyebrow, heading, description, buttons, KPIs           | Reuse semantic structure (H1, paragraph, links). KPIs as 2-column rows (label / value).                                                                                                                                            |
| Ticker                                                | **New** `mcx-ticker`                                                       | Collection: 1 column, each row = one ticker item                            | Simple list of strings; JS duplicates for infinite scroll.                                                                                                                                                                         |
| Benefits (4 icons + text)                             | **New** `mcx-benefits`                                                     | Collection: 2–3 cells per row (icon optional, title, subtitle)              | 4 rows. Icon can be emoji or reference; prefer semantic markup.                                                                                                                                                                    |
| Category grid (12 cards)                              | **New** `mcx-category-grid`                                                | Collection: icon/emoji, name, count per row                                 | 3 cells per row; 12 rows. Section heading via section metadata or first row.                                                                                                                                                       |
| Product grid (8 cards)                                | Reuse **cards** or **New** `mcx-product-cards`                             | Collection: image, brand, name, rating, price, was-price, badge             | If reusing Block Collection `cards`, add a variant for “product” layout and map to MCX product card markup. Else implement `mcx-product-cards` with Collection model; later wire to Commerce (product-list-page / product-teaser). |
| Promo strip (red gradient, CTA)                       | **New** `mcx-promo-strip`                                                  | Standalone: tag, title, description, button label + URL                     | 1–2 rows.                                                                                                                                                                                                                          |
| Featured collections (1 large + 2 small)              | **New** `mcx-featured-collections`                                         | Standalone: 3 rows (main image+text, side1 image+text, side2 image+text)    | Image, tag, title, CTA per area.                                                                                                                                                                                                   |
| Brands row                                            | **New** `mcx-brands`                                                       | Collection: 1 column, each row = brand name                                 | 7 rows.                                                                                                                                                                                                                            |
| Editorial (3 cards)                                   | Reuse **cards** with variant or **New** `mcx-editorial-cards`              | Collection: image, number, category, title, description                     | 3 rows.                                                                                                                                                                                                                            |
| Newsletter                                            | Reuse **newsletter** if present in scaffold, else **New** `mcx-newsletter` | Configuration or Standalone: heading, description, placeholder, button text | Match existing EDS newsletter pattern if available.                                                                                                                                                                                |
| Footer                                                | Reuse **footer** with MCX theme, or **New** `mcx-footer`                   | Same as Block Collection footer: columns of links + brand block             | Styled by MCX theme.                                                                                                                                                                                                               |
| Back to top                                           | **Global script** in `scripts/scripts.js` or small **delayed** block       | N/A                                                                         | Single button; show after scroll threshold.                                                                                                                                                                                        |
| Toast (“Added to Cart”)                               | **Global** (e.g. in `scripts/scripts.js` or a tiny block loaded once)      | N/A                                                                         | Triggered by Add to Cart / wishlist; no author content.                                                                                                                                                                            |


**Content model rules (EDS):**

- Max 4 cells per row; use semantic formatting (headings, bold) for meaning.
- Prefer block variants (e.g. `mcx-hero (dark)`) over extra config columns.
- Document each block in a short `README.md` and a `_block-name.json` with `definitions` and `models` for DA.live (and `component-definition.json` registration).

---

## 4. Block implementation order and dependencies

Implement in an order that minimizes rework and allows early visual validation:

1. **Theme** — `styles/mcx-theme.css` + `styles/fonts.css` + base `styles/styles.css` so that default content and one hero already “look like MCX.”
2. **Shell and global UI** — `mcx-announcement-bar`, `mcx-header`, then footer (reuse or `mcx-footer`). Ensures every page has the same chrome.
3. **Above-the-fold** — `mcx-hero` (and remove or adapt auto hero in `scripts.js` if it conflicts).
4. **Mid-page** — `mcx-ticker`, `mcx-benefits`, `mcx-category-grid`.
5. **Commerce and marketing** — `mcx-product-cards` (or cards variant), `mcx-promo-strip`, `mcx-featured-collections`, `mcx-brands`, editorial (cards or `mcx-editorial-cards`), newsletter.
6. **Global behavior** — Back-to-top and toast in `scripts/scripts.js` (or one minimal block that injects both).

Each block follows the standard EDS pattern: `decorate(block)` in `blocks/<name>/<name>.js`, scoped CSS in `blocks/<name>/<name>.css`, and `_<name>.json` for DA.live. Reuse `createOptimizedPicture`, `readBlockConfig`, and other helpers from `aem.js`; no `innerHTML` with unsanitized input; external links use `rel="noopener noreferrer"`.

---

## 5. Content and authoring

- **Test content:** Add at least one authoring source (e.g. Google Doc or local `.plain.html`) that represents the homepage so you can validate all blocks. Use the CDD workflow: design content model → create test content → implement → validate.
- **Local preview:** Use `aem up --html-folder drafts --no-open` (or equivalent) and serve a `drafts/tmp/mcx-home.plain.html` that includes section metadata and one instance of each MCX block in order.
- **Documentation:** In the new repo, add a short “Authoring guide” that lists each block, its table shape (rows × columns), and example content (e.g. “Row 1: eyebrow text | optional line label”).

---

## 6. Commerce integration (later phase)

The HTML includes product cards, cart count, and “Add to Cart” / wishlist. For the **first phase**, implement with static or mock data so the experience is complete without a backend.

**Later (separate plan):**

- Add Adobe Commerce fstab/config and `commerce.js` (or copy from existing repo) and Commerce dropins.
- Replace product grid with `product-list-page` / product teasers or keep `mcx-product-cards` and feed it from Commerce APIs.
- Wire header cart icon to `commerce-mini-cart`, search to `search-bar` (Commerce-aware).
- Ensure Add to Cart and wishlist trigger Commerce events and optional toast; keep toast in global script or small block.

Do not implement Commerce API calls or secrets in the initial portable package; only document where to plug them in.

---

## 7. Security and quality

- **Security (workspace rules):** No raw user input in file/command/query usage; no secrets in frontend; validate newsletter and form input; allow only safe URL protocols; use `rel="noopener noreferrer"` for `target="_blank"`.
- **Validation:** Run `npm run lint` (and fix lint) in the new repo; optional `npm test` if tests are added.
- **Accessibility:** Use semantic HTML, ARIA where needed (e.g. mega menu, ticker), and ensure focus and keyboard behavior for header nav and CTAs.

---

## 8. Deliverables summary


| Deliverable            | Description                                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New GitHub repo        | EDS scaffold + MCX-only blocks and theme.                                                                                                                                                                                                                                 |
| `styles/mcx-theme.css` | All MCX design tokens and base globals; portable.                                                                                                                                                                                                                         |
| `styles/fonts.css`     | Bebas Neue, Barlow Condensed, Barlow, Rajdhani.                                                                                                                                                                                                                           |
| 12–14 blocks           | mcx-announcement-bar, mcx-header, mcx-hero, mcx-ticker, mcx-benefits, mcx-category-grid, mcx-product-cards (or cards variant), mcx-promo-strip, mcx-featured-collections, mcx-brands, mcx-editorial-cards or cards, newsletter/footer, plus global back-to-top and toast. |
| Content models         | Each block has `_block-name.json` and optional README with table layout.                                                                                                                                                                                                  |
| Test content           | At least one homepage (e.g. `drafts/tmp/mcx-home.plain.html`) exercising all blocks.                                                                                                                                                                                      |
| Docs                   | README (run, preview, portability), optional “Portability” and “Authoring” pages.                                                                                                                                                                                         |


---

## 9. Out of scope for this plan

- Implementing Adobe Commerce backend or dropins in the first phase.
- Migrating or copying the full jenhankib2bbodea block set into the new repo.
- Building a generic “theme switcher” UI; portability is via file copy and theme import.
- Changes to `aem.js` or Adobe’s core runtime; only project-level scripts and blocks are added or modified.


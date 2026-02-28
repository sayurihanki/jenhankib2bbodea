---
name: aem-edge-delivery-services
description: Build and maintain Adobe AEM Edge Delivery Services sites using Content Driven Development. Use when creating or modifying EDS blocks, block JS/CSS/JSON, DA.live models, section metadata, commerce drop-ins, page imports/migrations, code reviews, testing, or full end-to-end EDS implementation tasks.
---

# AEM Edge Delivery Services Skill

Follow this skill for any AEM Edge Delivery Services (EDS) engineering task. Apply Content Driven Development (CDD) as the default operating model.

## 1) Core Operating Rules

1. Start from content, not code.
2. Design for authoring simplicity first, engineering convenience second.
3. Reuse existing platform conventions before inventing new patterns.
4. Keep all block logic scoped to the block root.
5. Protect performance, accessibility, and security in every change.
6. Keep EDS core behavior intact (`scripts/aem.js` is off-limits).

## 2) How EDS Renders Content

Authoring sources (DA.live, Google Docs, SharePoint, Universal Editor) are converted to block DOM.

Canonical runtime shape:

```text
.section
  .{block-name}-container
    .{block-name}-wrapper
      .{block-name}.block   <- decorate(block) receives this element
        div                 <- row
          div               <- cell
```

Lifecycle in `scripts/scripts.js`:

1. `loadEager(doc)`
2. `loadLazy(doc)`
3. `loadDelayed()` -> `import('./delayed.js')` (after LCP + delay)

Phase expectations:

- Eager: first section + LCP-critical work only.
- Lazy: most block decoration and non-LCP rendering.
- Delayed: analytics/third-party/late non-critical operations.

## 3) Mandatory CDD Workflow (8 Steps)

Use this for all implementation changes (new blocks, fixes, behavior changes, CSS changes, and most core changes).

### Step 0: Track Work

Create and maintain this checklist:

1. Start dev server
2. Analyze and define acceptance criteria
3. Design content model
4. Identify/create test content
5. Implement
6. Lint and test
7. Final validation
8. Ship

### Step 1: Start Dev Server

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If not `200`:

```bash
aem up --no-open --forward-browser-logs
# or
npx -y @adobe/aem-cli up --no-open --forward-browser-logs
```

Re-check until `200`.

### Step 2: Analyze and Plan

Define:

- Problem statement
- Scope and constraints
- Author-facing behavior
- Responsive expectations (mobile/tablet/desktop)
- Non-goals
- Acceptance criteria
- Regression risk areas

If design/screenshot is available, analyze:

- Layout, spacing, typography, color, borders/shadows
- Interactive states (hover, focus, active)
- Motion/transition behavior
- Dynamic patterns (tabs, modal, accordion, carousel)
- Viewport shifts across breakpoints

Write findings to:

- `drafts/tmp/{block-name}-analysis.md`

### Step 3: Design the Content Model

Rules:

- Max 4 cells per row
- Semantics over positional magic
- Prefer variants (`| Hero (Dark) |`) over config rows (`style | dark`)
- Minimize required author inputs
- Design for robust parsing and graceful optionality

Pick exactly one primary model:

1. Standalone: one-off structured component (Hero, Quote)
2. Collection: repeatable item list (Cards, Carousel)
3. Configuration: behavior-only key/value API controls
4. Auto-Blocked: detectable authored pattern converted by scripts

Capture model in markdown with:

- block table structure
- row/cell meaning
- optional vs required fields
- variants
- fallback defaults

### Step 4: Identify/Create Test Content

End this step with real URLs to validate.

Option A: Existing user URL(s)

- Validate each with local `curl` HTTP check.

Option B: New content in CMS (preferred)

- Ask/create content matching the model.
- Validate URL returns `200` locally.

Option C: Local temporary `.plain.html`

1. Create `drafts/tmp/{block-name}.plain.html`
2. Start with `aem up --html-folder drafts --no-open --forward-browser-logs`
3. Validate local URL
4. Mark as temporary until CMS content exists

### Step 5: Implement

Implementation sequence:

1. Inspect existing blocks in `blocks/`
2. Find similar implementations (local first, then Block Collection/Block Party)
3. Implement minimal structure changes
4. Add behavior only if required
5. Add scoped CSS
6. Add JSON model config when block is DA.live managed

Base JS contract:

```js
export default async function decorate(block) {
  // Transform authored block DOM into semantic renderable DOM
}
```

Base CSS contract:

```css
main .my-block {
  /* scoped styles only */
}
```

### Step 6: Lint and Test

```bash
npm run lint
npm run lint:fix
npm test
```

Mandatory browser checks:

- Mobile (~375)
- Tablet (~768)
- Desktop (~1200)
- No console errors
- Acceptance criteria passed
- Variants pass

### Step 7: Final Validation

1. Re-read acceptance criteria and verify each item
2. Re-check key flows on 3 breakpoints
3. Run targeted regression checks on neighboring blocks/pages

### Step 8: Ship

Git hygiene:

1. Create branch with prefix `codex/` (example: `codex/feat-hero-variant`)
2. Stage only relevant files (never `git add .`)
3. Conventional commit (`feat(...)`, `fix(...)`, `refactor(...)`)
4. Push and open PR with before/after preview URLs

Preview convention:

- `https://main--{repo}--{owner}.aem.page/{path}`
- `https://{branch}--{repo}--{owner}.aem.page/{path}`

## 4) Block File System and Contracts

Each block typically includes:

```text
blocks/{block-name}/
  {block-name}.js
  {block-name}.css
  _{block-name}.json
```

### JS Requirements

- Export exactly one default `decorate(block)`
- Scope queries to `block` (not `document`)
- Reuse authored elements where possible (`picture`, `a`, `img`)
- Prefer `createElement`/`textContent`
- Avoid `innerHTML` with untrusted content
- Guard risky code with `try/catch` and `console.warn('block-name: ...')`

### CSS Requirements

- Scope all selectors under `main .{block-name}`
- Mobile-first base + media queries at `600` and `900`
- Use design tokens/custom properties
- Avoid `!important`, ID selectors, and high specificity chains

### JSON Model Requirements

`_{block-name}.json` contains:

- `definitions`: authoring table definition
- `models`: sidebar fields
- `filters`: nested child restrictions

Registration:

- Add definition entry in `models/_component-definition.json`
- Run `npm run build:json`

## 5) Canonical Content Models (Detailed)

### Standalone

Use for unique structured content.

- Flexible row composition
- Semantics in content (heading tags, emphasis, links)
- JS should tolerate optional/missing cells

### Collection

Use for repeatable cards/items.

- One row = one item
- Consistent column meaning per row
- Easier author scaling and ordering

### Configuration

Use only when content is API-driven.

- Key/value rows, usually two columns
- Validate keys and values strictly
- Do not misuse for static content authoring

### Auto-Blocked

Use when a detectable authored pattern can auto-convert.

- Implement detection in page script layer
- Keep detection deterministic
- Avoid fragile heuristics tied to incidental styling

## 6) Complexity Tiers (Build Strategy)

1. Tier 1 (CSS-only): no JS file, script auto-builds block
2. Tier 2 (Simple transform): lightweight DOM restructure
3. Tier 3 (Interactive): ARIA-compliant interactions
4. Tier 4 (Configurable): parse + normalize config values
5. Tier 5 (Feature-rich): full config/state/error/warning systems
6. Tier 6 (Commerce drop-in): async module loading + fallback UI

Escalate tiers only when needed.

## 7) Config and Metadata Resolution

Read from both sources:

1. `block.dataset.*` (block-level model fields)
2. `section.dataset.*` via `block.closest('.section')`

Handle DA double-prefix cases (`foo` and `dataFoo`).

Use resolution precedence:

1. Explicit block config
2. Section metadata
3. Hardcoded safe default

Pattern:

```js
function getConfigValue(blockValue, sectionData, keys, fallback) {
  if (typeof blockValue === 'string' && blockValue.trim()) return blockValue;
  for (const key of keys) {
    if (typeof sectionData?.[key] === 'string' && sectionData[key].trim()) {
      return sectionData[key];
    }
  }
  return fallback;
}
```

Normalize every external value before usage.

## 8) Security Baseline

Always enforce:

- Safe URL protocols only: `http`, `https`, `mailto`, `tel`, relative/hash
- Reject `javascript:`, `data:`, `vbscript:`
- `target="_blank"` requires `rel="noopener noreferrer"`
- No secrets in code or repo history
- No unsanitized HTML injection paths

## 9) Performance Baseline

- Keep eager phase minimal
- Avoid expensive sync work in first section
- Lazy load non-critical behavior
- Prefer dynamic imports for optional features
- Avoid layout thrash; batch DOM writes
- Minimize CLS and ensure image sizing strategy
- Target high Lighthouse and stable Core Web Vitals

## 10) Accessibility Baseline

- Semantic markup first
- Proper heading order
- Interactive controls keyboard accessible
- ARIA only where required and correct
- Respect `prefers-reduced-motion`
- Minimum 44x44 tap targets for touch controls

## 11) Testing Standard

### Required

1. `npm run lint`
2. `npm test`
3. Browser validation on 3 breakpoints
4. Console error scan
5. Variant checks

### Optional but Recommended

- Unit tests for parser/normalizer logic
- Visual diffs for regression-sensitive blocks
- Screenshots for PR evidence

## 12) Code Review Checklist

### Must Fix (Blocking)

- Missing/invalid preview URLs
- Lint failures
- Security vulnerabilities
- Broken existing content
- Accessibility regressions
- `scripts/aem.js` modification

### Should Fix

- Unscoped CSS selectors
- Hardcoded token-worthy values
- Missing defensive checks
- Stray logs/debug statements
- Complex logic without clear separation

### Consider

- Naming clarity
- Helper extraction
- Maintainability improvements

## 13) Page Import and Migration Workflow

### 1. Scrape Source

- Capture page HTML
- Download local image assets
- Collect metadata (OG, canonical, JSON-LD)
- Capture screenshot for visual parity reference

### 2. Identify Structure

- Segment page by visual/thematic section boundaries
- Describe content sequences neutrally
- Build candidate block inventory from available implementations

### 3. Authoring Decision per Sequence (Mandatory)

Ask first:

- Can this be authored as default content in Docs/Word?

If yes, keep default content.
If no, map to best-fit block model.

### 4. Generate `.plain.html`

- Build section wrappers
- Insert block structures correctly
- Add section metadata where required
- Add page metadata block
- Keep local asset paths valid

### 5. Preview and Compare

- Run with local html folder
- Compare against source screenshot
- Iterate until parity and authorability goals are met

## 14) Utilities Reference

Common `aem.js` utilities:

- `createOptimizedPicture`
- `readBlockConfig`
- `toClassName`
- `toCamelCase`
- `loadCSS`
- `loadScript`
- `getMetadata`
- `buildBlock`
- `decorateBlock`
- `loadBlock`
- `decorateButtons`
- `decorateIcons`

Commerce helpers (project-dependent):

- `fetchPlaceholders`
- `getProductLink`
- `rootLink`
- `IS_DA` / `IS_UE`

## 15) New Block Blueprint (Practical)

1. Create files

```bash
mkdir -p blocks/my-block
touch blocks/my-block/my-block.js blocks/my-block/my-block.css blocks/my-block/_my-block.json
```

2. Define `_my-block.json` with `definitions`, `models`, `filters`
3. Register block definition in `models/_component-definition.json`
4. Run `npm run build:json`
5. Implement `decorate(block)` and scoped CSS
6. Create test content (`drafts/tmp/my-block.plain.html` or CMS)
7. Validate in browser and run lint/tests
8. Ship with scoped commit

## 16) Advanced Patterns

- `WeakMap` for per-instance state
- `AbortController` for event listener cleanup
- `ResizeObserver` for responsive recalculation
- `MutationObserver` for async DOM readiness hooks
- Loading states via data attributes (`data-loading="true"`)
- Custom events for loose coupling
- Runtime contrast checks for dynamic theming

## 17) Anti-Patterns to Avoid

- Coding before content model is defined
- Over-configuring simple static blocks
- Overusing Configuration model
- Tight coupling to exact row/cell positions
- Unscoped selectors that leak styles
- Global DOM queries for block content
- Heavy eager-phase logic
- Shipping without real browser validation

## 18) Deliverable Template (Per Task)

Produce this structure for each implementation:

1. Analysis summary
2. Final content model
3. Test content URLs
4. Files changed
5. Validation results (lint/tests/browser)
6. Known risks/follow-ups
7. Preview URLs (before/after)

## 19) Fast Decision Matrix

- Visual-only tweak with same markup -> CSS update
- Content shape changes -> update model + JS + tests
- Repeating item UX -> Collection model
- External data-driven UI -> Configuration model
- Pattern authors already type naturally -> Auto-block candidate
- Unclear -> implement simplest author-friendly variant and iterate

## 20) PR Definition of Done

A change is complete only when all are true:

1. Acceptance criteria fully met
2. Content model is author-friendly
3. Lint/tests pass
4. 3-breakpoint browser validation complete
5. No security/perf/accessibility regressions found
6. PR includes before/after preview links and clear scope notes

Use this skill as the primary workflow and quality gate for all AEM Edge Delivery Services block and page delivery tasks.

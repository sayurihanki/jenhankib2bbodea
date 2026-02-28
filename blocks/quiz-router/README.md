# Quiz Router Block

## Overview

The `quiz-router` block is a guided "find your perfect product" wizard that routes users to PLP (Product Listing Page), PDP (Product Detail Page), or a fragment based on authored question rows with option labels and destination URLs.

It uses **typed row authoring** in DA.live:
- `question` rows for each wizard step,
- `option` rows for selectable choices with destination URLs.

## DA.live Integration and Authoring Structure

Author using a **3-column** `quiz-router` table.

### Typed Row Model

| Row Type (Col 1) | Col 2 | Col 3 |
|-----------------|-------|-------|
| `question` | Question text (rich text) | Optional image/media |
| `option` | Option label | Destination URL (PLP, PDP, or fragment path) |

- **question** rows define each step; options that follow belong to the preceding question.
- **option** rows: Col 2 = label, Col 3 = link or URL (supports authored `a[href]` or `Label|URL` text).
- Use `#next` or leave URL empty to advance to the next question instead of routing.
- Destination URLs: relative paths for PLP/PDP/fragments (e.g. `/products/shirts`, `/product/abc123`, `/fragments/recommendations`).

### Authoring Examples

| Col 1 | Col 2 | Col 3 |
|-------|-------|-------|
| `question` | What type of product are you looking for? | [optional image] |
| `option` | Shirts | /products/shirts |
| `option` | Hats | /products/hats |
| `option` | Best sellers | /fragments/best-sellers |
| `question` | What's your budget? | |
| `option` | Under $50 | /products/under-50 |
| `option` | $50–$100 | /products/mid-range |
| `option` | Premium | /products/premium |

## Configuration Options

### Section Metadata Reference

Place section metadata immediately above the block. Page metadata (meta tags) can also be used as fallback.

| Key | Possible Values | Default | Effect |
|-----|-----------------|---------|--------|
| `quizrouter-progress` | `true`, `false` | `true` | Show step progress (e.g. "Step 2 of 4") |
| `quizrouter-theme` | `default`, `compact`, `card` | `default` | Visual style variant |
| `quizrouter-result-mode` | `navigate`, `fragment` | `navigate` | On final selection: full navigation vs load fragment inline |

### Metadata Precedence

1. Section metadata (from `section-metadata` block above quiz-router)
2. Page metadata (from `<meta name="quizrouter-*">` tags)
3. Block defaults (`progress=true`, `theme=default`, `result-mode=navigate`)

## Behavior Patterns

### Routing

- **navigate** (default): Selecting an option with a URL navigates to that URL (PLP, PDP, or any page).
- **fragment**: When the destination is a fragment path (e.g. `/fragments/best-sellers`), the fragment is loaded inline and replaces the block instead of navigating.
- If fragment loading fails, quiz-router falls back to full-page navigation for the same destination.

### Multi-Step Flow

- Options with `#next` or empty URL advance to the next question.
- Options with a valid URL route immediately (or load fragment when `quizrouter-result-mode` is `fragment`).
- `#next` on the final question is a no-op (safe warning in console).

### URL Safety Rules

Quiz destination URLs are sanitized with a same-origin policy:

- Allowed: relative/hash/query (`/path`, `./path`, `../path`, `#anchor`, `?q=x`)
- Allowed: absolute `http/https` URLs that resolve to the current origin
- Blocked: `javascript:` URLs, protocol-relative URLs (`//example.com`), and off-origin absolute URLs

When a destination is blocked and no explicit `#next`/empty-next action is present, the option remains visible but renders disabled.

## Accessibility Notes

- Progress text uses `role="status"` and `aria-live="polite"`.
- Content sets `aria-busy` during async navigation work.
- Option buttons are keyboard-focusable with visible focus states.
- Labels use safe text rendering.
- Question markup is rendered from sanitized authored content (no unsanitized HTML insertion).

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| Block shows "Configure quiz-router..." | No valid question/option rows | Add `question` row followed by `option` rows. |
| Option appears disabled | Destination URL is blocked by URL policy | Use a relative path or same-origin absolute URL, or use `#next`/empty URL for step advance. |
| Fragment not loading | Path not under `/fragments/` | Use `quizrouter-result-mode: fragment` and paths like `/fragments/name`. |
| Fragment does not render inline and page navigates | Fragment fetch failed or path is unavailable | Verify the fragment path is published and accessible as `.plain.html`. |
| Progress not visible | `quizrouter-progress` is false | Set `quizrouter-progress: true` in section metadata. |

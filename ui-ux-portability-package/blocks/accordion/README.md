# Accordion Block

## Overview

The Accordion block converts authored rows into semantic `<details>` accordion items with a clickable `<summary>` label and expandable body content.

## Configuration

- **Row structure**: Each row must contain two cells.
- **Cell 1 (label)**: Rendered inside `<summary class="accordion-item-label">`.
- **Cell 2 (content)**: Rendered inside `<div class="accordion-item-body">`.
- **Open state**: Controlled natively by the browser through the `<details open>` attribute.

## Integration

- No URL parameter handling.
- No `localStorage` usage.
- No custom event dispatch/listeners in block logic.
- Works as a content-only EDS block using `_accordion.json`.

## Behavior Patterns

1. During decoration, each source row is replaced with:
   - `<details class="accordion-item">`
   - `<summary class="accordion-item-label">...</summary>`
   - `<div class="accordion-item-body">...</div>`
2. Users click/tap the summary to expand/collapse each item.
3. Multiple items can be opened at the same time (no single-open enforcement).

## Visual Behavior

- Uses rounded glassmorphism styling to match Tabs:
  - translucent panel background
  - soft blur and border
  - accent hover/open states
  - animated chevron rotation

## Error Handling

- If a row does not have both expected cells, behavior is undefined and may fail during decoration.
- Empty labels or empty body content still render and remain interactable.

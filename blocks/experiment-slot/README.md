# Experiment Slot

## Overview

`experiment-slot` marks a DA-authored surface as a replacement target for link-driven experiments.

The runtime uses the block's `slotId` to match an experiment from `/data/experiments/registry.json` and swap in the chosen variant content.

## Authoring Model

Configured as a DA key-value block.

| Key | Type | Description |
|---|---|---|
| `slotId` | string | Stable slot identifier used by the runtime |
| `surfaceHint` | string | Expected surface type: `page`, `section`, `block`, or `fragment` |
| `content` | rich text | Fallback authored content when no variant is applied |
| `fallbackFragment` | string | Optional fragment path to load instead of inline fallback content |
| `notes` | string | Optional author notes |

## Runtime Notes

- The block renders `data-experiment-slot="<slotId>"`.
- `page-root` is reserved for the main page surface and is set automatically by the runtime.
- If `fallbackFragment` is configured and no inline content exists, the block loads the fragment content as its baseline state.

## Testing Checklist

- Verify the block renders its fallback content.
- Verify the block renders a fallback fragment when configured.
- Verify an experiment targeting `slotId` replaces the content.
- Verify control fallback remains intact when a variant link cannot be fetched or parsed.

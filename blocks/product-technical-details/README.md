# Product Technical Details

`product-technical-details` renders the lower PDP experience for the immersive rack variant:

1. Technical Specifications card grid
2. Optional Key Features list
3. Full Details accordion with specification tables

## Authoring

This is a DA key-value block.

| Key | Description |
| --- | --- |
| `data-source` | Repo-relative JSON path or published `da.live` JSON URL |
| `presentation` | `default` or `rack-immersive` |
| `enable-parallax` | `true` or `false`; defaults to `true` |

## Runtime behavior

- In `default` presentation, the block renders as soon as PDP data and the JSON data source are available.
- In `rack-immersive` presentation, the block stays hidden until `pdp/configurator-ready` is emitted with `presentation: rack-immersive`.
- Specification values resolve from Commerce attributes when possible, then fall back to authored values.
- The accordion is single-open and keyboard accessible.
- Parallax and reveal motion are disabled for reduced-motion users and narrow viewports.

## JSON contract

```json
{
  "specsTitle": "Technical Specifications",
  "featuresTitle": "Key Features",
  "detailsTitle": "Full Details",
  "specCards": [
    {
      "icon": "U",
      "label": "Rack Height (EIA-310)",
      "attribute": "rack_height",
      "fallbackValue": "42",
      "unit": "U"
    }
  ],
  "features": [
    {
      "title": "Hot-Swap Rails",
      "description": "Tool-free slide-rail mounting."
    }
  ],
  "detailsSections": [
    {
      "title": "Dimensions and Physical",
      "open": true,
      "rows": [
        {
          "label": "External Height",
          "value": "2,000 mm (78.7 in)"
        }
      ]
    }
  ]
}
```

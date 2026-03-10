# Experiments Studio

## What shipped

- Link-first runtime under `/plugins/experimentation/`
- New DA authoring block: `experiment-slot`
- Seed registry and reports under `/data/experiments/`
- Portfolio and experiment dashboard under `/tools/experiments-studio/`

## Core flow

1. Open `/tools/experiments-studio/`
2. Create or duplicate an experiment draft
3. Paste DA author, preview, or live links into each variant
4. Resolve each link to inspect available page, section, or block targets
5. Select the target surface and save the local draft
6. Export the JSON bundle and `experiment-slot` snippet
7. Publish the exported manifest through the normal DA/content workflow

## Runtime config

`config.json` now supports:

```json
{
  "public": {
    "default": {
      "experimentation": {
        "registry-path": "/data/experiments/registry.json",
        "site-id": "bodea-b2b",
        "debug-enabled": true,
        "assignment-ttl-seconds": 2592000,
        "slot-hide-timeout-ms": 160,
        "metrics-adapter": "mock/local"
      }
    }
  }
}
```

## Debug helpers

- `?experiment=<id>&variant=<key>` forces a variant
- `?exp_debug=1` opens the runtime debug panel
- `?exp_disable=1` disables experimentation on the page

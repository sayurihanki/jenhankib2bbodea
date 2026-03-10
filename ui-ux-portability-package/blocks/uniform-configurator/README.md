# Uniform Configurator

Single-block DA.live configurator for a premium, multi-step uniform package flow with live pricing, SVG preview updates, structured lead capture, and a success state.

## Configuration

Use the block as a DA key-value block with these fields:

| Key | Description |
|---|---|
| `eyebrow` | Small overline above the title |
| `title` | Main heading. Newlines render as line breaks |
| `subtitle` | Supporting copy below the title |
| `data-source` | Repo-relative JSON path or published `da.live` JSON URL |
| `submit-url` | Webhook/API endpoint for the final JSON POST |
| `success-title` | Heading shown after successful submission |
| `success-message` | Supporting copy shown after successful submission |
| `analytics-id` | Stable analytics identifier for data layer events |

### Default example

| uniform-configurator | |
|---|---|
| eyebrow | Marine Corps Uniform Division |
| title | Officer Dress Blues\nPackage Builder |
| subtitle | Configure your complete male officer blue dress uniform to USMC regulation standards with real-time pricing and a live visual preview. |
| data-source | /data/configurators/marine-officer-dress-blues.json |
| submit-url | https://example.com/api/uniform-leads |
| success-title | Order Submitted |
| success-message | Your Blue Dress Package is now in production. Our veteran uniform team will review your specifications and reach out within 24 hours to confirm details. |
| analytics-id | marine-officer-dress-blues |

## Data Source Contract

The data source is JSON and must contain:

- `id`, `version`, `currency`
- `baseItems[]`: `id`, `label`, `summaryLabel`, `price`
- `options.coat.length[]`, `options.coat.size[]`
- `options.trouser.waist[]`, `options.trouser.inseam[]`
- `options.shirt.neck[]`, `options.shirt.sleeve[]`, `options.shirt.collarStrip[]`
- `options.shoes`: `label`, `price`, `size[]`, `width[]`
- `options.belt`: `label`, `price`, `size[]`, `buckleStyles[]`
- `options.cover`: `label`, `price`, `size[]`
- `options.frame`: `label`, `price`, `size[]`
- `ranks[]`: `id`, `label`, `shortLabel`, `payGrade`, `price`, `preview`
- `medalPackages[]`: `id`, `label`, `previewCount`, `price`
- `extras[]`: `id`, `label`, `description`, `price`
- `measurements`
- `shippingStates[]`
- `notices`

Seed data is provided at `/data/configurators/marine-officer-dress-blues.json`.

## Behavior

- The block owns a fixed 6-step flow: garments, optional sizing add-ons, rank, accessories, contact, review.
- Step 1 sizing, Step 3 rank, and Step 5 `first name`, `last name`, and `email` are required.
- Measurements are optional, but any entered values are range-validated.
- Shipping fields become required only when shipping override is enabled.
- Fit-photo uploads are intentionally deferred in v1.
- Submission uses the shared wrapped/raw JSON POST behavior from `scripts/submit-json.js`.

## Submit Payload

Successful submission posts a JSON payload with:

- `configuratorId`, `configuratorVersion`, `analyticsId`
- `submittedAt`, `pageUrl`, `referrer`
- `currency`, `total`
- `lineItems[]`
- `selections`
- `contact`
- `measurements`
- `shipping`
- `notes`

## Analytics

The block pushes these events to both `adobeDataLayer` and `dataLayer`:

- `uniform_configurator_start`
- `uniform_configurator_step_view`
- `uniform_configurator_change`
- `uniform_configurator_submit`
- `uniform_configurator_submit_success`
- `uniform_configurator_submit_error`

## Failure States

- Invalid or missing `data-source` renders an inline block error.
- Missing `submit-url` renders an inline block error and stops initialization.
- Submission errors keep the user on the review step and show an inline error above the CTA.

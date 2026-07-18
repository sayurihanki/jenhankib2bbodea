/* eslint-env node */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import CONTENT from '../razer-minipage/razer-minipage-content.js';
import { UI_SETTING_PATHS } from './razer-minipage-block2.js';

const DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PRODUCT_URL = CONTENT.product.url;

const BEHAVIOR_SETTINGS = {
  'content-mode': 'merge',
  navigation: 'true',
  footer: 'true',
  motion: 'true',
  'scroll-progress': 'true',
  'background-grid': 'true',
  'show-highlights': 'true',
  'show-features': 'true',
  'show-specifications': 'true',
  'show-related-products': 'true',
};

const THEME_SETTINGS = {
  'token-black': '#000000',
  'token-ink': '#0a0a0a',
  'token-surface': '#141414',
  'token-surface-raised': '#1a1a1a',
  'token-border': '#2a2a2a',
  'token-border-strong': '#454545',
  'token-green': '#44d62c',
  'token-green-rgb': '68 214 44',
  'token-green-hover': '#5af042',
  'token-green-deep': '#2ea91d',
  'token-white': '#ffffff',
  'token-muted': '#b3b3b3',
  'token-dim': '#7d7d7d',
  'token-display': '"Rajdhani", "Roboto Condensed", "Arial Narrow", sans-serif',
  'token-body': '"Titillium Web", "Adobe Clean", sans-serif',
  'token-mono': 'ui-monospace, "SFMono-Regular", menlo, consolas, monospace',
  'token-content-max': '1280px',
  'token-copy-max': '70ch',
  'token-gutter': 'clamp(16px, 4vw, 64px)',
  'token-section-space': 'clamp(56px, 8vw, 128px)',
  'token-nav-height': '57.6px',
  'token-grid-size': '64px',
  'token-fast': '160ms ease',
  'token-ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'token-green-shadow': '0 0 0 1px rgb(68 214 44 / 36%), 0 0 24px rgb(68 214 44 / 24%)',
};

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

function getPath(value, path) {
  return path.reduce((current, key) => current[key], value);
}

function cell(value = '', raw = false) {
  return `<td>${raw ? value : escapeHTML(value)}</td>`;
}

function row(values) {
  return `          <tr>${values.map(({ value, raw }) => cell(value, raw)).join('')}</tr>`;
}

function textValue(value = '') {
  return { value };
}

function rawValue(value = '') {
  return { value, raw: true };
}

function imageValue(image) {
  return rawValue(`<img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt)}" width="${image.width}" height="${image.height}">`);
}

function linkValue(link) {
  if (!link) return textValue('');
  return rawValue(`<a href="${escapeHTML(link.href)}">${escapeHTML(link.label)}</a>`);
}

function paragraphsValue(paragraphs = []) {
  return rawValue(paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join(''));
}

function bulletsValue(bullets = []) {
  if (!bullets.length) return textValue('');
  const items = bullets.map((bullet) => {
    const lead = bullet.lead ? `<strong>${escapeHTML(bullet.lead)}</strong>` : '';
    const separator = bullet.lead && bullet.text ? ' — ' : '';
    return `<li>${lead}${separator}${escapeHTML(bullet.text)}</li>`;
  }).join('');
  return rawValue(`<ul>${items}</ul>`);
}

function detailsValue(details = []) {
  if (!details.length) return textValue('');
  return rawValue(details.map((detail) => `
    <h3>${escapeHTML(detail.title)}</h3>
    <p><strong>${escapeHTML(detail.lead)}</strong> ${escapeHTML(detail.text)}</p>
  `.trim()).join(''));
}

function specificationValue(value) {
  if (!Array.isArray(value)) return textValue(value);
  return rawValue(`<ul>${value.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`);
}

function settingRows() {
  const ui = Object.fromEntries(
    Object.entries(UI_SETTING_PATHS).map(([key, path]) => [key, getPath(CONTENT, path)]),
  );
  return Object.entries({
    ...BEHAVIOR_SETTINGS,
    ...ui,
    ...THEME_SETTINGS,
  }).map(([key, value]) => row([
    textValue('setting'),
    textValue(key),
    textValue(value),
  ]));
}

function contentRows() {
  const rows = [];
  rows.push(row([
    textValue('brand'),
    imageValue(CONTENT.ui.navigation.logo),
    textValue(CONTENT.ui.navigation.logo.width),
    textValue(CONTENT.ui.navigation.logo.height),
  ]));
  rows.push(row([
    textValue('product'),
    textValue(CONTENT.product.sku),
    textValue(CONTENT.product.color),
    textValue(CONTENT.product.title),
    textValue(CONTENT.product.subtitle),
    textValue(CONTENT.product.price),
    textValue(CONTENT.product.originalPrice),
    textValue(CONTENT.product.discount),
    textValue(CONTENT.product.url),
    textValue(CONTENT.product.pickup),
  ]));

  CONTENT.product.gallery.forEach((image, index) => {
    rows.push(row([
      textValue('gallery-image'),
      textValue(`gallery-${String(index + 1).padStart(2, '0')}`),
      textValue('true'),
      imageValue(image),
      textValue(image.width),
      textValue(image.height),
    ]));
  });

  CONTENT.product.optionGroups.forEach((group, groupIndex) => {
    const groupKey = `group-${String(groupIndex + 1).padStart(2, '0')}`;
    rows.push(row([
      textValue('option-group'),
      textValue(groupKey),
      textValue('true'),
      textValue(group.label),
    ]));
    group.options.forEach((option, optionIndex) => {
      rows.push(row([
        textValue('option'),
        textValue(groupKey),
        textValue(`option-${String(optionIndex + 1).padStart(2, '0')}`),
        textValue('true'),
        textValue(option.label),
        textValue(option.price || ''),
        textValue(String(option.selected === true)),
      ]));
    });
  });

  CONTENT.product.delivery.forEach((item, index) => {
    rows.push(row([
      textValue('delivery'),
      textValue(`delivery-${String(index + 1).padStart(2, '0')}`),
      textValue('true'),
      textValue(item.label),
      textValue(item.value),
    ]));
  });

  CONTENT.product.trust.forEach((text, index) => {
    rows.push(row([
      textValue('trust'),
      textValue(`trust-${String(index + 1).padStart(2, '0')}`),
      textValue('true'),
      textValue(text),
    ]));
  });

  CONTENT.highlights.forEach((text, index) => {
    rows.push(row([
      textValue('highlight'),
      textValue(`highlight-${String(index + 1).padStart(2, '0')}`),
      textValue('true'),
      textValue(text),
    ]));
  });

  CONTENT.features.forEach((feature, featureIndex) => {
    const featureKey = `feature-${String(featureIndex + 1).padStart(2, '0')}`;
    rows.push(row([
      textValue('feature'),
      textValue(featureKey),
      textValue('true'),
      textValue(feature.side),
      textValue(feature.eyebrow || ''),
      textValue(feature.title),
      textValue(feature.subtitle || ''),
      paragraphsValue(feature.paragraphs),
      bulletsValue(feature.bullets),
      detailsValue(feature.detailGroups),
      textValue(feature.note || ''),
      linkValue(feature.link),
    ]));
    feature.media.forEach((image, imageIndex) => {
      rows.push(row([
        textValue('feature-media'),
        textValue(featureKey),
        textValue(`media-${String(imageIndex + 1).padStart(2, '0')}`),
        textValue('true'),
        imageValue(image),
        textValue(image.width),
        textValue(image.height),
      ]));
    });
  });

  CONTENT.specifications.forEach((specification, index) => {
    rows.push(row([
      textValue('specification'),
      textValue(`spec-${String(index + 1).padStart(2, '0')}`),
      textValue('true'),
      textValue(specification.label),
      specificationValue(specification.value),
    ]));
  });

  CONTENT.relatedProducts.forEach((product, index) => {
    rows.push(row([
      textValue('related-product'),
      textValue(`related-${String(index + 1).padStart(2, '0')}`),
      textValue('true'),
      imageValue(product.image),
      textValue(product.title),
      textValue(product.price),
      textValue(product.originalPrice || ''),
      textValue(product.discount || ''),
      textValue(product.url),
      textValue(CONTENT.ui.related.viewDetailsLabel),
    ]));
  });
  return rows;
}

function createHandoff() {
  const blockRows = [...settingRows(), ...contentRows()].join('\n');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Razer Minipage Block 2 DA.live Handoff</title>
  </head>
  <body>
    <div>
      <table>
        <tbody>
          <tr><td>razer-minipage-block2</td></tr>
${blockRows}
        </tbody>
      </table>
    </div>

    <hr>

    <div>
      <table>
        <tbody>
          <tr><td>Metadata</td></tr>
          <tr><td>Title</td><td>${escapeHTML(CONTENT.metadata.title)}</td></tr>
          <tr><td>Description</td><td>${escapeHTML(CONTENT.metadata.description)}</td></tr>
          <tr>
            <td>Image</td>
            <td><img src="${escapeHTML(CONTENT.metadata.image)}" alt="${escapeHTML(CONTENT.metadata.title)}" width="500" height="500"></td>
          </tr>
          <tr><td>Template</td><td>pdp</td></tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
`;
}

const minimalTable = `razer-minipage-block2
setting\tcontent-mode\tmerge
setting\tnavigation\ttrue
setting\tfooter\ttrue
setting\tmotion\ttrue
product\tRZ01-05240100-R3U1\tBlack\tRazer Basilisk V3 Pro 35K\tFully Customizable Wireless Ergonomic RGB Gaming Mouse\tUS$129.99\tUS$159.99\t18% off\t${PRODUCT_URL}\tAvailable stock(s) in 10 RazerStore(s)
`;

await Promise.all([
  writeFile(join(DIRECTORY, 'razer-minipage-block2-da-live.html'), createHandoff()),
  writeFile(join(DIRECTORY, 'razer-minipage-block2-table.txt'), minimalTable),
]);

/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import CONTENT from '../../blocks/razer-minipage/razer-minipage-content.js';
import {
  normalizeKey,
  readConfig,
  sanitizeProductUrl,
} from '../../blocks/razer-minipage/razer-minipage.js';

const BLOCK_DIRECTORY = new URL('../../blocks/razer-minipage/', import.meta.url);

function makeCell(text, href = '') {
  return {
    textContent: text,
    querySelector(selector) {
      if (selector === 'a[href]' && href) return { href };
      return null;
    },
  };
}

function makeRow(key, value, href = '') {
  return {
    children: [makeCell(key), makeCell(value, href)],
  };
}

test('preset retains the complete visible source content inventory', () => {
  const featureImages = CONTENT.features
    .reduce((count, feature) => count + feature.media.length, 0);
  const authoredLinks = 1
    + CONTENT.features.filter((feature) => feature.link).length
    + CONTENT.relatedProducts.length;

  assert.equal(CONTENT.product.gallery.length, 6);
  assert.equal(CONTENT.product.optionGroups.length, 3);
  assert.equal(CONTENT.highlights.length, 3);
  assert.equal(CONTENT.features.length, 12);
  assert.equal(featureImages, 22);
  assert.equal(CONTENT.specifications.length, 21);
  assert.equal(CONTENT.relatedProducts.length, 5);
  assert.equal(CONTENT.product.gallery.length + featureImages
    + CONTENT.relatedProducts.length, 33);
  assert.equal(authoredLinks, 9);
});

test('normalizeKey accepts the common DA key spellings', () => {
  assert.equal(normalizeKey(' Sticky Offset '), 'sticky-offset');
  assert.equal(normalizeKey('product-url'), 'product-url');
  assert.equal(normalizeKey('SHOW   NAVIGATION'), 'show-navigation');
});

test('readConfig applies integration-safe defaults to a minimal DA block', () => {
  const config = readConfig({ children: [makeRow('preset', '')] });

  assert.equal(config.preset, 'basilisk-v3-pro-35k');
  assert.equal(config.navigation, true);
  assert.equal(config.footer, true);
  assert.equal(config.motion, true);
  assert.equal(config.automaticStickyOffset, true);
  assert.equal(config.stickyOffset, 'var(--nav-height, 64px)');
});

test('readConfig honors authored toggles, URL links, and a safe sticky offset', () => {
  const block = {
    children: [
      makeRow('preset', 'basilisk-v3-pro-35k'),
      makeRow('navigation', 'false'),
      makeRow('footer', 'off'),
      makeRow('motion', 'no'),
      makeRow('product url', 'Buy', 'https://example.com/product'),
      makeRow('sticky offset', '72px'),
    ],
  };
  const config = readConfig(block);

  assert.equal(config.navigation, false);
  assert.equal(config.footer, false);
  assert.equal(config.motion, false);
  assert.equal(config.productUrl, 'https://example.com/product');
  assert.equal(config.automaticStickyOffset, false);
  assert.equal(config.stickyOffset, '72px');
});

test('readConfig rejects unsafe sticky-offset CSS', () => {
  const config = readConfig({
    children: [makeRow('sticky-offset', '10px; background: red')],
  });

  assert.equal(config.stickyOffset, 'var(--nav-height, 64px)');
});

test('product URL normalization rejects executable or protocol-relative URLs', () => {
  assert.equal(
    sanitizeProductUrl(['javascript', 'alert(1)'].join(':')),
    CONTENT.product.url,
  );
  assert.equal(
    sanitizeProductUrl('//example.com/redirect'),
    CONTENT.product.url,
  );
  assert.equal(sanitizeProductUrl('/products/mouse'), '/products/mouse');
  assert.equal(
    sanitizeProductUrl('https://example.com/product'),
    'https://example.com/product',
  );
});

test('block stylesheet has no broad document-level selectors', async () => {
  const css = await readFile(new URL('razer-minipage.css', BLOCK_DIRECTORY), 'utf8');

  assert.doesNotMatch(css, /(^|\})\s*:root\s*\{/m);
  assert.doesNotMatch(css, /(^|\})\s*(?:html|body|header|footer)\s*\{/m);
  assert.match(css, /\.razer-minipage\s*\{/);
  assert.match(css, /\.razer-minipage-container/);
});

test('decorator does not replace host header, footer, or global document classes', async () => {
  const javascript = await readFile(new URL('razer-minipage.js', BLOCK_DIRECTORY), 'utf8');

  assert.doesNotMatch(javascript, /body\s*>\s*header|body\s*>\s*footer/);
  assert.doesNotMatch(javascript, /document\.documentElement\.classList/);
  assert.match(javascript, /export default function decorate/);
});

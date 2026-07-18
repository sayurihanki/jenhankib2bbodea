/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import DEFAULT_CONTENT from '../../blocks/razer-minipage/razer-minipage-content.js';
import {
  buildEditableExperience,
  parseAuthorRows,
  sanitizeAuthoredUrl,
  THEME_TOKEN_DEFINITIONS,
  UI_SETTING_PATHS,
} from '../../blocks/razer-minipage-block2/razer-minipage-block2.js';

const BLOCK_DIRECTORY = new URL('../../blocks/razer-minipage-block2/', import.meta.url);

function findByKey(items, key) {
  return items.find((item) => item.key === key);
}

function makeCell(text = '', options = {}) {
  return {
    innerText: text,
    textContent: text,
    querySelector(selector) {
      if (selector === 'img[src]' && options.image) {
        const { image } = options;
        return {
          alt: image.alt,
          currentSrc: image.src,
          height: image.height,
          src: image.src,
          width: image.width,
          getAttribute(name) {
            return image[name] === undefined ? null : String(image[name]);
          },
        };
      }
      if (selector === 'a[href]' && options.link) {
        const { link } = options;
        return {
          href: link.href,
          textContent: link.label,
          getAttribute(name) {
            return name === 'href' ? link.href : null;
          },
        };
      }
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function makeRow(...cells) {
  return {
    children: cells.map((cell) => (
      typeof cell === 'string' ? makeCell(cell) : cell
    )),
  };
}

test('default authored experience preserves the complete source inventory', () => {
  const sourceSnapshot = JSON.stringify(DEFAULT_CONTENT);
  const { content, config, styles } = buildEditableExperience([]);

  assert.equal(content.product.gallery.length, 6);
  assert.deepEqual(content.product.optionGroups.map((group) => group.options.length), [4, 3, 2]);
  assert.equal(content.product.delivery.length, 2);
  assert.equal(content.product.trust.length, 3);
  assert.equal(content.highlights.length, 3);
  assert.equal(content.features.length, 12);
  assert.equal(content.features.flatMap((feature) => feature.media).length, 22);
  assert.equal(content.specifications.length, 21);
  assert.equal(content.relatedProducts.length, 5);
  assert.equal(config.navigation, true);
  assert.equal(config.showSpecifications, true);
  assert.deepEqual(styles, {});
  assert.equal(JSON.stringify(DEFAULT_CONTENT), sourceSnapshot);
});

test('stable keyed rows edit every authored experience area without cross-leakage', () => {
  const records = [
    { type: 'setting', key: 'ui-navigation-buy-now-label', value: 'Build yours' },
    { type: 'setting', key: 'token-green', value: '#ff5a1f' },
    {
      type: 'brand',
      image: {
        src: '/brand.svg', alt: 'Demo brand', width: 40, height: 40,
      },
    },
    {
      type: 'product',
      title: 'Editable Product',
      pickup: 'Pickup in 12 stores',
      url: '/products/editable',
    },
    {
      type: 'gallery-image',
      key: 'gallery-02',
      image: {
        src: '/gallery-two.jpg', alt: 'Editable gallery image', width: 900, height: 600,
      },
    },
    { type: 'option-group', key: 'group-01', label: 'Finish' },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-02',
      label: 'Pearl',
      price: '+US$10.00',
      selected: true,
    },
    {
      type: 'delivery', key: 'delivery-01', label: 'Tomorrow', value: 'Free',
    },
    { type: 'trust', key: 'trust-02', text: 'Lifetime support' },
    { type: 'highlight', key: 'highlight-03', text: 'Author-controlled highlight' },
    {
      type: 'feature',
      key: 'feature-03',
      side: 'left',
      title: 'Editable feature',
      paragraphs: ['Editable body'],
      bullets: [{ lead: 'Speed', text: 'Instant' }],
      detailGroups: [{ title: 'Detail', lead: 'Lead.', text: 'Copy' }],
      note: 'Editable note',
      link: { label: 'Explore', href: '/technology' },
    },
    {
      type: 'feature-media',
      featureKey: 'feature-03',
      key: 'media-01',
      image: {
        src: '/feature.jpg', alt: 'Editable feature media', width: 1200, height: 800,
      },
    },
    {
      type: 'specification', key: 'spec-01', label: 'Finish', value: 'Pearl',
    },
    {
      type: 'related-product',
      key: 'related-01',
      image: {
        src: '/related.png', alt: 'Related editable product', width: 500, height: 500,
      },
      title: 'Related Editable Product',
      price: 'US$99.00',
      url: '/related',
      linkLabel: 'Open product',
    },
  ];
  const { content, styles } = buildEditableExperience(records);

  assert.equal(content.ui.navigation.buyNowLabel, 'Build yours');
  assert.equal(styles['--rm-green'], '#ff5a1f');
  assert.equal(styles['--rm-green-rgb'], '255 90 31');
  assert.equal(content.ui.navigation.logo.src, '/brand.svg');
  assert.equal(content.product.title, 'Editable Product');
  assert.equal(content.product.pickup, 'Pickup in 12 stores');
  assert.equal(findByKey(content.product.gallery, 'gallery-02').src, '/gallery-two.jpg');
  assert.equal(content.product.optionGroups[0].label, 'Finish');
  assert.equal(content.product.optionGroups[0].options[1].selected, true);
  assert.equal(
    content.product.optionGroups[0].options.filter((option) => option.selected).length,
    1,
  );
  assert.deepEqual(findByKey(content.product.delivery, 'delivery-01'), {
    key: 'delivery-01',
    label: 'Tomorrow',
    value: 'Free',
  });
  assert.equal(content.product.trust[1], 'Lifetime support');
  assert.equal(content.highlights[2], 'Author-controlled highlight');
  assert.equal(findByKey(content.features, 'feature-03').title, 'Editable feature');
  assert.equal(findByKey(content.features, 'feature-03').media[0].src, '/feature.jpg');
  assert.equal(findByKey(content.specifications, 'spec-01').value, 'Pearl');
  assert.equal(findByKey(content.relatedProducts, 'related-01').linkLabel, 'Open product');
  assert.equal(DEFAULT_CONTENT.product.title, 'Razer Basilisk V3 Pro 35K');
});

test('replace mode, enabled flags, and explicit empty values are deterministic', () => {
  const { content } = buildEditableExperience([
    { type: 'setting', key: 'content-mode', value: 'replace' },
    { type: 'product', originalPrice: '', discount: '' },
    {
      type: 'gallery-image',
      key: 'gallery-09',
      image: {
        src: '/only.jpg', alt: 'Only image', width: 800, height: 600,
      },
    },
    { type: 'feature', key: 'feature-02', enabled: false },
    { type: 'related-product', key: 'related-05', enabled: false },
  ]);

  assert.equal(content.product.originalPrice, '');
  assert.equal(content.product.discount, '');
  assert.equal(content.product.gallery.length, 1);
  assert.equal(content.product.gallery[0].src, '/only.jpg');
  assert.equal(content.features.some((feature) => feature.key === 'feature-02'), false);
  assert.equal(content.relatedProducts.some((product) => product.key === 'related-05'), false);
});

test('unsafe links and style tokens fall back instead of reaching the renderer', () => {
  const executable = ['javascript', 'alert(1)'].join(':');
  const { content, config, styles } = buildEditableExperience([
    { type: 'setting', key: 'sticky-offset', value: '10px; color: red' },
    { type: 'setting', key: 'token-green', value: 'red; background: white' },
    { type: 'product', url: executable },
    {
      type: 'feature',
      key: 'feature-01',
      link: { label: 'Unsafe', href: executable },
    },
    {
      type: 'related-product',
      key: 'related-01',
      url: '//example.com/redirect',
    },
  ]);

  assert.equal(config.stickyOffset, 'var(--nav-height, 64px)');
  assert.equal(styles['--rm-green'], undefined);
  assert.equal(content.product.url, DEFAULT_CONTENT.product.url);
  assert.equal(content.features[0].link.href, DEFAULT_CONTENT.features[0].link?.href || '');
  assert.equal(content.relatedProducts[0].url, DEFAULT_CONTENT.relatedProducts[0].url);
  assert.equal(sanitizeAuthoredUrl('/safe-path'), '/safe-path');
  assert.equal(sanitizeAuthoredUrl('//unsafe.example', '/fallback'), '/fallback');
});

test('DOM row reader extracts references, text, and stable keys', () => {
  const block = {
    children: [
      makeRow('setting', 'ui-navigation-buy-now-label', 'Configure'),
      makeRow(
        'gallery-image',
        '02',
        'true',
        makeCell('', {
          image: {
            src: '/authored.jpg',
            alt: 'Authored asset',
            width: 1000,
            height: 700,
          },
        }),
        '1000',
        '700',
      ),
      makeRow(
        'product',
        '',
        '',
        'Authored title',
        '',
        '',
        '',
        '',
        '/authored-product',
        'Pickup copy',
      ),
    ],
  };
  const rows = parseAuthorRows(block);

  assert.equal(rows[0].key, 'ui-navigation-buy-now-label');
  assert.equal(rows[1].key, 'gallery-02');
  assert.equal(rows[1].image.alt, 'Authored asset');
  assert.equal(rows[2].title, 'Authored title');
  assert.equal(rows[2].pickup, 'Pickup copy');
});

test('all centralized UI and public theme tokens are modeled', async () => {
  const model = JSON.parse(
    await readFile(new URL('_razer-minipage-block2.json', BLOCK_DIRECTORY), 'utf8'),
  );
  const settingModel = model.models.find(
    ({ id }) => id === 'razer-minipage-block2-setting',
  );
  const settingKeys = new Set(
    settingModel.fields.find(({ name }) => name === 'key').options.map(({ value }) => value),
  );

  Object.keys(UI_SETTING_PATHS).forEach((key) => assert.equal(settingKeys.has(key), true, key));
  Object.keys(THEME_TOKEN_DEFINITIONS).forEach(
    (key) => assert.equal(settingKeys.has(key), true, key),
  );
  assert.equal(model.filters[0].components.length, 13);
});

test('block2 CSS shares the isolated base and resets only its own EDS wrappers', async () => {
  const css = await readFile(new URL('razer-minipage-block2.css', BLOCK_DIRECTORY), 'utf8');

  assert.match(css, /@import url\("\.\.\/razer-minipage\/razer-minipage\.css"\)/);
  assert.match(css, /\.razer-minipage-block2-container/);
  assert.match(css, /\.razer-minipage-block2-wrapper/);
  assert.doesNotMatch(css, /(^|\})\s*(?:html|body|header|footer)\s*\{/m);
});

test('full DA handoff contains every repeatable default row and native Metadata', async () => {
  const handoff = await readFile(
    new URL('razer-minipage-block2-da-live.html', BLOCK_DIRECTORY),
    'utf8',
  );

  assert.equal((handoff.match(/<td>gallery-image<\/td>/g) || []).length, 6);
  assert.equal((handoff.match(/<td>option-group<\/td>/g) || []).length, 3);
  assert.equal((handoff.match(/<td>option<\/td>/g) || []).length, 9);
  assert.equal((handoff.match(/<td>feature<\/td>/g) || []).length, 12);
  assert.equal((handoff.match(/<td>feature-media<\/td>/g) || []).length, 22);
  assert.equal((handoff.match(/<td>specification<\/td>/g) || []).length, 21);
  assert.equal((handoff.match(/<td>related-product<\/td>/g) || []).length, 5);
  assert.match(handoff, /<td>Template<\/td><td>pdp<\/td>/);
});

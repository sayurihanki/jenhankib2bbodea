/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

import {
  DEFAULT_CONTENT,
  LIMITS,
  buildEditableExperience,
  parseAuthorRows,
  sanitizeAuthoredUrl,
} from '../../blocks/razer-minipage-block3/razer-minipage-block3.js';

const BLOCK_DIRECTORY = new URL('../../blocks/razer-minipage-block3/', import.meta.url);

function padIndex(index) {
  return String(index).padStart(2, '0');
}

function findByKey(items, key) {
  return items.find((item) => item.key === key);
}

function makeTextElement(text = '', options = {}) {
  const strong = options.strong
    ? makeTextElement(options.strong)
    : null;
  return {
    innerText: text,
    textContent: text,
    nextElementSibling: options.nextElementSibling || null,
    querySelector(selector) {
      return selector === 'strong' ? strong : null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function makeAttributeElement(attributes = {}) {
  return {
    ...attributes,
    getAttribute(name) {
      return attributes[name] === undefined ? null : String(attributes[name]);
    },
  };
}

function makeImageFixture(image, sources = []) {
  const sourceElements = sources.map((source) => makeAttributeElement(source));
  const imageElement = {
    ...makeAttributeElement(image),
    alt: image.alt,
    currentSrc: image.src,
    height: image.height,
    src: image.src,
    width: image.width,
  };
  const pictureElement = {
    children: [...sourceElements, imageElement],
    querySelector(selector) {
      return selector === 'img[src]' ? imageElement : null;
    },
    querySelectorAll(selector) {
      return selector.includes('source') ? sourceElements : [];
    },
  };
  imageElement.closest = (selector) => (selector === 'picture' ? pictureElement : null);
  imageElement.parentElement = pictureElement;
  return { imageElement, pictureElement, sourceElements };
}

function makeCell(text = '', options = {}) {
  const imageFixture = options.image
    ? makeImageFixture(options.image, options.sources)
    : null;
  const linkElement = options.link
    ? {
      ...makeAttributeElement({ href: options.link.href }),
      href: options.link.href,
      innerText: options.link.label,
      textContent: options.link.label,
    }
    : null;
  const paragraphs = (options.paragraphs || []).map((paragraph) => (
    makeTextElement(paragraph)
  ));
  const listItems = (options.listItems || []).map((item) => (
    makeTextElement(item.text || item, { strong: item.strong })
  ));
  const headings = (options.headings || []).map(({ title, body, lead }) => (
    makeTextElement(title, {
      nextElementSibling: makeTextElement(body, { strong: lead }),
    })
  ));

  return {
    innerText: text,
    textContent: text,
    querySelector(selector) {
      if (selector === 'img[src]') return imageFixture?.imageElement || null;
      if (selector === 'picture') return imageFixture?.pictureElement || null;
      if (selector === 'a[href]') return linkElement;
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes('source')) return imageFixture?.sourceElements || [];
      if (selector === 'p') return paragraphs;
      if (selector === 'li') return listItems;
      if (selector === 'h3') return headings;
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

function imageRecord(type, key, src, extra = {}) {
  return {
    type,
    key,
    image: {
      alt: `${key} image`,
      height: 600,
      src,
      width: 800,
    },
    ...extra,
  };
}

function stableKeys(items) {
  return items.map(({ key }) => key);
}

function countHandoffRows(source, type) {
  const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (source.match(new RegExp(`<td>\\s*${escapedType}\\s*</td>`, 'g')) || []).length;
}

test('default Block 3 inventory is compact and the exported limits are explicit', () => {
  const sourceSnapshot = JSON.stringify(DEFAULT_CONTENT);
  const { content, config } = buildEditableExperience([]);

  assert.equal(content.product.gallery.length, 3);
  assert.equal(content.highlights.length, 3);
  assert.equal(content.features.length, 0);
  assert.equal(content.specifications.length, 0);
  assert.equal(content.relatedProducts.length, 3);
  assert.equal(config.showFeatures, false);
  assert.equal(config.showSpecifications, false);
  assert.deepEqual(content.product.optionGroups.map(({ options }) => options.length), [4, 3, 2]);
  assert.equal(content.product.delivery.length, 2);
  assert.equal(content.product.trust.length, 3);
  assert.equal(JSON.stringify(DEFAULT_CONTENT), sourceSnapshot);

  assert.equal(LIMITS.gallery, 3);
  assert.equal(LIMITS.optionGroups, 3);
  assert.equal(LIMITS.optionsPerGroup, 4);
  assert.equal(LIMITS.delivery, 2);
  assert.equal(LIMITS.trust, 3);
  assert.equal(LIMITS.highlights, 3);
  assert.equal(LIMITS.features, 2);
  assert.equal(LIMITS.featureMedia, 1);
  assert.equal(LIMITS.specifications, 8);
  assert.equal(LIMITS.relatedProducts, 3);
  assert.equal(Object.isFrozen(LIMITS), true);
});

test('DOM reader retains Block 2 field positions for all 13 row types', () => {
  const image = {
    alt: 'Authored asset',
    height: 675,
    src: '/media/authored.webp',
    width: 1200,
  };
  const block = {
    children: [
      makeRow('setting', 'token-accent', '#55ee33'),
      makeRow('brand', makeCell('', { image }), '120', '40'),
      makeRow(
        'product',
        'SKU-3',
        'Black',
        'Authored Mouse',
        'Compact subtitle',
        'US$129.99',
        'US$159.99',
        '18% off',
        '/products/authored',
        'Pickup today',
      ),
      makeRow('gallery-image', '02', 'true', makeCell('', { image }), '1200', '675'),
      makeRow('option-group', '01', 'true', 'Finish'),
      makeRow('option', '01', '02', 'true', 'White', '+US$10.00', 'true'),
      makeRow('delivery', '01', 'true', 'Delivery', 'Free'),
      makeRow('trust', '02', 'true', 'Two-year warranty'),
      makeRow('highlight', '03', 'true', '35K optical sensor'),
      makeRow(
        'feature',
        '01',
        'true',
        'left',
        'Precision',
        'Optional authored feature',
        'One concise line',
        makeCell('First paragraph\nSecond paragraph', {
          paragraphs: ['First paragraph', 'Second paragraph'],
        }),
        makeCell('Speed — Instant', {
          listItems: [{ strong: 'Speed', text: 'Speed — Instant' }],
        }),
        makeCell('Sensor detail', {
          headings: [{
            body: 'Precision. Tracks on glass.',
            lead: 'Precision.',
            title: 'Sensor detail',
          }],
        }),
        'Optional note',
        makeCell('Explore', {
          link: { href: '/technology', label: 'Explore' },
        }),
      ),
      makeRow(
        'feature-media',
        '01',
        '01',
        'true',
        makeCell('', { image }),
        '1200',
        '675',
      ),
      makeRow('specification', '01', 'true', 'Sensor', 'Focus Pro 35K'),
      makeRow(
        'related-product',
        '01',
        'true',
        makeCell('', { image }),
        'Related Mouse',
        'US$99.99',
        'US$119.99',
        'Save 17%',
        '/products/related',
        'View details',
      ),
    ],
  };

  const records = parseAuthorRows(block);
  const byType = Object.fromEntries(records.map((record) => [record.type, record]));

  assert.deepEqual(records.map(({ type }) => type), [
    'setting',
    'brand',
    'product',
    'gallery-image',
    'option-group',
    'option',
    'delivery',
    'trust',
    'highlight',
    'feature',
    'feature-media',
    'specification',
    'related-product',
  ]);
  assert.deepEqual(
    { key: byType.setting.key, value: byType.setting.value },
    { key: 'token-accent', value: '#55ee33' },
  );
  assert.equal(byType.brand.image.src, '/media/authored.webp');
  assert.equal(byType.brand.width, 120);
  assert.equal(byType.brand.height, 40);
  assert.equal(byType.product.sku, 'SKU-3');
  assert.equal(byType.product.title, 'Authored Mouse');
  assert.equal(byType.product.pickup, 'Pickup today');
  assert.equal(byType['gallery-image'].key, 'gallery-02');
  assert.equal(byType['option-group'].key, 'group-01');
  assert.equal(byType.option.groupKey, 'group-01');
  assert.equal(byType.option.key, 'option-02');
  assert.equal(byType.option.selected, true);
  assert.equal(byType.delivery.value, 'Free');
  assert.equal(byType.trust.text, 'Two-year warranty');
  assert.equal(byType.highlight.text, '35K optical sensor');
  assert.equal(byType.feature.side, 'left');
  assert.deepEqual(byType.feature.paragraphs, ['First paragraph', 'Second paragraph']);
  assert.equal(byType.feature.bullets[0].lead, 'Speed');
  assert.equal(byType.feature.detailGroups[0].title, 'Sensor detail');
  assert.deepEqual(byType.feature.link, { href: '/technology', label: 'Explore' });
  assert.equal(byType['feature-media'].featureKey, 'feature-01');
  assert.equal(byType.specification.value, 'Focus Pro 35K');
  assert.equal(byType['related-product'].linkLabel, 'View details');
});

test('merge mode supports stable keyed edits, disabling, and explicit clearing', () => {
  const parsedProduct = parseAuthorRows({
    children: [
      makeRow(
        'product',
        '',
        '',
        '',
        '__empty__',
        '',
        '__empty__',
        '__empty__',
        '',
        '__empty__',
      ),
    ],
  })[0];
  const { content } = buildEditableExperience([
    parsedProduct,
    imageRecord('gallery-image', 'gallery-02', '/media/edited-gallery.webp'),
    { type: 'gallery-image', key: 'gallery-01', enabled: false },
    { type: 'option-group', key: 'group-02', enabled: false },
    {
      type: 'option',
      groupKey: 'group-02',
      key: 'option-01',
      label: 'Must not recreate disabled group',
    },
    { type: 'trust', key: 'trust-02', enabled: false },
    { type: 'highlight', key: 'highlight-03', text: 'Author-controlled highlight' },
  ]);

  assert.equal(content.product.subtitle, '');
  assert.equal(content.product.originalPrice, '');
  assert.equal(content.product.discount, '');
  assert.equal(content.product.pickup, '');
  assert.deepEqual(stableKeys(content.product.gallery), ['gallery-02', 'gallery-03']);
  assert.equal(findByKey(content.product.gallery, 'gallery-02').src, '/media/edited-gallery.webp');
  assert.equal(findByKey(content.product.optionGroups, 'group-02'), undefined);
  assert.equal(content.product.trust.length, 2);
  assert.equal(content.highlights[2], 'Author-controlled highlight');
});

test('replace mode sorts stable keys before applying every performance cap', () => {
  const keyOrder = [10, 3, 1, 5, 2, 4];
  const records = [
    { type: 'setting', key: 'content-mode', value: 'replace' },
    ...keyOrder.map((index) => imageRecord(
      'gallery-image',
      `gallery-${padIndex(index)}`,
      `/gallery-${index}.webp`,
    )),
    { type: 'gallery-image', key: 'gallery-00', enabled: false },
    ...[4, 2, 1, 3].map((index) => ({
      type: 'option-group',
      key: `group-${padIndex(index)}`,
      label: `Group ${index}`,
    })),
    ...[4, 2, 1, 3].flatMap((groupIndex) => keyOrder.slice(1).map((optionIndex) => ({
      type: 'option',
      groupKey: `group-${padIndex(groupIndex)}`,
      key: `option-${padIndex(optionIndex)}`,
      label: `Option ${optionIndex}`,
      selected: false,
    }))),
    ...[3, 1, 2].map((index) => ({
      type: 'delivery',
      key: `delivery-${padIndex(index)}`,
      label: `Delivery ${index}`,
      value: 'Free',
    })),
    ...[4, 2, 1, 3].map((index) => ({
      type: 'trust',
      key: `trust-${padIndex(index)}`,
      text: `Trust ${index}`,
    })),
    ...[4, 2, 1, 3].map((index) => ({
      type: 'highlight',
      key: `highlight-${padIndex(index)}`,
      text: `Highlight ${index}`,
    })),
    ...[3, 1, 2].map((index) => ({
      type: 'feature',
      key: `feature-${padIndex(index)}`,
      side: 'right',
      title: `Feature ${index}`,
    })),
    ...[3, 1, 2].flatMap((featureIndex) => [2, 1].map((mediaIndex) => imageRecord(
      'feature-media',
      `media-${padIndex(mediaIndex)}`,
      `/feature-${featureIndex}-${mediaIndex}.webp`,
      { featureKey: `feature-${padIndex(featureIndex)}` },
    ))),
    ...[9, 3, 1, 8, 2, 7, 4, 6, 5].map((index) => ({
      type: 'specification',
      key: `spec-${padIndex(index)}`,
      label: `Spec ${index}`,
      value: `Value ${index}`,
    })),
    ...[4, 2, 1, 3].map((index) => ({
      ...imageRecord(
        'related-product',
        `related-${padIndex(index)}`,
        `/related-${index}.webp`,
      ),
      title: `Related ${index}`,
      price: `US$${index}.00`,
      url: `/related-${index}`,
    })),
  ];

  const { content } = buildEditableExperience(records);

  assert.deepEqual(stableKeys(content.product.gallery), [
    'gallery-01',
    'gallery-02',
    'gallery-03',
  ]);
  assert.deepEqual(stableKeys(content.product.optionGroups), [
    'group-01',
    'group-02',
    'group-03',
  ]);
  content.product.optionGroups.forEach((group) => {
    assert.deepEqual(stableKeys(group.options), [
      'option-01',
      'option-02',
      'option-03',
      'option-04',
    ]);
  });
  assert.deepEqual(stableKeys(content.product.delivery), ['delivery-01', 'delivery-02']);
  assert.deepEqual(content.product.trust, ['Trust 1', 'Trust 2', 'Trust 3']);
  assert.deepEqual(content.highlights, ['Highlight 1', 'Highlight 2', 'Highlight 3']);
  assert.deepEqual(stableKeys(content.features), ['feature-01', 'feature-02']);
  content.features.forEach((feature) => {
    assert.deepEqual(stableKeys(feature.media), ['media-01']);
  });
  assert.deepEqual(stableKeys(content.specifications), [
    'spec-01',
    'spec-02',
    'spec-03',
    'spec-04',
    'spec-05',
    'spec-06',
    'spec-07',
    'spec-08',
  ]);
  assert.deepEqual(stableKeys(content.relatedProducts), [
    'related-01',
    'related-02',
    'related-03',
  ]);
});

test('option groups always retain one deterministic selected option', () => {
  const baseRecords = [
    { type: 'setting', key: 'content-mode', value: 'replace' },
    { type: 'option-group', key: 'group-01', label: 'Finish' },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-03',
      label: 'Third',
      selected: false,
    },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-01',
      label: 'First',
      selected: false,
    },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-02',
      label: 'Disabled selection',
      selected: true,
      enabled: false,
    },
  ];
  const fallback = buildEditableExperience(baseRecords).content.product.optionGroups[0];

  assert.equal(fallback.options[0].key, 'option-01');
  assert.equal(fallback.options[0].selected, true);
  assert.equal(fallback.options.filter(({ selected }) => selected).length, 1);

  const explicit = buildEditableExperience([
    ...baseRecords,
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-03',
      label: 'Third',
      selected: true,
    },
  ]).content.product.optionGroups[0];

  assert.equal(findByKey(explicit.options, 'option-03').selected, true);
  assert.equal(explicit.options.filter(({ selected }) => selected).length, 1);
});

test('authored URLs allow web and local targets but reject executable or protocol-relative URLs', () => {
  const executable = ['java', 'script:alert(1)'].join('');

  assert.equal(sanitizeAuthoredUrl(' https://www.razer.com/product '), 'https://www.razer.com/product');
  assert.equal(sanitizeAuthoredUrl('http://example.com/product'), 'http://example.com/product');
  assert.equal(sanitizeAuthoredUrl('/products/mouse'), '/products/mouse');
  assert.equal(sanitizeAuthoredUrl('./mouse'), './mouse');
  assert.equal(sanitizeAuthoredUrl('../mouse'), '../mouse');
  assert.equal(sanitizeAuthoredUrl('#details'), '#details');
  assert.equal(sanitizeAuthoredUrl(executable, '/fallback'), '/fallback');
  assert.equal(sanitizeAuthoredUrl('data:text/html,bad', '/fallback'), '/fallback');
  assert.equal(sanitizeAuthoredUrl('//example.com/redirect', '/fallback'), '/fallback');
  assert.equal(sanitizeAuthoredUrl('ftp://example.com/file', '/fallback'), '/fallback');

  const { content } = buildEditableExperience([
    { type: 'product', url: executable },
    { type: 'related-product', key: 'related-01', url: '//example.com/redirect' },
  ]);
  assert.equal(content.product.url, DEFAULT_CONTENT.product.url);
  assert.equal(content.relatedProducts[0].url, DEFAULT_CONTENT.relatedProducts[0].url);
});

test('accent color is scoped and validated while unknown legacy settings are ignored', () => {
  const baseline = buildEditableExperience([]);
  const legacy = buildEditableExperience([
    { type: 'setting', key: 'motion', value: 'true' },
    { type: 'setting', key: 'background-grid', value: 'true' },
    { type: 'setting', key: 'token-green', value: '#ff0000' },
  ]);
  const safe = buildEditableExperience([
    { type: 'setting', key: 'token-accent', value: '#ff5a1f' },
  ]);
  const unsafe = buildEditableExperience([
    {
      type: 'setting',
      key: 'token-accent',
      value: 'red; background: url(https://example.com/tracker)',
    },
  ]);
  const invalidHex = buildEditableExperience([
    { type: 'setting', key: 'token-accent', value: '#12345' },
  ]);
  const emptyLabel = buildEditableExperience([
    { type: 'setting', key: 'ui-buy-label', value: '' },
  ]);

  assert.deepEqual(legacy, baseline);
  assert.equal(safe.styles['--rm3-accent'], '#ff5a1f');
  assert.equal(unsafe.styles['--rm3-accent'], undefined);
  assert.equal(invalidHex.styles['--rm3-accent'], undefined);
  assert.equal(emptyLabel.content.ui.buyLabel, DEFAULT_CONTENT.ui.buyLabel);
});

test('responsive picture sources and intrinsic dimensions survive parsing and merging', () => {
  const sources = [
    {
      media: '(min-width: 900px)',
      sizes: '50vw',
      srcset: '/media/mouse-wide.webp 1600w, /media/mouse-wide-800.webp 800w',
      type: 'image/webp',
    },
    {
      media: '(min-width: 600px)',
      sizes: '80vw',
      srcset: '/media/mouse-medium.avif 1000w',
      type: 'image/avif',
    },
  ];
  const block = {
    children: [
      makeRow(
        'gallery-image',
        '01',
        'true',
        makeCell('', {
          image: {
            alt: 'Responsive authored mouse',
            height: 720,
            src: '/media/mouse-fallback.webp',
            width: 1280,
          },
          sources,
        }),
        '1600',
        '900',
      ),
    ],
  };
  const record = parseAuthorRows(block)[0];

  assert.equal(record.image.src, '/media/mouse-fallback.webp');
  assert.equal(record.image.alt, 'Responsive authored mouse');
  assert.equal(record.image.width, 1280);
  assert.equal(record.image.height, 720);
  assert.deepEqual(record.image.sources, sources);

  const { content } = buildEditableExperience([
    { type: 'setting', key: 'content-mode', value: 'replace' },
    record,
  ]);
  const [galleryImage] = content.product.gallery;

  assert.equal(galleryImage.width, 1600);
  assert.equal(galleryImage.height, 900);
  assert.equal(galleryImage.width / galleryImage.height, 16 / 9);
  assert.deepEqual(galleryImage.sources, sources);
});

test('standalone sources stay within budgets and omit expensive legacy behavior', async () => {
  const [javascript, css] = await Promise.all([
    readFile(new URL('razer-minipage-block3.js', BLOCK_DIRECTORY), 'utf8'),
    readFile(new URL('razer-minipage-block3.css', BLOCK_DIRECTORY), 'utf8'),
  ]);

  assert.ok(gzipSync(javascript).byteLength < 10 * 1024, 'Block 3 JS must stay below 10 KB gzip');
  assert.ok(gzipSync(css).byteLength < 6 * 1024, 'Block 3 CSS must stay below 6 KB gzip');
  assert.doesNotMatch(
    javascript,
    /(?:from\s*|import\s*)['"][^'"]*(?:razer-minipage-block2|\/razer-minipage\/)/,
  );
  assert.doesNotMatch(javascript, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.doesNotMatch(css, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.doesNotMatch(
    javascript,
    /\b(?:IntersectionObserver|MutationObserver|ResizeObserver|requestAnimationFrame)\b/,
  );
  assert.doesNotMatch(
    javascript,
    /addEventListener\s*\(\s*['"`](?:scroll|resize)['"`]/,
  );
  assert.doesNotMatch(javascript, /\bon(?:scroll|resize)\s*=/);

  const listenerTypes = [...javascript.matchAll(
    /addEventListener\s*\(\s*['"`]([^'"`]+)['"`]/g,
  )].map((match) => match[1]);
  assert.deepEqual(listenerTypes, ['click']);

  assert.doesNotMatch(css, /@import\b/i);
  assert.match(css, /\.razer-minipage-block3/);
  assert.doesNotMatch(
    css,
    /(^|})\s*(?::root|html|body|header|footer|main)\s*(?:,|\{)/m,
  );
  assert.doesNotMatch(css, /(^|})\s*\*\s*(?:,|\{)/m);
});

test('DA.live handoff contains only compact defaults and native metadata', async () => {
  const handoff = await readFile(
    new URL('razer-minipage-block3-da-live.html', BLOCK_DIRECTORY),
    'utf8',
  );
  const tableNames = [...handoff.matchAll(
    /<table>\s*<tbody>\s*<tr>\s*<td>\s*([^<]+?)\s*<\/td>/g,
  )].map((match) => match[1]);

  assert.deepEqual(tableNames, ['razer-minipage-block3', 'Metadata']);
  assert.equal(countHandoffRows(handoff, 'gallery-image'), 3);
  assert.equal(countHandoffRows(handoff, 'option-group'), 3);
  assert.equal(countHandoffRows(handoff, 'option'), 9);
  assert.equal(countHandoffRows(handoff, 'delivery'), 2);
  assert.equal(countHandoffRows(handoff, 'trust'), 3);
  assert.equal(countHandoffRows(handoff, 'highlight'), 3);
  assert.equal(countHandoffRows(handoff, 'feature'), 0);
  assert.equal(countHandoffRows(handoff, 'feature-media'), 0);
  assert.equal(countHandoffRows(handoff, 'specification'), 0);
  assert.equal(countHandoffRows(handoff, 'related-product'), 3);
  assert.doesNotMatch(handoff, /1500x1000-[123]\.jpg/);
  assert.match(handoff, /<td>\s*Title\s*<\/td>\s*<td>\s*[^<]+\s*<\/td>/);
  assert.match(handoff, /<td>\s*Description\s*<\/td>\s*<td>\s*[^<]+\s*<\/td>/);
  assert.match(
    handoff,
    /<td>\s*Image\s*<\/td>\s*<td>\s*<img\s+[^>]*src="https?:\/\/[^"]+"/,
  );
});

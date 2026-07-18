import DEFAULT_CONTENT from '../razer-minipage/razer-minipage-content.js';
import {
  decorateRazerExperience,
  normalizeKey,
} from '../razer-minipage/razer-minipage.js';

const CLEAR_TOKEN = '__empty__';
const TRUTHY_VALUES = new Set(['1', 'on', 'true', 'yes']);
const FALSY_VALUES = new Set(['0', 'off', 'false', 'no']);
const SAFE_LENGTH = /^(?:0|(?:\d+(?:\.\d+)?)(?:px|em|rem|vh|vw|vmin|vmax|ch|%)|var\(--[\w-]+(?:,\s*[^)]+)?\)|(?:calc|min|max|clamp)\([^;{}]+\))$/;
const SAFE_COLOR = /^(?:#[\da-f]{3,8}|[a-z]+|var\(--[\w-]+(?:,\s*[^)]+)?\)|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([^;{}]+\))$/i;
const SAFE_FONT_STACK = /^[\w\s"',.-]+$/;
const SAFE_RGB = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/;
const SAFE_TRANSITION = /^\d+(?:\.\d+)?m?s\s+(?:linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\([^;{}]+\))$/;
const SAFE_EASING = /^(?:linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\([^;{}]+\))$/;
const SAFE_SHADOW = /^(?:none|[\w\s#(),.%/+*-]+)$/i;
const URL_START = /^(?:https?:\/\/|\/(?!\/)|\.{1,2}\/|#)/i;

export const UI_SETTING_PATHS = Object.freeze({
  'ui-region-label': ['ui', 'regionLabel'],
  'ui-skip-navigation-label': ['ui', 'skipNavigationLabel'],
  'ui-gallery-show-image-pattern': ['ui', 'gallery', 'showImagePattern'],
  'ui-gallery-previous-label': ['ui', 'gallery', 'previousLabel'],
  'ui-gallery-next-label': ['ui', 'gallery', 'nextLabel'],
  'ui-gallery-previous-symbol': ['ui', 'gallery', 'previousSymbol'],
  'ui-gallery-next-symbol': ['ui', 'gallery', 'nextSymbol'],
  'ui-gallery-counter-pattern': ['ui', 'gallery', 'counterPattern'],
  'ui-gallery-images-label': ['ui', 'gallery', 'imagesLabel'],
  'ui-delivery-heading': ['ui', 'hero', 'deliveryHeading'],
  'ui-pickup-heading': ['ui', 'hero', 'pickupHeading'],
  'ui-add-to-cart-label': ['ui', 'hero', 'addToCartLabel'],
  'ui-option-selection-pattern': ['ui', 'hero', 'optionSelectionPattern'],
  'ui-highlights-label': ['ui', 'highlightsLabel'],
  'ui-feature-bullet-separator': ['ui', 'feature', 'bulletSeparator'],
  'ui-specifications-eyebrow': ['ui', 'specifications', 'eyebrow'],
  'ui-specifications-title': ['ui', 'specifications', 'title'],
  'ui-specifications-caption': ['ui', 'specifications', 'caption'],
  'ui-related-eyebrow': ['ui', 'related', 'eyebrow'],
  'ui-related-title': ['ui', 'related', 'title'],
  'ui-related-card-position-pattern': ['ui', 'related', 'cardPositionPattern'],
  'ui-related-view-details-label': ['ui', 'related', 'viewDetailsLabel'],
  'ui-related-previous-label': ['ui', 'related', 'previousLabel'],
  'ui-related-next-label': ['ui', 'related', 'nextLabel'],
  'ui-related-previous-symbol': ['ui', 'related', 'previousSymbol'],
  'ui-related-next-symbol': ['ui', 'related', 'nextSymbol'],
  'ui-related-region-label': ['ui', 'related', 'regionLabel'],
  'ui-navigation-brand-aria-label': ['ui', 'navigation', 'brandAriaLabel'],
  'ui-navigation-aria-label': ['ui', 'navigation', 'ariaLabel'],
  'ui-navigation-overview-label': ['ui', 'navigation', 'overviewLabel'],
  'ui-navigation-features-label': ['ui', 'navigation', 'featuresLabel'],
  'ui-navigation-specifications-label': ['ui', 'navigation', 'specificationsLabel'],
  'ui-navigation-related-label': ['ui', 'navigation', 'relatedLabel'],
  'ui-navigation-buy-now-label': ['ui', 'navigation', 'buyNowLabel'],
  'ui-footer-tagline': ['ui', 'footer', 'tagline'],
  'ui-footer-descriptor': ['ui', 'footer', 'descriptor'],
});

export const THEME_TOKEN_DEFINITIONS = Object.freeze({
  'token-black': { property: '--rm-black', type: 'color' },
  'token-ink': { property: '--rm-ink', type: 'color' },
  'token-surface': { property: '--rm-surface', type: 'color' },
  'token-surface-raised': { property: '--rm-surface-raised', type: 'color' },
  'token-border': { property: '--rm-border', type: 'color' },
  'token-border-strong': { property: '--rm-border-strong', type: 'color' },
  'token-green': { property: '--rm-green', type: 'color' },
  'token-green-rgb': { property: '--rm-green-rgb', type: 'rgb' },
  'token-green-hover': { property: '--rm-green-hover', type: 'color' },
  'token-green-deep': { property: '--rm-green-deep', type: 'color' },
  'token-white': { property: '--rm-white', type: 'color' },
  'token-muted': { property: '--rm-muted', type: 'color' },
  'token-dim': { property: '--rm-dim', type: 'color' },
  'token-display': { property: '--rm-display', type: 'font' },
  'token-body': { property: '--rm-body', type: 'font' },
  'token-mono': { property: '--rm-mono', type: 'font' },
  'token-content-max': { property: '--rm-content-max', type: 'length' },
  'token-copy-max': { property: '--rm-copy-max', type: 'length' },
  'token-gutter': { property: '--rm-gutter', type: 'length' },
  'token-section-space': { property: '--rm-section-space', type: 'length' },
  'token-nav-height': { property: '--rm-nav-height', type: 'length' },
  'token-grid-size': { property: '--rm-grid-size', type: 'length' },
  'token-fast': { property: '--rm-fast', type: 'transition' },
  'token-ease-out': { property: '--rm-ease-out', type: 'easing' },
  'token-green-shadow': { property: '--rm-green-shadow', type: 'shadow' },
});

const BEHAVIOR_DEFAULTS = Object.freeze({
  navigation: true,
  footer: true,
  motion: true,
  'scroll-progress': true,
  'background-grid': true,
  'show-highlights': true,
  'show-features': true,
  'show-specifications': true,
  'show-related-products': true,
});

function padIndex(index) {
  return String(index + 1).padStart(2, '0');
}

function normalizeItemKey(value, prefix) {
  const key = normalizeKey(value);
  if (!key) return '';
  if (/^\d+$/.test(key)) return `${prefix}-${key.padStart(2, '0')}`;
  return key;
}

function cloneContent(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function cellText(cell) {
  return String(cell?.textContent || '').replace(/\u00a0/g, ' ').trim();
}

function readText(cell) {
  const value = cellText(cell);
  if (!value) return undefined;
  if (value.toLowerCase() === CLEAR_TOKEN) return '';
  return value;
}

function readBoolean(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined || rawValue === '') return rawValue;
  const value = rawValue.toLowerCase();
  if (TRUTHY_VALUES.has(value)) return true;
  if (FALSY_VALUES.has(value)) return false;
  return undefined;
}

function readPositiveInteger(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined || rawValue === '') return rawValue;
  const value = Number.parseInt(rawValue, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function elementTextLines(element) {
  if (!element) return [];
  const listItems = [...(element.querySelectorAll?.('li') || [])];
  if (listItems.length) return listItems.map((item) => cellText(item)).filter(Boolean);
  const paragraphs = [...(element.querySelectorAll?.('p') || [])];
  if (paragraphs.length) return paragraphs.map((item) => cellText(item)).filter(Boolean);
  const renderedText = typeof element.innerText === 'string'
    ? element.innerText
    : element.textContent;
  return String(renderedText || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readParagraphs(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return [];
  return elementTextLines(cell);
}

function splitLeadAndText(element) {
  const fullText = cellText(element);
  const strong = element?.querySelector?.('strong');
  if (strong) {
    const lead = cellText(strong);
    const text = fullText
      .slice(fullText.indexOf(lead) + lead.length)
      .replace(/^[\s:—–-]+/, '')
      .trim();
    return { lead, text };
  }
  const separator = fullText.match(/\s(?:—|–|-)\s/);
  if (!separator || separator.index === undefined) return { text: fullText };
  return {
    lead: fullText.slice(0, separator.index).trim(),
    text: fullText.slice(separator.index + separator[0].length).trim(),
  };
}

function readBullets(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return [];
  const items = [...(cell?.querySelectorAll?.('li') || [])];
  if (items.length) return items.map(splitLeadAndText);
  return elementTextLines(cell).map((line) => splitLeadAndText({ textContent: line }));
}

function readDetails(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return [];
  const headings = [...(cell?.querySelectorAll?.('h3') || [])];
  if (!headings.length) return [];

  return headings.map((heading) => {
    const paragraph = heading.nextElementSibling;
    const detail = splitLeadAndText(paragraph);
    return {
      title: cellText(heading),
      lead: detail.lead || '',
      text: detail.text || '',
    };
  });
}

function readSpecificationValue(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return '';
  const values = elementTextLines(cell);
  return values.length > 1 ? values : (values[0] || rawValue);
}

function readLink(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return null;
  const anchor = cell?.querySelector?.('a[href]');
  if (anchor) {
    return {
      label: cellText(anchor),
      href: anchor.getAttribute?.('href') || anchor.href || '',
    };
  }
  const parts = rawValue.split(/\s*\|\|\s*/);
  if (parts.length > 1) return { label: parts[0], href: parts.slice(1).join(' || ') };
  if (URL_START.test(rawValue)) return { label: 'Learn more', href: rawValue };
  return { label: rawValue, href: '' };
}

function readImage(cell) {
  const image = cell?.querySelector?.('img[src]');
  if (image) {
    return {
      src: image.getAttribute?.('src') || image.currentSrc || image.src || '',
      alt: image.getAttribute?.('alt') || image.alt || '',
      width: Number.parseInt(image.getAttribute?.('width') || image.width, 10) || undefined,
      height: Number.parseInt(image.getAttribute?.('height') || image.height, 10) || undefined,
    };
  }
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') {
    return {
      src: '',
      alt: '',
      width: 1,
      height: 1,
    };
  }
  const anchor = cell?.querySelector?.('a[href]');
  const parts = rawValue.split(/\s*\|\|\s*/);
  return {
    src: anchor?.getAttribute?.('href') || anchor?.href || parts[0],
    alt: anchor ? cellText(anchor) : (parts[1] || ''),
    width: undefined,
    height: undefined,
  };
}

function parseRow(row, rowIndex) {
  const cells = [...(row?.children || [])];
  const type = normalizeKey(cellText(cells[0]));
  const base = { type, rowIndex };

  switch (type) {
    case 'setting':
      return { ...base, key: normalizeKey(cellText(cells[1])), value: readText(cells[2]) };
    case 'brand':
      return {
        ...base,
        image: readImage(cells[1]),
        width: readPositiveInteger(cells[2]),
        height: readPositiveInteger(cells[3]),
      };
    case 'product':
      return {
        ...base,
        sku: readText(cells[1]),
        color: readText(cells[2]),
        title: readText(cells[3]),
        subtitle: readText(cells[4]),
        price: readText(cells[5]),
        originalPrice: readText(cells[6]),
        discount: readText(cells[7]),
        url: readText(cells[8]),
        pickup: readText(cells[9]),
      };
    case 'gallery-image':
      return {
        ...base,
        key: normalizeItemKey(cellText(cells[1]), 'gallery'),
        enabled: readBoolean(cells[2]),
        image: readImage(cells[3]),
        width: readPositiveInteger(cells[4]),
        height: readPositiveInteger(cells[5]),
      };
    case 'option-group':
      return {
        ...base,
        key: normalizeItemKey(cellText(cells[1]), 'group'),
        enabled: readBoolean(cells[2]),
        label: readText(cells[3]),
      };
    case 'option':
      return {
        ...base,
        groupKey: normalizeItemKey(cellText(cells[1]), 'group'),
        key: normalizeItemKey(cellText(cells[2]), 'option'),
        enabled: readBoolean(cells[3]),
        label: readText(cells[4]),
        price: readText(cells[5]),
        selected: readBoolean(cells[6]),
      };
    case 'delivery':
      return {
        ...base,
        key: normalizeItemKey(cellText(cells[1]), 'delivery'),
        enabled: readBoolean(cells[2]),
        label: readText(cells[3]),
        value: readText(cells[4]),
      };
    case 'trust':
    case 'highlight':
      return {
        ...base,
        key: normalizeItemKey(
          cellText(cells[1]),
          type === 'trust' ? 'trust' : 'highlight',
        ),
        enabled: readBoolean(cells[2]),
        text: readText(cells[3]),
      };
    case 'feature':
      return {
        ...base,
        key: normalizeItemKey(cellText(cells[1]), 'feature'),
        enabled: readBoolean(cells[2]),
        side: readText(cells[3]),
        eyebrow: readText(cells[4]),
        title: readText(cells[5]),
        subtitle: readText(cells[6]),
        paragraphs: readParagraphs(cells[7]),
        bullets: readBullets(cells[8]),
        detailGroups: readDetails(cells[9]),
        note: readText(cells[10]),
        link: readLink(cells[11]),
      };
    case 'feature-media':
      return {
        ...base,
        featureKey: normalizeItemKey(cellText(cells[1]), 'feature'),
        key: normalizeItemKey(cellText(cells[2]), 'media'),
        enabled: readBoolean(cells[3]),
        image: readImage(cells[4]),
        width: readPositiveInteger(cells[5]),
        height: readPositiveInteger(cells[6]),
      };
    case 'specification':
      return {
        ...base,
        key: normalizeItemKey(cellText(cells[1]), 'spec'),
        enabled: readBoolean(cells[2]),
        label: readText(cells[3]),
        value: readSpecificationValue(cells[4]),
      };
    case 'related-product':
      return {
        ...base,
        key: normalizeItemKey(cellText(cells[1]), 'related'),
        enabled: readBoolean(cells[2]),
        image: readImage(cells[3]),
        title: readText(cells[4]),
        price: readText(cells[5]),
        originalPrice: readText(cells[6]),
        discount: readText(cells[7]),
        url: readText(cells[8]),
        linkLabel: readText(cells[9]),
      };
    default:
      return null;
  }
}

export function parseAuthorRows(block) {
  return [...(block?.children || [])]
    .map((row, index) => parseRow(row, index))
    .filter(Boolean);
}

function setPath(target, path, value) {
  let cursor = target;
  path.slice(0, -1).forEach((part) => {
    cursor = cursor[part];
  });
  cursor[path.at(-1)] = value;
}

function mergeDefined(target, source, fields) {
  fields.forEach((field) => {
    if (source[field] !== undefined) target[field] = source[field];
  });
  return target;
}

function withKeys(content) {
  content.product.gallery = content.product.gallery.map((image, index) => ({
    ...image,
    key: image.key || `gallery-${padIndex(index)}`,
  }));
  content.product.optionGroups = content.product.optionGroups.map((group, groupIndex) => ({
    ...group,
    key: group.key || `group-${padIndex(groupIndex)}`,
    options: group.options.map((option, optionIndex) => ({
      ...option,
      selected: option.selected === true,
      key: option.key || `option-${padIndex(optionIndex)}`,
    })),
  }));
  content.product.delivery = content.product.delivery.map((item, index) => ({
    ...item,
    key: item.key || `delivery-${padIndex(index)}`,
  }));
  content.product.trust = content.product.trust.map((text, index) => ({
    key: `trust-${padIndex(index)}`,
    text,
  }));
  content.highlights = content.highlights.map((text, index) => ({
    key: `highlight-${padIndex(index)}`,
    text,
  }));
  content.features = content.features.map((feature, featureIndex) => ({
    ...feature,
    key: feature.key || `feature-${padIndex(featureIndex)}`,
    media: feature.media.map((image, imageIndex) => ({
      ...image,
      key: image.key || `media-${padIndex(imageIndex)}`,
    })),
  }));
  content.specifications = content.specifications.map((specification, index) => ({
    ...specification,
    key: specification.key || `spec-${padIndex(index)}`,
  }));
  content.relatedProducts = content.relatedProducts.map((product, index) => ({
    ...product,
    key: product.key || `related-${padIndex(index)}`,
  }));
  return content;
}

function sortByKey(items) {
  return [...items].sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
}

function mergeCollection(defaultItems, authoredItems, mode, buildItem) {
  const replace = mode === 'replace' && authoredItems.length > 0;
  const items = new Map((replace ? [] : defaultItems).map((item) => [item.key, item]));

  authoredItems.forEach((authored, index) => {
    const key = authored.key || `authored-${padIndex(index)}`;
    if (authored.enabled === false) {
      items.delete(key);
      return;
    }
    const item = buildItem(items.get(key), { ...authored, key });
    if (item) items.set(key, item);
  });

  return sortByKey([...items.values()]);
}

export function sanitizeAuthoredUrl(value, fallback = '') {
  if (value === undefined) return fallback;
  const url = String(value).trim();
  if (url === '') return '';
  return URL_START.test(url) ? url : fallback;
}

function normalizeImage(image, fallback = {}) {
  if (image === undefined) return { ...fallback };
  const normalized = {
    ...fallback,
    ...image,
    src: sanitizeAuthoredUrl(image.src, fallback.src || ''),
  };
  normalized.width = Number.isFinite(normalized.width) && normalized.width > 0
    ? normalized.width
    : (fallback.width || 1);
  normalized.height = Number.isFinite(normalized.height) && normalized.height > 0
    ? normalized.height
    : (fallback.height || 1);
  return normalized;
}

function parseSettingBoolean(settings, key, fallback) {
  if (!settings.has(key)) return fallback;
  const value = String(settings.get(key)).toLowerCase();
  if (TRUTHY_VALUES.has(value)) return true;
  if (FALSY_VALUES.has(value)) return false;
  return fallback;
}

function validateThemeValue(value, type) {
  if (typeof value !== 'string' || !value || value.includes(';')) return false;
  if (type === 'color') return SAFE_COLOR.test(value);
  if (type === 'length') return SAFE_LENGTH.test(value);
  if (type === 'font') return SAFE_FONT_STACK.test(value);
  if (type === 'transition') return SAFE_TRANSITION.test(value);
  if (type === 'easing') return SAFE_EASING.test(value);
  if (type === 'shadow') {
    return SAFE_SHADOW.test(value) && /\d/.test(value) && !/url\s*\(/i.test(value);
  }
  if (type === 'rgb') {
    const match = value.match(SAFE_RGB);
    return Boolean(match && match.slice(1).every((channel) => Number(channel) <= 255));
  }
  return false;
}

function hexToRgb(value) {
  const hex = value.match(/^#([\da-f]{6})$/i)?.[1];
  if (!hex) return '';
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ].join(' ');
}

function buildThemeStyles(settings) {
  const styles = {};
  Object.entries(THEME_TOKEN_DEFINITIONS).forEach(([key, definition]) => {
    if (!settings.has(key)) return;
    const value = settings.get(key);
    if (!validateThemeValue(value, definition.type)) return;
    styles[definition.property] = value;
  });

  if (settings.has('token-green') && !settings.has('token-green-rgb')) {
    const derivedRgb = hexToRgb(settings.get('token-green'));
    if (derivedRgb) styles['--rm-green-rgb'] = derivedRgb;
  }
  return styles;
}

function mergeProduct(content, records) {
  records.filter((record) => record.type === 'product').forEach((record) => {
    mergeDefined(content.product, record, [
      'sku',
      'color',
      'title',
      'subtitle',
      'price',
      'originalPrice',
      'discount',
      'pickup',
    ]);
    if (record.url !== undefined) {
      content.product.url = sanitizeAuthoredUrl(record.url, content.product.url);
    }
  });
}

function mergeBrand(content, records) {
  records.filter((record) => record.type === 'brand').forEach((record) => {
    const image = normalizeImage(record.image, content.ui.navigation.logo);
    if (record.width !== undefined) image.width = record.width;
    if (record.height !== undefined) image.height = record.height;
    content.ui.navigation.logo = image;
  });
}

function mergeGallery(content, records, mode) {
  const authored = records.filter((record) => record.type === 'gallery-image');
  content.product.gallery = mergeCollection(
    content.product.gallery,
    authored,
    mode,
    (existing, record) => {
      const fallback = existing || {};
      const image = normalizeImage(record.image, fallback);
      if (record.width !== undefined) image.width = record.width;
      if (record.height !== undefined) image.height = record.height;
      return image.src ? { ...image, key: record.key } : null;
    },
  );
}

function mergeOptions(content, records, mode) {
  const groupRecords = records.filter((record) => record.type === 'option-group');
  const optionRecords = records.filter((record) => record.type === 'option');
  const disabledGroupKeys = new Set(
    groupRecords
      .filter((record) => record.enabled === false)
      .map((record) => record.key),
  );
  content.product.optionGroups = mergeCollection(
    content.product.optionGroups,
    groupRecords,
    mode,
    (existing, record) => {
      const fallback = existing || { options: [] };
      return mergeDefined(
        { ...fallback, key: record.key, options: fallback.options || [] },
        record,
        ['label'],
      );
    },
  );

  const knownGroups = new Map(content.product.optionGroups.map((group) => [group.key, group]));
  optionRecords.forEach((record) => {
    if (
      !record.groupKey
      || knownGroups.has(record.groupKey)
      || disabledGroupKeys.has(record.groupKey)
    ) return;
    const group = { key: record.groupKey, label: record.groupKey, options: [] };
    content.product.optionGroups.push(group);
    knownGroups.set(group.key, group);
  });

  content.product.optionGroups = sortByKey(content.product.optionGroups).map((group) => {
    const authored = optionRecords.filter(
      (record) => record.groupKey === group.key && !disabledGroupKeys.has(record.groupKey),
    );
    const options = mergeCollection(
      group.options || [],
      authored,
      mode,
      (existing, record) => mergeDefined(
        { ...(existing || {}), key: record.key },
        record,
        ['label', 'price', 'selected'],
      ),
    );
    const authoredSelection = authored.find((record) => record.selected === true)?.key;
    let selectedFound = false;
    options.forEach((option, index) => {
      const selected = authoredSelection
        ? option.key === authoredSelection
        : (!selectedFound && (option.selected === true || index === 0));
      option.selected = selected;
      selectedFound ||= selected;
    });
    return { ...group, options };
  });
}

function mergeSimpleTextCollection(records, mode, type, currentItems) {
  return mergeCollection(
    currentItems,
    records.filter((record) => record.type === type),
    mode,
    (existing, record) => mergeDefined(
      { ...(existing || {}), key: record.key },
      record,
      ['text'],
    ),
  );
}

function mergeDelivery(content, records, mode) {
  content.product.delivery = mergeCollection(
    content.product.delivery,
    records.filter((record) => record.type === 'delivery'),
    mode,
    (existing, record) => mergeDefined(
      { ...(existing || {}), key: record.key },
      record,
      ['label', 'value'],
    ),
  );
}

function mergeFeatures(content, records, mode) {
  const featureRecords = records.filter((record) => record.type === 'feature');
  const mediaRecords = records.filter((record) => record.type === 'feature-media');
  content.features = mergeCollection(
    content.features,
    featureRecords,
    mode,
    (existing, record) => {
      const fallback = existing || { media: [], side: 'right' };
      const feature = mergeDefined(
        { ...fallback, key: record.key, media: fallback.media || [] },
        record,
        ['side', 'eyebrow', 'title', 'subtitle', 'paragraphs', 'bullets', 'detailGroups', 'note', 'link'],
      );
      if (record.link && typeof record.link === 'object') {
        feature.link = {
          ...record.link,
          href: sanitizeAuthoredUrl(record.link.href, fallback.link?.href || ''),
        };
      }
      if (!['left', 'right'].includes(feature.side)) feature.side = 'right';
      return feature;
    },
  );

  content.features = content.features.map((feature) => {
    const authored = mediaRecords.filter((record) => record.featureKey === feature.key);
    const media = mergeCollection(
      feature.media || [],
      authored,
      mode,
      (existing, record) => {
        const fallback = existing || {};
        const image = normalizeImage(record.image, fallback);
        if (record.width !== undefined) image.width = record.width;
        if (record.height !== undefined) image.height = record.height;
        return image.src ? { ...image, key: record.key } : null;
      },
    );
    return { ...feature, media };
  });
}

function mergeSpecifications(content, records, mode) {
  content.specifications = mergeCollection(
    content.specifications,
    records.filter((record) => record.type === 'specification'),
    mode,
    (existing, record) => mergeDefined(
      { ...(existing || {}), key: record.key },
      record,
      ['label', 'value'],
    ),
  );
}

function mergeRelatedProducts(content, records, mode) {
  content.relatedProducts = mergeCollection(
    content.relatedProducts,
    records.filter((record) => record.type === 'related-product'),
    mode,
    (existing, record) => {
      const fallback = existing || { image: {} };
      const product = mergeDefined(
        { ...fallback, key: record.key },
        record,
        ['title', 'price', 'originalPrice', 'discount', 'linkLabel'],
      );
      product.image = normalizeImage(record.image, fallback.image);
      if (record.url !== undefined) {
        product.url = sanitizeAuthoredUrl(record.url, fallback.url || '');
      }
      return product.image.src && product.title ? product : null;
    },
  );
}

/**
 * Builds an isolated authored content/config snapshot from normalized rows.
 * @param {Array<object>} records Parsed author rows.
 * @param {object} sourceContent Default experience content.
 * @returns {{content: object, config: object, styles: object, backgroundGrid: boolean}}
 */
export function buildEditableExperience(records, sourceContent = DEFAULT_CONTENT) {
  const content = withKeys(cloneContent(sourceContent));
  const settings = new Map();
  records.filter((record) => record.type === 'setting').forEach((record) => {
    if (record.key && record.value !== undefined) settings.set(record.key, record.value);
  });
  const mode = settings.get('content-mode') === 'replace' ? 'replace' : 'merge';

  Object.entries(UI_SETTING_PATHS).forEach(([key, path]) => {
    if (!settings.has(key)) return;
    let value = settings.get(key);
    if (key === 'ui-feature-bullet-separator' && value) value = ` ${value.trim()} `;
    setPath(content, path, value);
  });

  mergeBrand(content, records);
  mergeProduct(content, records);
  mergeGallery(content, records, mode);
  mergeOptions(content, records, mode);
  mergeDelivery(content, records, mode);
  content.product.trust = mergeSimpleTextCollection(
    records,
    mode,
    'trust',
    content.product.trust,
  );
  content.highlights = mergeSimpleTextCollection(
    records,
    mode,
    'highlight',
    content.highlights,
  );
  mergeFeatures(content, records, mode);
  mergeSpecifications(content, records, mode);
  mergeRelatedProducts(content, records, mode);

  content.product.trust = content.product.trust.map((item) => item.text);
  content.highlights = content.highlights.map((item) => item.text);
  content.id = 'razer-minipage-block2-authored';

  const authoredStickyOffset = settings.get('sticky-offset');
  const stickyOffset = authoredStickyOffset && SAFE_LENGTH.test(authoredStickyOffset)
    ? authoredStickyOffset
    : 'var(--nav-height, 64px)';
  const config = {
    navigation: parseSettingBoolean(settings, 'navigation', BEHAVIOR_DEFAULTS.navigation),
    footer: parseSettingBoolean(settings, 'footer', BEHAVIOR_DEFAULTS.footer),
    motion: parseSettingBoolean(settings, 'motion', BEHAVIOR_DEFAULTS.motion),
    scrollProgress: parseSettingBoolean(
      settings,
      'scroll-progress',
      BEHAVIOR_DEFAULTS['scroll-progress'],
    ),
    showHighlights: parseSettingBoolean(
      settings,
      'show-highlights',
      BEHAVIOR_DEFAULTS['show-highlights'],
    ),
    showFeatures: parseSettingBoolean(
      settings,
      'show-features',
      BEHAVIOR_DEFAULTS['show-features'],
    ),
    showSpecifications: parseSettingBoolean(
      settings,
      'show-specifications',
      BEHAVIOR_DEFAULTS['show-specifications'],
    ),
    showRelatedProducts: parseSettingBoolean(
      settings,
      'show-related-products',
      BEHAVIOR_DEFAULTS['show-related-products'],
    ),
    automaticStickyOffset: !authoredStickyOffset,
    stickyOffset,
    productUrl: sanitizeAuthoredUrl(content.product.url, DEFAULT_CONTENT.product.url),
  };

  return {
    backgroundGrid: parseSettingBoolean(
      settings,
      'background-grid',
      BEHAVIOR_DEFAULTS['background-grid'],
    ),
    config,
    content,
    styles: buildThemeStyles(settings),
  };
}

/**
 * Decorates a structured DA.live `razer-minipage-block2` block.
 * @param {Element} block The already-created EDS block element.
 */
export default function decorate(block) {
  if (block.dataset.razerMinipageReady === 'true') return;
  const experience = buildEditableExperience(parseAuthorRows(block));
  Object.entries(experience.styles).forEach(([property, value]) => {
    block.style.setProperty(property, value);
  });
  block.classList.toggle('rm-no-background-grid', !experience.backgroundGrid);
  decorateRazerExperience(block, {
    content: experience.content,
    config: experience.config,
    instancePrefix: 'razer-minipage-block2',
  });
}

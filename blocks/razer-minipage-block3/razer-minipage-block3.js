const CLEAR_TOKEN = '__empty__';
const TRUTHY_VALUES = new Set(['1', 'on', 'true', 'yes']);
const FALSY_VALUES = new Set(['0', 'off', 'false', 'no']);
const SAFE_URL_START = /^(?:https?:\/\/|\/(?!\/)|\.{1,2}\/|#)/i;
const SAFE_COLOR = /^(?:#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([^;{}]+\))$/i;

export const LIMITS = Object.freeze({
  gallery: 3,
  optionGroups: 3,
  optionsPerGroup: 4,
  delivery: 2,
  trust: 3,
  highlights: 3,
  features: 2,
  featureMedia: 1,
  specifications: 8,
  relatedProducts: 3,
});

const BEHAVIOR_DEFAULTS = Object.freeze({
  'show-options': true,
  'show-delivery': true,
  'show-trust': true,
  'show-highlights': true,
  'show-features': false,
  'show-specifications': false,
  'show-related-products': true,
  'sticky-purchase': true,
});

const UI_SETTING_PATHS = Object.freeze({
  'ui-buy-label': 'buyLabel',
  'ui-delivery-heading': 'deliveryHeading',
  'ui-pickup-heading': 'pickupHeading',
  'ui-specifications-heading': 'specificationsHeading',
  'ui-related-heading': 'relatedHeading',
});

const PRODUCT_URL = 'https://www.razer.com/gaming-mice/razer-basilisk-v3-pro-35k/RZ01-05240100-R3U1';
const IMAGE_ORIGIN = 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container';

export const DEFAULT_CONTENT = Object.freeze({
  ui: {
    buyLabel: 'Buy now',
    deliveryHeading: 'Delivery',
    pickupHeading: 'Pickup',
    specificationsHeading: 'Technical specifications',
    relatedHeading: 'Complete your setup',
  },
  brand: null,
  product: {
    sku: 'RZ01-05240100-R3U1',
    color: 'Black',
    title: 'Razer Basilisk V3 Pro 35K',
    subtitle: 'Fully Customizable Wireless Ergonomic RGB Gaming Mouse',
    price: 'US$159.99',
    originalPrice: '',
    discount: '',
    url: PRODUCT_URL,
    pickup: 'Check availability at RazerStore',
    gallery: [
      {
        key: 'gallery-01',
        src: 'https://assets3.razerzone.com/e_Wgt84QExereiAe4BgOEYV8IVs=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh8b%2Fhf1%2F9821719822366%2F241001-basilisk-v3-pro-35k-1500x1000-1.jpg',
        thumbnailSrc: 'https://assets3.razerzone.com/IuctwqiLFr-uqYA4ZkAlSDit9ZA=/78x78/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh8b%2Fhf1%2F9821719822366%2F241001-basilisk-v3-pro-35k-1500x1000-1.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse in black, three-quarter top view',
        width: 1500,
        height: 1000,
        sources: [
          {
            srcset: 'https://assets3.razerzone.com/hkfh_NuYRA4gJKc1kQyJR61eqoI=/767x511/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh8b%2Fhf1%2F9821719822366%2F241001-basilisk-v3-pro-35k-1500x1000-1.jpg 767w, https://assets3.razerzone.com/e_Wgt84QExereiAe4BgOEYV8IVs=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh8b%2Fhf1%2F9821719822366%2F241001-basilisk-v3-pro-35k-1500x1000-1.jpg 1500w',
            sizes: '(max-width: 979px) 100vw, 58vw',
          },
        ],
      },
      {
        key: 'gallery-02',
        src: 'https://assets3.razerzone.com/laksrfEC1Edzex-9zPaKaKp0QLE=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh23%2Fhee%2F9821719920670%2F241001-basilisk-v3-pro-35k-1500x1000-2.jpg',
        thumbnailSrc: 'https://assets3.razerzone.com/bcxMoAQtaRGBxEiWvI9w9b8mAQU=/78x78/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh23%2Fhee%2F9821719920670%2F241001-basilisk-v3-pro-35k-1500x1000-2.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse in black, left-side view',
        width: 1500,
        height: 1000,
        sources: [
          {
            srcset: 'https://assets3.razerzone.com/xE2v14gkZ27Zhny_5-y2VxDmM3I=/767x511/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh23%2Fhee%2F9821719920670%2F241001-basilisk-v3-pro-35k-1500x1000-2.jpg 767w, https://assets3.razerzone.com/laksrfEC1Edzex-9zPaKaKp0QLE=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh23%2Fhee%2F9821719920670%2F241001-basilisk-v3-pro-35k-1500x1000-2.jpg 1500w',
            sizes: '(max-width: 979px) 100vw, 58vw',
          },
        ],
      },
      {
        key: 'gallery-03',
        src: 'https://assets3.razerzone.com/QVQVdgOY1H57jIq5IabOP6QQ6zU=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fhdd%2Fhf0%2F9821719887902%2F241001-basilisk-v3-pro-35k-1500x1000-3.jpg',
        thumbnailSrc: 'https://assets3.razerzone.com/F0ClSbwUYLhD4Cqovc4b8qxB0Do=/78x78/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fhdd%2Fhf0%2F9821719887902%2F241001-basilisk-v3-pro-35k-1500x1000-3.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse in black, right-side view',
        width: 1500,
        height: 1000,
        sources: [
          {
            srcset: 'https://assets3.razerzone.com/MDIW9b__gUW63TV9URtkNvQCyOc=/767x511/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fhdd%2Fhf0%2F9821719887902%2F241001-basilisk-v3-pro-35k-1500x1000-3.jpg 767w, https://assets3.razerzone.com/QVQVdgOY1H57jIq5IabOP6QQ6zU=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fhdd%2Fhf0%2F9821719887902%2F241001-basilisk-v3-pro-35k-1500x1000-3.jpg 1500w',
            sizes: '(max-width: 979px) 100vw, 58vw',
          },
        ],
      },
    ],
    optionGroups: [
      {
        key: 'group-01',
        label: 'Color / Design',
        options: [
          { key: 'option-01', label: 'Black', selected: true },
          { key: 'option-02', label: 'White' },
          { key: 'option-03', label: 'Phantom Green Edition', price: '+US$10.00' },
          { key: 'option-04', label: 'Phantom White Edition', price: '+US$10.00' },
        ],
      },
      {
        key: 'group-02',
        label: 'Model',
        options: [
          { key: 'option-01', label: 'Basilisk V3 Pro 35K', selected: true },
          { key: 'option-02', label: '+ Mouse Dock Pro', price: '+US$40.00' },
          { key: 'option-03', label: '+ Wireless Charging Puck', price: '+US$20.00' },
        ],
      },
      {
        key: 'group-03',
        label: 'Add RazerCare Protection',
        options: [
          { key: 'option-01', label: 'RazerCare Elite For Mice', price: '+US$29.99' },
          { key: 'option-02', label: 'No, Thank You', selected: true },
        ],
      },
    ],
    delivery: [
      { key: 'delivery-01', label: 'Express delivery', value: 'US$15.00' },
      { key: 'delivery-02', label: 'Standard delivery', value: 'Free' },
    ],
    trust: [
      { key: 'trust-01', text: 'Next business day shipping' },
      { key: 'trust-02', text: 'Risk-free return' },
      { key: 'trust-03', text: 'Comprehensive customer support' },
    ],
  },
  highlights: [
    { key: 'highlight-01', text: 'Configurable Razer™ HyperScroll Tilt Wheel' },
    { key: 'highlight-02', text: 'Razer™ Focus Pro 35K Optical Sensor Gen-2' },
    { key: 'highlight-03', text: 'Up to 140 Hours on Razer™ HyperSpeed Wireless' },
  ],
  features: [],
  specifications: [],
  relatedProducts: [
    {
      key: 'related-01',
      image: {
        src: `${IMAGE_ORIGIN}/h96/h06/10061741654046/huntsman-v3-tkl-8khz-500x500.png`,
        alt: 'Razer Huntsman V3 Tenkeyless 8KHz keyboard',
        width: 500,
        height: 500,
        sources: [],
      },
      title: 'Razer Huntsman V3 Tenkeyless 8KHz',
      price: 'US$169.99',
      originalPrice: '',
      discount: '',
      url: 'https://www.razer.com/gaming-keyboards/razer-huntsman-v3-tenkeyless-8khz/RZ03-05750200-R3U1',
      linkLabel: 'View details',
    },
    {
      key: 'related-02',
      image: {
        src: `${IMAGE_ORIGIN}/h9d/h5d/10039373168670/viper-v4-pro-black-2-500x500.png`,
        alt: 'Razer Viper V4 Pro mouse in black',
        width: 500,
        height: 500,
        sources: [],
      },
      title: 'Razer Viper V4 Pro Black',
      price: 'US$159.99',
      originalPrice: '',
      discount: '',
      url: 'https://www.razer.com/gaming-mice/razer-viper-v4-pro/RZ01-05630100-R3U1',
      linkLabel: 'View details',
    },
    {
      key: 'related-03',
      image: {
        src: `${IMAGE_ORIGIN}/h3c/h54/9941151088670/blackshark-v3-pro-black-500x500.png`,
        alt: 'Razer BlackShark V3 Pro headset in black',
        width: 500,
        height: 500,
        sources: [],
      },
      title: 'Razer BlackShark V3 Pro Black',
      price: 'US$249.99',
      originalPrice: '',
      discount: '',
      url: 'https://www.razer.com/gaming-headsets/razer-blackshark-v3-pro/RZ04-05400100-R3U1',
      linkLabel: 'View details',
    },
  ],
});

function cloneContent(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function normalizeKey(value = '') {
  return String(value).trim().toLowerCase().replace(/[\s_]+/g, '-');
}

function padIndex(index) {
  return String(index + 1).padStart(2, '0');
}

function normalizeItemKey(value, prefix, fallbackIndex = 0) {
  const normalized = normalizeKey(value);
  if (!normalized) return `${prefix}-${padIndex(fallbackIndex)}`;
  if (/^\d+$/.test(normalized)) return `${prefix}-${normalized.padStart(2, '0')}`;
  return normalized;
}

function cellText(cell) {
  return String(cell?.innerText ?? cell?.textContent ?? '').trim();
}

function readText(cell) {
  const value = cellText(cell);
  if (!value) return undefined;
  return value === CLEAR_TOKEN ? '' : value;
}

function readBoolean(cell) {
  const value = normalizeKey(cellText(cell));
  if (!value) return undefined;
  if (TRUTHY_VALUES.has(value)) return true;
  if (FALSY_VALUES.has(value)) return false;
  return undefined;
}

function readPositiveInteger(cell) {
  const value = Number.parseInt(cellText(cell), 10);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

function elementTextLines(element) {
  return String(element?.innerText ?? element?.textContent ?? '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readParagraphs(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return [];
  const paragraphs = [...(cell?.querySelectorAll?.('p') || [])]
    .map((paragraph) => cellText(paragraph))
    .filter(Boolean);
  return paragraphs.length ? paragraphs : elementTextLines(cell);
}

function splitLeadAndText(element) {
  const fullText = cellText(element);
  const lead = cellText(element?.querySelector?.('strong'));
  if (!lead || lead === fullText) return { lead: '', text: fullText };
  return {
    lead,
    text: fullText.slice(fullText.indexOf(lead) + lead.length).replace(/^[\s—–:-]+/, ''),
  };
}

function readBullets(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return [];
  const items = [...(cell?.querySelectorAll?.('li') || [])];
  const source = items.length
    ? items
    : elementTextLines(cell).map((text) => ({ textContent: text }));
  return source.map(splitLeadAndText).filter((item) => item.lead || item.text);
}

function readDetails(cell) {
  const rawValue = readText(cell);
  if (rawValue === undefined) return undefined;
  if (rawValue === '') return [];
  const headings = [...(cell?.querySelectorAll?.('h3') || [])];
  return headings.map((heading) => ({
    title: cellText(heading),
    ...splitLeadAndText(heading.nextElementSibling),
  }));
}

function readSpecificationValue(cell) {
  const items = [...(cell?.querySelectorAll?.('li') || [])]
    .map((item) => cellText(item))
    .filter(Boolean);
  if (items.length) return items;
  return readText(cell);
}

function readLink(cell) {
  const anchor = cell?.querySelector?.('a[href]');
  if (anchor) {
    return {
      label: cellText(anchor),
      href: anchor.getAttribute?.('href') || anchor.href || '',
    };
  }
  const value = readText(cell);
  if (value === undefined) return undefined;
  const [label, href = ''] = value.split(/\s*\|\|\s*/, 2);
  return { label, href };
}

function readImage(cell) {
  const image = cell?.querySelector?.('img[src]');
  if (!image) return undefined;
  const picture = cell?.querySelector?.('picture');
  const sourceElements = picture?.querySelectorAll?.('source[srcset]')
    || cell?.querySelectorAll?.('source[srcset]')
    || [];
  const sources = [...sourceElements].map((source) => ({
    srcset: source.getAttribute?.('srcset') || '',
    media: source.getAttribute?.('media') || '',
    type: source.getAttribute?.('type') || '',
    sizes: source.getAttribute?.('sizes') || '',
  })).filter(({ srcset }) => srcset);
  const src = image.getAttribute?.('src') || image.currentSrc || image.src || '';
  if (!src) return undefined;
  return {
    src,
    alt: image.getAttribute?.('alt') ?? image.alt ?? '',
    width: Number.parseInt(image.getAttribute?.('width') || image.width, 10) || undefined,
    height: Number.parseInt(image.getAttribute?.('height') || image.height, 10) || undefined,
    sources,
  };
}

function withDimensions(image, widthCell, heightCell) {
  if (!image) return undefined;
  const width = Number.isInteger(widthCell) ? widthCell : readPositiveInteger(widthCell);
  const height = Number.isInteger(heightCell) ? heightCell : readPositiveInteger(heightCell);
  return {
    ...image,
    width: width || image.width,
    height: height || image.height,
  };
}

function parseRow(row, rowIndex) {
  const cells = [...(row?.children || [])];
  const type = normalizeKey(cellText(cells[0]));
  if (!type) return null;
  switch (type) {
    case 'setting':
      return { type, key: normalizeKey(cellText(cells[1])), value: readText(cells[2]) };
    case 'brand':
      return {
        type,
        image: readImage(cells[1]),
        width: readPositiveInteger(cells[2]),
        height: readPositiveInteger(cells[3]),
      };
    case 'product':
      return {
        type,
        sku: readText(cells[1]),
        color: readText(cells[2]),
        title: readText(cells[3]),
        subtitle: readText(cells[4]),
        price: readText(cells[5]),
        originalPrice: readText(cells[6]),
        discount: readText(cells[7]),
        url: readLink(cells[8])?.href || readText(cells[8]),
        pickup: readText(cells[9]),
      };
    case 'gallery-image':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), 'gallery', rowIndex),
        enabled: readBoolean(cells[2]),
        image: readImage(cells[3]),
        width: readPositiveInteger(cells[4]),
        height: readPositiveInteger(cells[5]),
      };
    case 'option-group':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), 'group', rowIndex),
        enabled: readBoolean(cells[2]),
        label: readText(cells[3]),
      };
    case 'option':
      return {
        type,
        groupKey: normalizeItemKey(cellText(cells[1]), 'group', 0),
        key: normalizeItemKey(cellText(cells[2]), 'option', rowIndex),
        enabled: readBoolean(cells[3]),
        label: readText(cells[4]),
        price: readText(cells[5]),
        selected: readBoolean(cells[6]),
      };
    case 'delivery':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), 'delivery', rowIndex),
        enabled: readBoolean(cells[2]),
        label: readText(cells[3]),
        value: readText(cells[4]),
      };
    case 'trust':
    case 'highlight':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), type, rowIndex),
        enabled: readBoolean(cells[2]),
        text: readText(cells[3]),
      };
    case 'feature':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), 'feature', rowIndex),
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
        type,
        featureKey: normalizeItemKey(cellText(cells[1]), 'feature', 0),
        key: normalizeItemKey(cellText(cells[2]), 'media', rowIndex),
        enabled: readBoolean(cells[3]),
        image: readImage(cells[4]),
        width: readPositiveInteger(cells[5]),
        height: readPositiveInteger(cells[6]),
      };
    case 'specification':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), 'spec', rowIndex),
        enabled: readBoolean(cells[2]),
        label: readText(cells[3]),
        value: readSpecificationValue(cells[4]),
      };
    case 'related-product':
      return {
        type,
        key: normalizeItemKey(cellText(cells[1]), 'related', rowIndex),
        enabled: readBoolean(cells[2]),
        image: readImage(cells[3]),
        title: readText(cells[4]),
        price: readText(cells[5]),
        originalPrice: readText(cells[6]),
        discount: readText(cells[7]),
        url: readLink(cells[8])?.href || readText(cells[8]),
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

export function sanitizeAuthoredUrl(value, fallback = '') {
  const url = String(value || '').trim();
  if (!url || !SAFE_URL_START.test(url) || /^https?:\/\/\s*$/i.test(url)) return fallback;
  return url;
}

function sanitizeSrcset(value) {
  return String(value || '').split(',').map((candidate) => {
    const [url, ...descriptor] = candidate.trim().split(/\s+/);
    const safeUrl = sanitizeAuthoredUrl(url);
    if (!safeUrl) return '';
    const safeDescriptor = descriptor.join(' ');
    return safeDescriptor ? `${safeUrl} ${safeDescriptor}` : safeUrl;
  })
    .filter(Boolean)
    .join(', ');
}

function normalizeImage(image, fallback = {}) {
  const src = sanitizeAuthoredUrl(image?.src, fallback.src || '');
  if (!src) return null;
  const fallbackSources = fallback.sources || [];
  const authoredSources = image?.sources || [];
  const useFallbackAssets = src === fallback.src;
  const sources = (authoredSources.length || !useFallbackAssets
    ? authoredSources
    : fallbackSources)
    .map((source) => ({
      srcset: sanitizeSrcset(source.srcset),
      media: String(source.media || ''),
      type: String(source.type || ''),
      sizes: String(source.sizes || ''),
    }))
    .filter(({ srcset }) => srcset);
  return {
    src,
    thumbnailSrc: sanitizeAuthoredUrl(
      image?.thumbnailSrc,
      useFallbackAssets ? fallback.thumbnailSrc || '' : '',
    ),
    alt: image?.alt ?? fallback.alt ?? '',
    width: image?.width || fallback.width || 1,
    height: image?.height || fallback.height || 1,
    sources,
  };
}

function mergeDefined(target, source, fields) {
  fields.forEach((field) => {
    if (source[field] !== undefined) target[field] = source[field];
  });
  return target;
}

function sortAndLimit(items, limit) {
  return items.sort((a, b) => a.key.localeCompare(b.key)).slice(0, limit);
}

function mergeCollection(defaultItems, authoredItems, mode, limit, buildItem) {
  const base = mode === 'replace' && authoredItems.length ? [] : defaultItems;
  const items = new Map(base.map((item) => [item.key, cloneContent(item)]));
  authoredItems.forEach((record) => {
    if (record.enabled === false) {
      items.delete(record.key);
      return;
    }
    const item = buildItem(items.get(record.key), record);
    if (item) items.set(record.key, item);
  });
  return sortAndLimit([...items.values()], limit);
}

function parseSettingBoolean(settings, key) {
  const fallback = BEHAVIOR_DEFAULTS[key];
  const value = normalizeKey(settings.get(key));
  if (TRUTHY_VALUES.has(value)) return true;
  if (FALSY_VALUES.has(value)) return false;
  return fallback;
}

function mergeProduct(content, records) {
  records.filter(({ type }) => type === 'product').forEach((record) => {
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
  records.filter(({ type }) => type === 'brand').forEach((record) => {
    const image = normalizeImage(
      withDimensions(record.image, record.width, record.height),
      content.brand || {},
    );
    if (image) content.brand = image;
  });
}

function mergeGallery(content, records, mode) {
  const authored = records.filter(({ type }) => type === 'gallery-image');
  content.product.gallery = mergeCollection(
    content.product.gallery,
    authored,
    mode,
    LIMITS.gallery,
    (existing, record) => {
      const image = normalizeImage(
        withDimensions(record.image, record.width, record.height),
        existing || {},
      );
      return image ? { ...image, key: record.key } : null;
    },
  );
}

function normalizeSelection(options) {
  let selectedFound = false;
  const normalized = options.map((option) => {
    const selected = option.selected === true && !selectedFound;
    if (selected) selectedFound = true;
    return { ...option, selected };
  });
  if (!selectedFound && normalized.length) normalized[0].selected = true;
  return normalized;
}

function mergeOptions(content, records, mode) {
  const groupRecords = records.filter(({ type }) => type === 'option-group');
  const optionRecords = records.filter(({ type }) => type === 'option');
  const disabledGroups = new Set(
    groupRecords.filter(({ enabled }) => enabled === false).map(({ key }) => key),
  );
  const groups = mergeCollection(
    content.product.optionGroups,
    groupRecords,
    mode,
    LIMITS.optionGroups,
    (existing, record) => {
      const group = mergeDefined(
        { ...(existing || {}), key: record.key, options: cloneContent(existing?.options || []) },
        record,
        ['label'],
      );
      return group.label ? group : null;
    },
  );

  optionRecords.forEach((record) => {
    if (disabledGroups.has(record.groupKey)) return;
    if (groups.some(({ key }) => key === record.groupKey)) return;
    if (groups.length >= LIMITS.optionGroups) return;
    groups.push({ key: record.groupKey, label: record.groupKey, options: [] });
  });

  content.product.optionGroups = sortAndLimit(groups, LIMITS.optionGroups).map((group) => {
    const authored = optionRecords.filter(({ groupKey }) => groupKey === group.key);
    const options = mergeCollection(
      group.options || [],
      authored,
      mode,
      LIMITS.optionsPerGroup,
      (existing, record) => {
        const option = mergeDefined(
          { ...(existing || {}), key: record.key },
          record,
          ['label', 'price', 'selected'],
        );
        return option.label ? option : null;
      },
    );
    return { ...group, options: normalizeSelection(options) };
  }).filter(({ options }) => options.length);
}

function mergeTextCollection(content, records, mode, type, target, limit) {
  content[target] = mergeCollection(
    content[target],
    records.filter((record) => record.type === type),
    mode,
    limit,
    (existing, record) => {
      const item = mergeDefined({ ...(existing || {}), key: record.key }, record, ['text']);
      return item.text ? item : null;
    },
  );
}

function mergeDelivery(content, records, mode) {
  const authored = records.filter(({ type }) => type === 'delivery');
  content.product.delivery = mergeCollection(
    content.product.delivery,
    authored,
    mode,
    LIMITS.delivery,
    (existing, record) => {
      const item = mergeDefined(
        { ...(existing || {}), key: record.key },
        record,
        ['label', 'value'],
      );
      return item.label ? item : null;
    },
  );
}

function mergeTrust(content, records, mode) {
  const authored = records.filter(({ type }) => type === 'trust');
  content.product.trust = mergeCollection(
    content.product.trust,
    authored,
    mode,
    LIMITS.trust,
    (existing, record) => {
      const item = mergeDefined({ ...(existing || {}), key: record.key }, record, ['text']);
      return item.text ? item : null;
    },
  );
}

function mergeFeatures(content, records, mode) {
  const featureRows = records.filter(({ type }) => type === 'feature');
  const mediaRows = records.filter(({ type }) => type === 'feature-media');
  content.features = mergeCollection(
    content.features,
    featureRows,
    mode,
    LIMITS.features,
    (existing, record) => {
      const feature = mergeDefined(
        {
          ...(existing || {}),
          key: record.key,
          media: cloneContent(existing?.media || []),
        },
        record,
        [
          'side',
          'eyebrow',
          'title',
          'subtitle',
          'paragraphs',
          'bullets',
          'detailGroups',
          'note',
          'link',
        ],
      );
      if (feature.link) {
        feature.link.href = sanitizeAuthoredUrl(feature.link.href, existing?.link?.href || '');
      }
      return feature.title ? feature : null;
    },
  ).map((feature) => {
    const authored = mediaRows.filter(({ featureKey }) => featureKey === feature.key);
    const media = mergeCollection(
      feature.media || [],
      authored,
      mode,
      LIMITS.featureMedia,
      (existing, record) => {
        const image = normalizeImage(
          withDimensions(record.image, record.width, record.height),
          existing || {},
        );
        return image ? { ...image, key: record.key } : null;
      },
    );
    return { ...feature, media };
  });
}

function mergeSpecifications(content, records, mode) {
  const authored = records.filter(({ type }) => type === 'specification');
  content.specifications = mergeCollection(
    content.specifications,
    authored,
    mode,
    LIMITS.specifications,
    (existing, record) => {
      const specification = mergeDefined(
        { ...(existing || {}), key: record.key },
        record,
        ['label', 'value'],
      );
      return specification.label && specification.value ? specification : null;
    },
  );
}

function mergeRelatedProducts(content, records, mode) {
  const authored = records.filter(({ type }) => type === 'related-product');
  content.relatedProducts = mergeCollection(
    content.relatedProducts,
    authored,
    mode,
    LIMITS.relatedProducts,
    (existing, record) => {
      const item = mergeDefined(
        { ...(existing || {}), key: record.key },
        record,
        ['title', 'price', 'originalPrice', 'discount', 'linkLabel'],
      );
      item.image = normalizeImage(record.image, existing?.image || {});
      if (record.url !== undefined) item.url = sanitizeAuthoredUrl(record.url, existing?.url || '');
      return item.image && item.title && item.url ? item : null;
    },
  );
}

export function buildEditableExperience(records, sourceContent = DEFAULT_CONTENT) {
  const content = cloneContent(sourceContent);
  const settings = new Map();
  records.filter(({ type }) => type === 'setting').forEach(({ key, value }) => {
    if (key && value !== undefined) settings.set(key, value);
  });
  const mode = settings.get('content-mode') === 'replace' ? 'replace' : 'merge';

  Object.entries(UI_SETTING_PATHS).forEach(([setting, property]) => {
    if (settings.get(setting)) content.ui[property] = settings.get(setting);
  });

  mergeBrand(content, records);
  mergeProduct(content, records);
  mergeGallery(content, records, mode);
  mergeOptions(content, records, mode);
  mergeDelivery(content, records, mode);
  mergeTrust(content, records, mode);
  mergeTextCollection(content, records, mode, 'highlight', 'highlights', LIMITS.highlights);
  mergeFeatures(content, records, mode);
  mergeSpecifications(content, records, mode);
  mergeRelatedProducts(content, records, mode);
  content.product.trust = content.product.trust.map(({ text }) => text);
  content.highlights = content.highlights.map(({ text }) => text);

  const accent = settings.get('token-accent');
  const styles = accent && SAFE_COLOR.test(accent) ? { '--rm3-accent': accent } : {};
  return {
    content,
    config: {
      showOptions: parseSettingBoolean(settings, 'show-options'),
      showDelivery: parseSettingBoolean(settings, 'show-delivery'),
      showTrust: parseSettingBoolean(settings, 'show-trust'),
      showHighlights: parseSettingBoolean(settings, 'show-highlights'),
      showFeatures: parseSettingBoolean(settings, 'show-features'),
      showSpecifications: parseSettingBoolean(settings, 'show-specifications'),
      showRelatedProducts: parseSettingBoolean(settings, 'show-related-products'),
      stickyPurchase: parseSettingBoolean(settings, 'sticky-purchase'),
      productUrl: sanitizeAuthoredUrl(content.product.url, PRODUCT_URL),
    },
    styles,
  };
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function renderSources(sources = [], fallbackSizes = '') {
  return sources.map((source) => {
    const media = source.media ? ` media="${escapeHTML(source.media)}"` : '';
    const type = source.type ? ` type="${escapeHTML(source.type)}"` : '';
    const sizes = source.sizes || fallbackSizes;
    const sizesAttribute = sizes ? ` sizes="${escapeHTML(sizes)}"` : '';
    return `<source srcset="${escapeHTML(source.srcset)}"${media}${type}${sizesAttribute}>`;
  }).join('');
}

function renderPicture(image, {
  className = '',
  eager = false,
  decorative = false,
  thumbnail = false,
  sizes = '',
} = {}) {
  const src = thumbnail && image.thumbnailSrc ? image.thumbnailSrc : image.src;
  const sources = thumbnail ? [] : image.sources;
  const classAttribute = className ? ` class="${className}"` : '';
  const alt = decorative ? '' : image.alt;
  const priority = eager ? ' fetchpriority="high"' : '';
  const loading = eager ? 'eager' : 'lazy';
  const sizesAttribute = sizes ? ` sizes="${escapeHTML(sizes)}"` : '';
  return `<picture${classAttribute}>
    ${renderSources(sources, sizes)}
    <img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}"
      width="${image.width}" height="${image.height}" loading="${loading}"
      decoding="async"${priority}${sizesAttribute}>
  </picture>`;
}

function renderGallery(gallery, highlights, showHighlights) {
  if (!gallery.length) return '';
  const thumbnails = gallery.map((image, index) => `
    <button class="rm3-gallery-thumb" type="button" data-gallery-index="${index}"
      aria-pressed="${index === 0}" aria-label="Show ${escapeHTML(image.alt)}">
      ${image.thumbnailSrc ? renderPicture(image, { thumbnail: true, decorative: true }) : ''}
    </button>`).join('');
  const highlightList = showHighlights && highlights.length
    ? `<ul class="rm3-highlights">${highlights.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul>`
    : '';
  return `<div class="rm3-gallery">
    <div class="rm3-gallery-stage" data-gallery-stage>
      <div class="rm3-gallery-main">
        ${renderPicture(gallery[0], {
    eager: true,
    sizes: '(max-width: 979px) 100vw, 58vw',
  })}
      </div>
    </div>
    <div class="rm3-gallery-thumbs" aria-label="Product images">${thumbnails}</div>
    <p class="rm3-gallery-status visually-hidden" aria-live="polite" data-gallery-status>
      Image 1 of ${gallery.length}
    </p>
    ${highlightList}
  </div>`;
}

function renderOptionGroups(groups, instanceId) {
  if (!groups.length) return '';
  return `<div class="rm3-option-groups">${groups.map((group) => `
    <fieldset class="rm3-option-group">
      <legend class="rm3-option-legend">${escapeHTML(group.label)}</legend>
      <div class="rm3-options">${group.options.map((option) => `
        <label class="rm3-option">
          <input type="radio" name="${instanceId}-${escapeHTML(group.key)}"
            value="${escapeHTML(option.key)}"${option.selected ? ' checked' : ''}>
          <span class="rm3-option-copy">${escapeHTML(option.label)}</span>
          ${option.price ? `<span class="rm3-option-price">${escapeHTML(option.price)}</span>` : ''}
        </label>`).join('')}</div>
    </fieldset>`).join('')}</div>`;
}

function renderPrice(product) {
  return `<div class="rm3-price-row">
    <span class="rm3-price-current">${escapeHTML(product.price)}</span>
    ${product.originalPrice ? `<del class="rm3-price-original">${escapeHTML(product.originalPrice)}</del>` : ''}
    ${product.discount ? `<span class="rm3-discount">${escapeHTML(product.discount)}</span>` : ''}
  </div>`;
}

function renderFulfillment(product, config, ui) {
  if (!config.showDelivery) return '';
  const delivery = product.delivery.length
    ? `<ul class="rm3-delivery-list">${product.delivery.map((item) => `
      <li class="rm3-delivery-item">
        <strong>${escapeHTML(item.label)}</strong><span>${escapeHTML(item.value || '')}</span>
      </li>`).join('')}</ul>`
    : '';
  const pickup = product.pickup
    ? `<p class="rm3-pickup"><strong>${escapeHTML(ui.pickupHeading)}</strong><span>${escapeHTML(product.pickup)}</span></p>`
    : '';
  return `<p class="rm3-fulfillment-label">${escapeHTML(ui.deliveryHeading)}</p>
  <div class="rm3-fulfillment">
    ${delivery}${pickup}
  </div>`;
}

function renderPurchase(product, config, ui) {
  const trust = config.showTrust && product.trust.length
    ? `<ul class="rm3-trust">${product.trust.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul>`
    : '';
  return `<div class="rm3-purchase">
    ${renderPrice(product)}
    ${renderFulfillment(product, config, ui)}
    <a class="rm3-buy-link" href="${escapeHTML(config.productUrl)}">${escapeHTML(ui.buyLabel)}</a>
    ${trust}
  </div>`;
}

function renderFeatureText(feature) {
  const paragraphs = (feature.paragraphs || [])
    .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');
  const bullets = (feature.bullets || []).length
    ? `<ul>${feature.bullets.map(({ lead, text }) => `<li>${lead ? `<strong>${escapeHTML(lead)}</strong> — ` : ''}${escapeHTML(text)}</li>`).join('')}</ul>`
    : '';
  const details = (feature.detailGroups || [])
    .map(({ title, lead, text }) => `<p>${title ? `<strong>${escapeHTML(title)}:</strong> ` : ''}${lead ? `<strong>${escapeHTML(lead)}</strong> ` : ''}${escapeHTML(text)}</p>`).join('');
  const link = feature.link?.href
    ? `<p><a class="rm3-related-link" href="${escapeHTML(feature.link.href)}">${escapeHTML(feature.link.label || 'Learn more')}</a></p>`
    : '';
  return `${feature.eyebrow ? `<p class="rm3-eyebrow">${escapeHTML(feature.eyebrow)}</p>` : ''}
    <h3 class="rm3-feature-title">${escapeHTML(feature.title)}</h3>
    ${feature.subtitle ? `<p>${escapeHTML(feature.subtitle)}</p>` : ''}
    ${paragraphs}${bullets}${details}
    ${feature.note ? `<p>${escapeHTML(feature.note)}</p>` : ''}${link}`;
}

function renderFeatures(features, instanceId) {
  if (!features.length) return '';
  const headingId = `${instanceId}-features-title`;
  return `<section class="rm3-features" aria-labelledby="${headingId}">
    <div class="rm3-section-head">
      <div><p class="rm3-section-index">Optional editorial</p>
      <h2 class="rm3-section-title" id="${headingId}">Product features</h2></div>
    </div>
    ${features.map((feature) => `<article class="rm3-feature" data-layout="${escapeHTML(feature.side || 'right')}">
      ${feature.media?.[0] ? `<div class="rm3-feature-media">${renderPicture(feature.media[0])}</div>` : ''}
      <div class="rm3-feature-copy">${renderFeatureText(feature)}</div>
    </article>`).join('')}
  </section>`;
}

function renderSpecificationValue(value) {
  if (Array.isArray(value)) {
    return `<ul>${value.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
  }
  return escapeHTML(value);
}

function renderSpecifications(specifications, heading) {
  if (!specifications.length) return '';
  return `<section class="rm3-specifications">
    <details class="rm3-specs">
      <summary class="rm3-specs-summary">${escapeHTML(heading)}</summary>
      <dl class="rm3-spec-list">${specifications.map(({ label, value }) => `
        <dt>${escapeHTML(label)}</dt><dd>${renderSpecificationValue(value)}</dd>`).join('')}
      </dl>
    </details>
  </section>`;
}

function renderRelatedProducts(products, heading, instanceId) {
  if (!products.length) return '';
  const headingId = `${instanceId}-related-title`;
  return `<section class="rm3-related" aria-labelledby="${headingId}">
    <div class="rm3-section-head">
      <div><p class="rm3-section-index">Curated loadout</p>
      <h2 class="rm3-section-title" id="${headingId}">${escapeHTML(heading)}</h2></div>
    </div>
    <div class="rm3-related-grid">${products.map((product) => `
      <article class="rm3-related-card">
        <div class="rm3-related-media">${renderPicture(product.image, {
    sizes: '(max-width: 767px) 84vw, 33vw',
  })}</div>
        <div class="rm3-related-copy">
          <h3 class="rm3-related-title">${escapeHTML(product.title)}</h3>
          <p class="rm3-related-price">${escapeHTML(product.price)}
            ${product.originalPrice ? `<del>${escapeHTML(product.originalPrice)}</del>` : ''}
          </p>
          <a class="rm3-related-link" href="${escapeHTML(product.url)}">${escapeHTML(product.linkLabel || 'View details')}</a>
        </div>
      </article>`).join('')}</div>
  </section>`;
}

function renderMobileBuybar(product, config, ui) {
  return `<div class="rm3-mobile-buybar">
    <div>${renderPrice(product)}</div>
    <a class="rm3-buy-link" href="${escapeHTML(config.productUrl)}">${escapeHTML(ui.buyLabel)}</a>
  </div>`;
}

function renderExperience(content, config, instanceId) {
  const { product, ui } = content;
  const options = config.showOptions ? renderOptionGroups(product.optionGroups, instanceId) : '';
  const features = config.showFeatures ? renderFeatures(content.features, instanceId) : '';
  const specifications = config.showSpecifications
    ? renderSpecifications(content.specifications, ui.specificationsHeading)
    : '';
  const related = config.showRelatedProducts
    ? renderRelatedProducts(content.relatedProducts, ui.relatedHeading, instanceId)
    : '';
  return `<div class="rm3-shell">
    <div class="rm3-product-header">
      <div>
        ${content.brand ? renderPicture(content.brand, { className: 'rm3-brand' }) : ''}
        <p class="rm3-eyebrow">Razer gaming mouse · ${escapeHTML(product.color)}</p>
        <h1 class="rm3-title">${escapeHTML(product.title)}</h1>
        <p class="rm3-subtitle">${escapeHTML(product.subtitle)}</p>
      </div>
      <p class="rm3-sku">${escapeHTML(product.sku)}</p>
    </div>
    <div class="rm3-hero">
      ${renderGallery(product.gallery, content.highlights, config.showHighlights)}
      <div class="rm3-configurator">${options}${renderPurchase(product, config, ui)}</div>
    </div>
    ${features}${specifications}${related}
  </div>
  ${renderMobileBuybar(product, config, ui)}`;
}

function setupGallery(block, gallery) {
  if (gallery.length < 2) return;
  const galleryElement = block.querySelector('.rm3-gallery');
  const stage = galleryElement?.querySelector('[data-gallery-stage]');
  if (!galleryElement || !stage) return;
  galleryElement.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-gallery-index]');
    if (!button || !galleryElement.contains(button)) return;
    const index = Number.parseInt(button.dataset.galleryIndex, 10);
    const image = gallery[index];
    if (!image || button.getAttribute('aria-pressed') === 'true') return;
    stage.innerHTML = `<div class="rm3-gallery-main">${renderPicture(image, {
      eager: false,
      sizes: '(max-width: 979px) 100vw, 58vw',
    })}</div>`;
    galleryElement.querySelectorAll('[data-gallery-index]').forEach((thumbnail) => {
      thumbnail.setAttribute('aria-pressed', String(thumbnail === button));
    });
    const status = galleryElement.querySelector('[data-gallery-status]');
    if (status) status.textContent = `Image ${index + 1} of ${gallery.length}`;
  });
}

let instanceCount = 0;

export default function decorate(block) {
  if (block.dataset.razerMinipageReady === 'true') return;
  const experience = buildEditableExperience(parseAuthorRows(block));
  Object.entries(experience.styles).forEach(([property, value]) => {
    block.style.setProperty(property, value);
  });
  block.classList.toggle('rm3-sticky-mobile', experience.config.stickyPurchase);
  instanceCount += 1;
  block.innerHTML = renderExperience(
    experience.content,
    experience.config,
    `rm3-${instanceCount}`,
  );
  block.dataset.razerMinipageReady = 'true';
  setupGallery(block, experience.content.product.gallery);
}

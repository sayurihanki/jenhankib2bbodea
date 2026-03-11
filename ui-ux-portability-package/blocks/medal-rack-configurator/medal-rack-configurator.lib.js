export const DEFAULT_DATA_SOURCE = '/data/configurators/medal-rack-configurator.json';
export const MAX_INSCRIPTION_LENGTH = 48;
export const AWARD_MANIFEST_MAX_LENGTH = 4096;
export const MEDAL_RACK_PAGE_FLAG = 'medal-rack-configurator-page';

export const DEFAULT_BLOCK_CONTENT = {
  eyebrow: 'Service and Honor Collection',
  title: 'Officer Heritage\nMedal Rack',
  subtitle: 'Solid hardwood, hand-fitted hardware, engraved inscription, and a regulation-aware award manifest for ceremonial display.',
  primaryCtaLabel: 'Add configured rack',
  prototypeNote: '',
};

export const DEFAULT_DATASET = {
  id: 'medal-rack-configurator',
  version: '1.1.0',
  currency: 'USD',
  commerce: {
    baseSku: 'medalrackconfigurator',
    optionLabels: {
      size: 'Rack Size',
      wood: 'Wood Finish',
      hardware: 'Hardware Finish',
      branch: 'Branch of Service',
      inscription: 'Inscription',
      awardManifest: 'Award Manifest',
    },
  },
  pricing: {
    base: 695,
    engraving: 0,
    mountKit: 0,
  },
  defaults: {
    size: 'sm',
    wood: 'walnut',
    hardware: 'gold',
    branch: 'usmc',
    inscription: 'Semper Fidelis',
  },
  sizes: [
    {
      id: 'sm',
      label: 'Standard',
      dimensions: '8" x 10"',
      cost: 0,
      maxAwards: 8,
    },
    {
      id: 'md',
      label: 'Medium',
      dimensions: '11" x 14"',
      cost: 60,
      maxAwards: 12,
    },
    {
      id: 'lg',
      label: 'Large',
      dimensions: '14" x 18"',
      cost: 120,
      maxAwards: 18,
    },
    {
      id: 'xl',
      label: 'Extra Large',
      dimensions: '18" x 24"',
      cost: 200,
      maxAwards: 24,
    },
  ],
  woods: [
    {
      id: 'walnut',
      label: 'Walnut',
      cost: 0,
      gradientId: 'woodWalnut',
    },
    {
      id: 'mahogany',
      label: 'Mahogany',
      cost: 40,
      gradientId: 'woodMahogany',
    },
    {
      id: 'ebony',
      label: 'Ebony',
      cost: 80,
      gradientId: 'woodEbony',
    },
    {
      id: 'cherry',
      label: 'Cherry',
      cost: 60,
      gradientId: 'woodCherry',
    },
    {
      id: 'maple',
      label: 'Maple',
      cost: 50,
      gradientId: 'woodMaple',
    },
  ],
  hardware: [
    {
      id: 'gold',
      label: 'Gold',
      cost: 0,
      pinColor: '#c9a84c',
      plateColor: '#c9a84c',
    },
    {
      id: 'silver',
      label: 'Silver',
      cost: 0,
      pinColor: '#b0bcc7',
      plateColor: '#b7c0c9',
    },
    {
      id: 'brass',
      label: 'Brass',
      cost: 20,
      pinColor: '#b89040',
      plateColor: '#af8442',
    },
    {
      id: 'pewter',
      label: 'Pewter',
      cost: 15,
      pinColor: '#667387',
      plateColor: '#566171',
    },
  ],
  branches: [
    {
      id: 'usmc',
      label: 'USMC',
      icon: 'EGA',
      watermark: 'USMC',
    },
    {
      id: 'army',
      label: 'Army',
      icon: 'STAR',
      watermark: 'ARMY',
    },
    {
      id: 'navy',
      label: 'Navy',
      icon: 'ANCHOR',
      watermark: 'NAVY',
    },
    {
      id: 'airforce',
      label: 'USAF',
      icon: 'WING',
      watermark: 'USAF',
    },
    {
      id: 'cg',
      label: 'USCG',
      icon: 'COAST',
      watermark: 'USCG',
    },
    {
      id: 'sf',
      label: 'USSF',
      icon: 'ORBIT',
      watermark: 'USSF',
    },
  ],
  awards: [
    {
      id: 'medal-of-honor-usmc', label: 'Medal of Honor', branch: 'usmc', precedence: 1, type: 'medal',
    },
    {
      id: 'navy-cross-usmc', label: 'Navy Cross', branch: 'usmc', precedence: 2, type: 'medal',
    },
    {
      id: 'silver-star-usmc', label: 'Silver Star', branch: 'usmc', precedence: 3, type: 'medal',
    },
    {
      id: 'bronze-star-usmc', label: 'Bronze Star Medal', branch: 'usmc', precedence: 4, type: 'medal',
    },
    {
      id: 'purple-heart-usmc', label: 'Purple Heart', branch: 'usmc', precedence: 5, type: 'medal',
    },
    {
      id: 'medal-of-honor-army', label: 'Medal of Honor', branch: 'army', precedence: 1, type: 'medal',
    },
    {
      id: 'distinguished-service-cross-army', label: 'Distinguished Service Cross', branch: 'army', precedence: 2, type: 'medal',
    },
    {
      id: 'silver-star-army', label: 'Silver Star', branch: 'army', precedence: 3, type: 'medal',
    },
    {
      id: 'bronze-star-army', label: 'Bronze Star Medal', branch: 'army', precedence: 4, type: 'medal',
    },
    {
      id: 'purple-heart-army', label: 'Purple Heart', branch: 'army', precedence: 5, type: 'medal',
    },
    {
      id: 'medal-of-honor-navy', label: 'Medal of Honor', branch: 'navy', precedence: 1, type: 'medal',
    },
    {
      id: 'navy-cross-navy', label: 'Navy Cross', branch: 'navy', precedence: 2, type: 'medal',
    },
    {
      id: 'silver-star-navy', label: 'Silver Star', branch: 'navy', precedence: 3, type: 'medal',
    },
    {
      id: 'bronze-star-navy', label: 'Bronze Star Medal', branch: 'navy', precedence: 4, type: 'medal',
    },
    {
      id: 'purple-heart-navy', label: 'Purple Heart', branch: 'navy', precedence: 5, type: 'medal',
    },
    {
      id: 'medal-of-honor-airforce', label: 'Medal of Honor', branch: 'airforce', precedence: 1, type: 'medal',
    },
    {
      id: 'air-force-cross-airforce', label: 'Air Force Cross', branch: 'airforce', precedence: 2, type: 'medal',
    },
    {
      id: 'silver-star-airforce', label: 'Silver Star', branch: 'airforce', precedence: 3, type: 'medal',
    },
    {
      id: 'bronze-star-airforce', label: 'Bronze Star Medal', branch: 'airforce', precedence: 4, type: 'medal',
    },
    {
      id: 'purple-heart-airforce', label: 'Purple Heart', branch: 'airforce', precedence: 5, type: 'medal',
    },
    {
      id: 'medal-of-honor-cg', label: 'Medal of Honor', branch: 'cg', precedence: 1, type: 'medal',
    },
    {
      id: 'coast-guard-medal-cg', label: 'Coast Guard Medal', branch: 'cg', precedence: 2, type: 'medal',
    },
    {
      id: 'silver-star-cg', label: 'Silver Star', branch: 'cg', precedence: 3, type: 'medal',
    },
    {
      id: 'bronze-star-cg', label: 'Bronze Star Medal', branch: 'cg', precedence: 4, type: 'medal',
    },
    {
      id: 'purple-heart-cg', label: 'Purple Heart', branch: 'cg', precedence: 5, type: 'medal',
    },
    {
      id: 'medal-of-honor-sf', label: 'Medal of Honor', branch: 'sf', precedence: 1, type: 'medal',
    },
    {
      id: 'defense-superior-service-sf', label: 'Defense Superior Service Medal', branch: 'sf', precedence: 2, type: 'service-medal',
    },
    {
      id: 'silver-star-sf', label: 'Silver Star', branch: 'sf', precedence: 3, type: 'medal',
    },
    {
      id: 'bronze-star-sf', label: 'Bronze Star Medal', branch: 'sf', precedence: 4, type: 'medal',
    },
    {
      id: 'purple-heart-sf', label: 'Purple Heart', branch: 'sf', precedence: 5, type: 'medal',
    },
  ],
  addons: [
    {
      id: 'shadowbox',
      label: 'Matching Shadow Box',
      description: 'Solid hardwood shadow box in the selected finish for medals, photos, and keepsakes.',
      price: 195,
      icon: 'FRAME',
    },
    {
      id: 'ribbon-kit',
      label: 'Replacement Ribbon Set',
      description: 'Regulation-aware replacement ribbon bundle for the selected branch.',
      price: 85,
      icon: 'RIBBON',
    },
    {
      id: 'certificate',
      label: 'Certificate of Authenticity',
      description: 'Numbered archival certificate with build details and craftsman signature.',
      price: 48,
      icon: 'CERT',
    },
    {
      id: 'gift',
      label: 'Heirloom Gift Box',
      description: 'Magnetic closure presentation box with tissue wrap and gift card.',
      price: 35,
      icon: 'GIFT',
    },
  ],
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeId(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || fallback;
}

function normalizeLabel(value, fallback) {
  const normalized = String(value || '').trim();
  return normalized || fallback;
}

export function normalizeKey(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeList(source, fallbackList, mapper) {
  const items = Array.isArray(source) && source.length ? source : fallbackList;
  return items.map((item, index) => mapper(item || {}, fallbackList[index] || fallbackList[0]));
}

function resolveDefaultId(value, list, fallbackId) {
  const id = normalizeId(value, fallbackId);
  return list.some((item) => item.id === id) ? id : fallbackId;
}

export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parsed);
  } catch (error) {
    return `${currency} ${parsed.toFixed(0)}`;
  }
}

export function sanitizeInscriptionValue(value, maxLength = MAX_INSCRIPTION_LENGTH) {
  const stripped = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return stripped.slice(0, maxLength).trim();
}

export function getInscriptionText(value, fallback = DEFAULT_DATASET.defaults.inscription) {
  const sanitized = sanitizeInscriptionValue(value);
  if (sanitized) return sanitized;

  const fallbackText = sanitizeInscriptionValue(fallback);
  return fallbackText || DEFAULT_DATASET.defaults.inscription;
}

function normalizePricing(rawPricing = {}) {
  return {
    base: toNumber(rawPricing.base, DEFAULT_DATASET.pricing.base),
    engraving: toNumber(rawPricing.engraving, DEFAULT_DATASET.pricing.engraving),
    mountKit: toNumber(rawPricing.mountKit, DEFAULT_DATASET.pricing.mountKit),
  };
}

function normalizeCommerce(rawCommerce = {}) {
  const rawLabels = rawCommerce.optionLabels || {};
  const fallbackLabels = DEFAULT_DATASET.commerce.optionLabels;

  return {
    baseSku: normalizeLabel(rawCommerce.baseSku, DEFAULT_DATASET.commerce.baseSku),
    optionLabels: {
      size: normalizeLabel(rawLabels.size, fallbackLabels.size),
      wood: normalizeLabel(rawLabels.wood, fallbackLabels.wood),
      hardware: normalizeLabel(rawLabels.hardware, fallbackLabels.hardware),
      branch: normalizeLabel(rawLabels.branch, fallbackLabels.branch),
      inscription: normalizeLabel(rawLabels.inscription, fallbackLabels.inscription),
      awardManifest: normalizeLabel(rawLabels.awardManifest, fallbackLabels.awardManifest),
    },
  };
}

function normalizeSizes(rawSizes) {
  return normalizeList(rawSizes, DEFAULT_DATASET.sizes, (item, fallback) => ({
    id: normalizeId(item.id, fallback.id),
    label: normalizeLabel(item.label, fallback.label),
    dimensions: normalizeLabel(item.dimensions, fallback.dimensions),
    cost: toNumber(item.cost, fallback.cost),
    maxAwards: toNumber(item.maxAwards, fallback.maxAwards),
  }));
}

function normalizeWoods(rawWoods) {
  return normalizeList(rawWoods, DEFAULT_DATASET.woods, (item, fallback) => ({
    id: normalizeId(item.id, fallback.id),
    label: normalizeLabel(item.label, fallback.label),
    cost: toNumber(item.cost, fallback.cost),
    gradientId: normalizeLabel(item.gradientId, fallback.gradientId),
  }));
}

function normalizeHardware(rawHardware) {
  return normalizeList(rawHardware, DEFAULT_DATASET.hardware, (item, fallback) => ({
    id: normalizeId(item.id, fallback.id),
    label: normalizeLabel(item.label, fallback.label),
    cost: toNumber(item.cost, fallback.cost),
    pinColor: normalizeLabel(item.pinColor, fallback.pinColor),
    plateColor: normalizeLabel(item.plateColor, fallback.plateColor),
  }));
}

function normalizeBranches(rawBranches) {
  return normalizeList(rawBranches, DEFAULT_DATASET.branches, (item, fallback) => ({
    id: normalizeId(item.id, fallback.id),
    label: normalizeLabel(item.label, fallback.label),
    icon: normalizeLabel(item.icon, fallback.icon),
    watermark: normalizeLabel(item.watermark, fallback.watermark),
  }));
}

function normalizeAwards(rawAwards) {
  return normalizeList(rawAwards, DEFAULT_DATASET.awards, (item, fallback) => ({
    id: normalizeId(item.id, fallback.id),
    label: normalizeLabel(item.label, fallback.label),
    branch: normalizeId(item.branch, fallback.branch),
    precedence: toNumber(item.precedence, fallback.precedence),
    type: normalizeLabel(item.type, fallback.type),
  })).sort((first, second) => {
    if (first.branch !== second.branch) {
      return first.branch.localeCompare(second.branch);
    }

    if (first.precedence !== second.precedence) {
      return first.precedence - second.precedence;
    }

    return first.label.localeCompare(second.label);
  });
}

function normalizeAddons(rawAddons) {
  return normalizeList(rawAddons, DEFAULT_DATASET.addons, (item, fallback) => ({
    id: normalizeId(item.id, fallback.id),
    label: normalizeLabel(item.label, fallback.label),
    description: normalizeLabel(item.description, fallback.description),
    price: toNumber(item.price, fallback.price),
    icon: normalizeLabel(item.icon, fallback.icon),
  }));
}

export function normalizeDataset(rawDataset = {}) {
  const source = rawDataset && typeof rawDataset === 'object' ? rawDataset : {};
  const sizes = normalizeSizes(source.sizes);
  const woods = normalizeWoods(source.woods);
  const hardware = normalizeHardware(source.hardware);
  const branches = normalizeBranches(source.branches);
  const awards = normalizeAwards(source.awards);
  const addons = normalizeAddons(source.addons);
  const pricing = normalizePricing(source.pricing);
  const commerce = normalizeCommerce(source.commerce);

  const fallbackDefaults = DEFAULT_DATASET.defaults;
  const sourceDefaults = source.defaults || {};

  return {
    id: normalizeLabel(source.id, DEFAULT_DATASET.id),
    version: normalizeLabel(source.version, DEFAULT_DATASET.version),
    currency: normalizeLabel(source.currency, DEFAULT_DATASET.currency),
    commerce,
    pricing,
    defaults: {
      size: resolveDefaultId(sourceDefaults.size, sizes, sizes[0].id || fallbackDefaults.size),
      wood: resolveDefaultId(sourceDefaults.wood, woods, woods[0].id || fallbackDefaults.wood),
      hardware: resolveDefaultId(
        sourceDefaults.hardware,
        hardware,
        hardware[0].id || fallbackDefaults.hardware,
      ),
      branch: resolveDefaultId(
        sourceDefaults.branch,
        branches,
        branches[0].id || fallbackDefaults.branch,
      ),
      inscription: getInscriptionText(sourceDefaults.inscription, fallbackDefaults.inscription),
    },
    sizes,
    woods,
    hardware,
    branches,
    awards,
    addons,
  };
}

export function getSelectedEntry(collection = [], selectedId = '', fallbackId = '') {
  const items = Array.isArray(collection) ? collection : [];
  return items.find((item) => item.id === selectedId)
    || items.find((item) => item.id === fallbackId)
    || items[0]
    || null;
}

export function createInitialState(data) {
  return {
    sizeId: data.defaults.size,
    woodId: data.defaults.wood,
    hardwareId: data.defaults.hardware,
    branchId: data.defaults.branch,
    inscriptionValue: data.defaults.inscription,
    awardQuantities: {},
    breakdownOpen: false,
  };
}

export function clampAwardQuantity(value) {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export function syncAwardsForBranch(data, awardQuantities = {}, branchId = '') {
  const allowedIds = new Set(
    (Array.isArray(data?.awards) ? data.awards : [])
      .filter((award) => award.branch === branchId)
      .map((award) => award.id),
  );

  return Object.entries(awardQuantities || {}).reduce((acc, [awardId, quantity]) => {
    const normalizedQuantity = clampAwardQuantity(quantity);
    if (allowedIds.has(awardId) && normalizedQuantity > 0) {
      acc[awardId] = normalizedQuantity;
    }
    return acc;
  }, {});
}

export function getAwardsForBranch(data, branchId) {
  return (Array.isArray(data?.awards) ? data.awards : [])
    .filter((award) => award.branch === branchId)
    .sort((first, second) => {
      if (first.precedence !== second.precedence) {
        return first.precedence - second.precedence;
      }

      return first.label.localeCompare(second.label);
    });
}

export function getSelectedAwards(data, state) {
  const quantities = syncAwardsForBranch(data, state?.awardQuantities, state?.branchId);
  return getAwardsForBranch(data, state?.branchId)
    .map((award) => ({
      ...award,
      quantity: clampAwardQuantity(quantities[award.id]),
    }))
    .filter((award) => award.quantity > 0);
}

export function getAwardSelectionState(data, state) {
  const size = getSelectedEntry(data.sizes, state.sizeId, data.defaults.size);
  const awards = getSelectedAwards(data, state);
  const total = awards.reduce((sum, award) => sum + award.quantity, 0);
  const maxAwards = toNumber(size?.maxAwards, 0);
  const overLimit = maxAwards > 0 && total > maxAwards;

  return {
    awards,
    total,
    maxAwards,
    remaining: Math.max(maxAwards - total, 0),
    overLimit,
    valid: total > 0 && !overLimit,
  };
}

export function serializeAwardManifest(data, state) {
  return getSelectedAwards(data, state)
    .map((award) => `${award.precedence}|${award.id}|${award.label}|qty:${award.quantity}`)
    .join('\n');
}

export function getConfigurationValidation(data, state) {
  const size = getSelectedEntry(data.sizes, state.sizeId, data.defaults.size);
  const wood = getSelectedEntry(data.woods, state.woodId, data.defaults.wood);
  const hardware = getSelectedEntry(data.hardware, state.hardwareId, data.defaults.hardware);
  const branch = getSelectedEntry(data.branches, state.branchId, data.defaults.branch);
  const inscription = getInscriptionText(state.inscriptionValue, '');
  const awardState = getAwardSelectionState(data, state);
  const manifest = serializeAwardManifest(data, state);

  const valid = Boolean(size)
    && Boolean(wood)
    && Boolean(hardware)
    && Boolean(branch)
    && Boolean(inscription)
    && awardState.valid
    && manifest.length > 0
    && manifest.length <= AWARD_MANIFEST_MAX_LENGTH;

  let message = '';
  if (!inscription) {
    message = 'Enter an inscription before adding this rack to cart.';
  } else if (awardState.total === 0) {
    message = 'Select at least one award to build the award manifest.';
  } else if (awardState.overLimit) {
    message = `${size?.label || 'This size'} supports up to ${awardState.maxAwards} awards.`;
  } else if (manifest.length > AWARD_MANIFEST_MAX_LENGTH) {
    message = `The generated award manifest exceeds ${AWARD_MANIFEST_MAX_LENGTH} characters.`;
  }

  return {
    valid,
    inscription,
    manifest,
    awardState,
    message,
  };
}

export function getSelectionSnapshot(data, state) {
  const size = getSelectedEntry(data.sizes, state.sizeId, data.defaults.size);
  const wood = getSelectedEntry(data.woods, state.woodId, data.defaults.wood);
  const hardware = getSelectedEntry(data.hardware, state.hardwareId, data.defaults.hardware);
  const branch = getSelectedEntry(data.branches, state.branchId, data.defaults.branch);
  const inscription = getInscriptionText(state.inscriptionValue, data.defaults.inscription);
  const awardState = getAwardSelectionState(data, state);

  return {
    size,
    wood,
    hardware,
    branch,
    inscription,
    awards: awardState.awards,
    awardCount: awardState.total,
    maxAwards: awardState.maxAwards,
  };
}

export function getSummaryChips(data, state) {
  const snapshot = getSelectionSnapshot(data, state);
  return [
    { label: 'Size', value: snapshot.size?.label || '' },
    { label: 'Wood', value: snapshot.wood?.label || '' },
    { label: 'Hardware', value: snapshot.hardware?.label || '' },
    { label: 'Branch', value: snapshot.branch?.label || '' },
    { label: 'Engraving', value: snapshot.inscription },
    {
      label: 'Awards',
      value: snapshot.awardCount
        ? `${snapshot.awardCount} of ${snapshot.maxAwards}`
        : `0 of ${snapshot.maxAwards}`,
    },
  ].filter((chip) => chip.value);
}

export function computePricing(data, state) {
  const snapshot = getSelectionSnapshot(data, state);
  const sizeCost = snapshot.size?.cost || 0;
  const woodCost = snapshot.wood?.cost || 0;
  const hardwareCost = snapshot.hardware?.cost || 0;
  const total = data.pricing.base + sizeCost + woodCost + hardwareCost;

  return {
    currency: data.currency,
    lines: [
      {
        id: 'base',
        label: 'Base rack',
        amount: data.pricing.base,
      },
      {
        id: 'size',
        label: 'Rack size',
        amount: sizeCost,
      },
      {
        id: 'wood',
        label: 'Wood finish',
        amount: woodCost,
      },
      {
        id: 'hardware',
        label: 'Hardware finish',
        amount: hardwareCost,
      },
    ],
    total,
  };
}

export function getPreviewState(data, state) {
  const snapshot = getSelectionSnapshot(data, state);

  return {
    sizeLabel: snapshot.size?.label || '',
    sizeDimensions: snapshot.size?.dimensions || '',
    woodLabel: snapshot.wood?.label || '',
    woodGradientId: snapshot.wood?.gradientId || data.woods[0]?.gradientId || '',
    hardwareLabel: snapshot.hardware?.label || '',
    pinColor: snapshot.hardware?.pinColor || data.hardware[0]?.pinColor || '',
    plateColor: snapshot.hardware?.plateColor || data.hardware[0]?.plateColor || '',
    borderColor: snapshot.hardware?.pinColor || data.hardware[0]?.pinColor || '',
    branchLabel: snapshot.branch?.label || '',
    branchWatermark: snapshot.branch?.watermark || snapshot.branch?.label || '',
    inscription: snapshot.inscription,
    awardCount: snapshot.awardCount,
    maxAwards: snapshot.maxAwards,
  };
}

function getOptionItems(option) {
  return Array.isArray(option?.items) ? option.items : [];
}

function findOptionByLabel(options = [], label = '') {
  const target = normalizeKey(label);
  return options.find((option) => normalizeKey(option?.label) === target) || null;
}

function findInputOptionByLabel(inputOptions = [], label = '') {
  const target = normalizeKey(label);
  return inputOptions.find(
    (option) => normalizeKey(option?.title || option?.label) === target,
  ) || null;
}

function findOptionItemByLabel(items = [], label = '') {
  const target = normalizeKey(label);
  return items.find((item) => normalizeKey(item?.label) === target) || null;
}

function ensureLengthRange(option, minimum) {
  const maximum = toNumber(option?.range?.to, 0);
  return maximum === 0 || maximum >= minimum;
}

export function resolveEnteredOptionUIDsByLabel(product, optionLabels = {}) {
  const inputOptions = Array.isArray(product?.inputOptions) ? product.inputOptions : [];
  const inscription = findInputOptionByLabel(inputOptions, optionLabels.inscription);
  const awardManifest = findInputOptionByLabel(inputOptions, optionLabels.awardManifest);

  return {
    inscription: inscription?.id || '',
    awardManifest: awardManifest?.id || '',
  };
}

export function resolveCommerceOptionMappings(data, product) {
  const options = Array.isArray(product?.options) ? product.options : [];
  const inputOptions = Array.isArray(product?.inputOptions) ? product.inputOptions : [];
  const missing = [];
  const selectable = {};
  const selectableSources = {
    size: data.sizes,
    wood: data.woods,
    hardware: data.hardware,
    branch: data.branches,
  };

  Object.entries(selectableSources).forEach(([key, entries]) => {
    const optionLabel = data.commerce.optionLabels[key];
    const option = findOptionByLabel(options, optionLabel);

    if (!option) {
      missing.push(`Missing Commerce option "${optionLabel}".`);
      return;
    }

    const uidByValueId = {};
    entries.forEach((entry) => {
      const item = findOptionItemByLabel(getOptionItems(option), entry.label);
      if (!item?.id) {
        missing.push(`Missing "${entry.label}" on Commerce option "${optionLabel}".`);
        return;
      }

      uidByValueId[entry.id] = item.id;
    });

    selectable[key] = {
      optionLabel,
      uidByValueId,
    };
  });

  const inscriptionOption = findInputOptionByLabel(
    inputOptions,
    data.commerce.optionLabels.inscription,
  );
  const awardManifestOption = findInputOptionByLabel(
    inputOptions,
    data.commerce.optionLabels.awardManifest,
  );

  if (!inscriptionOption?.id) {
    missing.push(`Missing entered option "${data.commerce.optionLabels.inscription}".`);
  } else if (!ensureLengthRange(inscriptionOption, MAX_INSCRIPTION_LENGTH)) {
    missing.push(
      `"${data.commerce.optionLabels.inscription}" must allow at least ${MAX_INSCRIPTION_LENGTH} characters.`,
    );
  }

  if (!awardManifestOption?.id) {
    missing.push(`Missing entered option "${data.commerce.optionLabels.awardManifest}".`);
  } else {
    if (awardManifestOption.required !== true) {
      missing.push(`"${data.commerce.optionLabels.awardManifest}" must be required.`);
    }

    if (normalizeKey(awardManifestOption.type) !== 'area') {
      missing.push(`"${data.commerce.optionLabels.awardManifest}" must be a text area.`);
    }

    if (!ensureLengthRange(awardManifestOption, AWARD_MANIFEST_MAX_LENGTH)) {
      missing.push(
        `"${data.commerce.optionLabels.awardManifest}" must allow at least ${AWARD_MANIFEST_MAX_LENGTH} characters.`,
      );
    }
  }

  if (missing.length > 0) {
    throw new Error(missing.join(' '));
  }

  return {
    selectable,
    enteredOptions: {
      inscription: inscriptionOption.id,
      awardManifest: awardManifestOption.id,
    },
  };
}

export function mapSelectionsToOptionsUIDs(state, selectableMappings = {}) {
  const keyOrder = ['size', 'wood', 'hardware', 'branch'];
  const selectionByKey = {
    size: state.sizeId,
    wood: state.woodId,
    hardware: state.hardwareId,
    branch: state.branchId,
  };

  return keyOrder.map((key) => selectableMappings[key]?.uidByValueId?.[selectionByKey[key]] || '');
}

export function buildEnteredOptionsPayload(data, state, enteredOptionUIDs = {}) {
  const validation = getConfigurationValidation(data, state);
  const entries = [];

  if (enteredOptionUIDs.inscription && validation.inscription) {
    entries.push({
      uid: enteredOptionUIDs.inscription,
      value: validation.inscription,
    });
  }

  if (enteredOptionUIDs.awardManifest && validation.manifest) {
    entries.push({
      uid: enteredOptionUIDs.awardManifest,
      value: validation.manifest,
    });
  }

  return entries;
}

export function getConfiguredSku(product, fallbackSku = '') {
  return product?.variantSku || product?.sku || fallbackSku || '';
}

export function buildBaseCartPayload(product, data, state, mappings) {
  return {
    sku: getConfiguredSku(product, data?.commerce?.baseSku),
    quantity: 1,
    optionsUIDs: mapSelectionsToOptionsUIDs(state, mappings?.selectable),
    enteredOptions: buildEnteredOptionsPayload(data, state, mappings?.enteredOptions),
  };
}

export const TECHNICAL_DETAILS_PRESENTATIONS = Object.freeze({
  DEFAULT: 'default',
  RACK_IMMERSIVE: 'rack-immersive',
});

const DEFAULT_TITLES = Object.freeze({
  specsTitle: 'Technical Specifications',
  featuresTitle: 'Key Features',
  detailsTitle: 'Full Details',
});

function asTrimmedString(value, fallback = '') {
  const normalized = String(value ?? fallback).trim();
  return normalized || String(fallback || '').trim();
}

export function normalizeKey(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTechnicalDetailsPresentation(value = '') {
  const normalized = normalizeKey(value);

  if (normalized === TECHNICAL_DETAILS_PRESENTATIONS.RACK_IMMERSIVE) {
    return TECHNICAL_DETAILS_PRESENTATIONS.RACK_IMMERSIVE;
  }

  return TECHNICAL_DETAILS_PRESENTATIONS.DEFAULT;
}

export function normalizeBooleanValue(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;

  return fallback;
}

function normalizeSpecCard(card = {}, index = 0) {
  return {
    id: asTrimmedString(card.id, `spec-card-${index + 1}`),
    icon: asTrimmedString(card.icon, ''),
    label: asTrimmedString(card.label, `Specification ${index + 1}`),
    attribute: asTrimmedString(card.attribute, ''),
    fallbackValue: asTrimmedString(card.fallbackValue, ''),
    value: asTrimmedString(card.value, ''),
    unit: asTrimmedString(card.unit, ''),
  };
}

function normalizeFeature(feature = {}, index = 0) {
  return {
    id: asTrimmedString(feature.id, `feature-${index + 1}`),
    title: asTrimmedString(feature.title, `Feature ${index + 1}`),
    description: asTrimmedString(feature.description, ''),
  };
}

function normalizeDetailRow(row = {}, sectionIndex = 0, rowIndex = 0) {
  return {
    id: asTrimmedString(row.id, `detail-row-${sectionIndex + 1}-${rowIndex + 1}`),
    label: asTrimmedString(row.label, `Detail ${rowIndex + 1}`),
    attribute: asTrimmedString(row.attribute, ''),
    value: asTrimmedString(row.value, ''),
  };
}

function normalizeDetailSection(section = {}, index = 0) {
  return {
    id: asTrimmedString(section.id, `detail-section-${index + 1}`),
    title: asTrimmedString(section.title, `Section ${index + 1}`),
    open: normalizeBooleanValue(section.open, index === 0),
    rows: (Array.isArray(section.rows) ? section.rows : [])
      .map((row, rowIndex) => normalizeDetailRow(row, index, rowIndex)),
  };
}

export function normalizeDataset(dataset = {}) {
  const specCards = (Array.isArray(dataset.specCards) ? dataset.specCards : [])
    .map((card, index) => normalizeSpecCard(card, index));
  const features = (Array.isArray(dataset.features) ? dataset.features : [])
    .map((feature, index) => normalizeFeature(feature, index));
  const detailsSections = (Array.isArray(dataset.detailsSections) ? dataset.detailsSections : [])
    .map((section, index) => normalizeDetailSection(section, index));

  const hasOpenSection = detailsSections.some((section) => section.open);
  const normalizedSections = detailsSections.map((section, index) => ({
    ...section,
    open: hasOpenSection ? section.open : index === 0,
  }));

  return {
    specsTitle: asTrimmedString(dataset.specsTitle, DEFAULT_TITLES.specsTitle),
    featuresTitle: asTrimmedString(dataset.featuresTitle, DEFAULT_TITLES.featuresTitle),
    detailsTitle: asTrimmedString(dataset.detailsTitle, DEFAULT_TITLES.detailsTitle),
    specCards,
    features,
    detailsSections: normalizedSections,
  };
}

export function buildAttributeLookup(product = {}) {
  const lookup = new Map();
  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];

  attributes.forEach((attribute) => {
    const value = asTrimmedString(attribute?.value, '');
    if (!value) return;

    [
      attribute?.name,
      attribute?.label,
      attribute?.code,
      attribute?.attributeCode,
      attribute?.attribute_code,
    ]
      .map((key) => normalizeKey(key))
      .filter(Boolean)
      .forEach((key) => {
        if (!lookup.has(key)) {
          lookup.set(key, value);
        }
      });
  });

  return lookup;
}

export function resolveMappedValue(product = {}, field = {}) {
  const lookup = buildAttributeLookup(product);
  const attributeKey = normalizeKey(field.attribute);

  if (attributeKey && lookup.has(attributeKey)) {
    return lookup.get(attributeKey);
  }

  if (field.value) {
    return asTrimmedString(field.value, '');
  }

  if (field.fallbackValue) {
    return asTrimmedString(field.fallbackValue, '');
  }

  return '';
}

function splitDisplayValue(value = '', unit = '') {
  const displayValue = asTrimmedString(value, '');
  const displayUnit = asTrimmedString(unit, '');

  if (!displayUnit) {
    return {
      value: displayValue,
      unit: '',
    };
  }

  const isNumericLike = /^[<>\d\s.,+-]+$/.test(displayValue);
  return {
    value: displayValue,
    unit: isNumericLike ? displayUnit : '',
  };
}

export function resolveTechnicalDetails(product = {}, dataset = {}) {
  const normalized = normalizeDataset(dataset);

  return {
    ...normalized,
    specCards: normalized.specCards.map((card) => {
      const resolvedValue = resolveMappedValue(product, card);
      const display = splitDisplayValue(resolvedValue, card.unit);

      return {
        ...card,
        displayValue: display.value,
        displayUnit: display.unit,
      };
    }),
    detailsSections: normalized.detailsSections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        resolvedValue: resolveMappedValue(product, row),
      })),
    })),
  };
}

export function shouldRenderTechnicalDetails(presentation = 'default', payload = {}) {
  const normalized = normalizeTechnicalDetailsPresentation(presentation);

  if (normalized === TECHNICAL_DETAILS_PRESENTATIONS.DEFAULT) {
    return true;
  }

  return payload?.status === 'ready' && payload?.presentation === normalized;
}

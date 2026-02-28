const MERCHANDISING_FACET_HINTS = [
  'brand',
  'manufacturer',
  'vendor',
  'series',
  'line',
  'collection',
];

const AVAILABILITY_FACET_HINTS = [
  'stock',
  'availability',
  'in_stock',
  'instock',
  'status',
];

function normalizeAttribute(attribute) {
  return String(attribute || '').trim();
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeBucketTitle(value) {
  return normalizeText(value).toLowerCase();
}

function getFilterKey(filter) {
  if (!filter?.attribute) return '';

  const attribute = normalizeAttribute(filter.attribute).toLowerCase();
  if (filter.range && Number.isFinite(filter.range.from) && Number.isFinite(filter.range.to)) {
    return `${attribute}:range:${filter.range.from}-${filter.range.to}`;
  }

  if (Array.isArray(filter.in)) {
    const values = filter.in
      .map((value) => normalizeText(value).toLowerCase())
      .filter(Boolean)
      .sort();
    return `${attribute}:in:${values.join('|')}`;
  }

  if (typeof filter.eq === 'string' && filter.eq.trim()) {
    return `${attribute}:eq:${filter.eq.trim().toLowerCase()}`;
  }

  return `${attribute}:raw`;
}

export function hasFilter(filters, filter) {
  const normalizedFilters = Array.isArray(filters) ? filters : [];
  const targetKey = getFilterKey(filter);
  if (!targetKey) return false;
  return normalizedFilters.some((candidate) => getFilterKey(candidate) === targetKey);
}

export function toggleFilter(filters, filter) {
  const normalizedFilters = Array.isArray(filters) ? filters : [];
  const targetKey = getFilterKey(filter);
  if (!targetKey) return [...normalizedFilters];

  if (normalizedFilters.some((candidate) => getFilterKey(candidate) === targetKey)) {
    return normalizedFilters.filter((candidate) => getFilterKey(candidate) !== targetKey);
  }

  return [...normalizedFilters, filter];
}

export function serializeFiltersToParam(filters = []) {
  const segments = filters.map((filter) => {
    const attribute = normalizeAttribute(filter.attribute);
    if (!attribute) return null;

    if (Array.isArray(filter.in) && filter.in.length > 0) {
      return `${attribute}:${filter.in.join(',')}`;
    }

    if (filter.range && Number.isFinite(filter.range.from) && Number.isFinite(filter.range.to)) {
      return `${attribute}:${filter.range.from}-${filter.range.to}`;
    }

    if (typeof filter.eq === 'string' && filter.eq.trim()) {
      return `${attribute}:${filter.eq.trim()}`;
    }

    return null;
  }).filter(Boolean);

  return segments.join('|');
}

export function parseFilterParam(filterParam) {
  if (!filterParam) return [];

  const decoded = decodeURIComponent(filterParam);
  const filters = [];

  decoded.split('|').forEach((segment) => {
    if (!segment.includes(':')) return;

    const [attribute, rawValue] = segment.split(':');
    if (!attribute || !rawValue) return;

    if (rawValue.includes('-')) {
      const [fromRaw, toRaw] = rawValue.split('-');
      const from = Number(fromRaw);
      const to = Number(toRaw);
      if (!Number.isNaN(from) && !Number.isNaN(to)) {
        filters.push({
          attribute,
          range: { from, to },
        });
        return;
      }
    }

    filters.push({
      attribute,
      in: rawValue.split(',').map((value) => value.trim()).filter(Boolean),
    });
  });

  return filters;
}

function pickBuckets(facet) {
  if (!Array.isArray(facet?.buckets)) return [];

  return [...facet.buckets]
    .filter((bucket) => Number(bucket?.count || 0) > 0)
    .sort((a, b) => Number(b?.count || 0) - Number(a?.count || 0));
}

function toPriceLabel(bucket) {
  if (typeof bucket?.title === 'string' && bucket.title.trim()) {
    return bucket.title.trim();
  }

  const from = Number(bucket?.from);
  const to = Number(bucket?.to);
  if (Number.isFinite(from) && Number.isFinite(to)) {
    return `$${from} - $${to}`;
  }

  return 'Price';
}

function buildChipFromBucket(facet, bucket) {
  const attribute = normalizeAttribute(facet?.attribute);
  if (!attribute) return null;

  if (attribute.toLowerCase() === 'price'
    && Number.isFinite(Number(bucket?.from))
    && Number.isFinite(Number(bucket?.to))) {
    return {
      id: `${attribute}:${bucket.from}-${bucket.to}`,
      label: toPriceLabel(bucket),
      attribute,
      filter: {
        attribute,
        range: {
          from: Number(bucket.from),
          to: Number(bucket.to),
        },
      },
    };
  }

  const bucketTitle = normalizeText(bucket?.title);
  if (!bucketTitle) return null;

  return {
    id: `${attribute}:${bucketTitle.toLowerCase()}`,
    label: bucketTitle,
    attribute,
    filter: {
      attribute,
      in: [bucketTitle],
    },
  };
}

function getFacetByPriority(facets, predicate) {
  return facets.find((facet) => (
    predicate(normalizeAttribute(facet?.attribute).toLowerCase(), facet)
  ));
}

function isMerchandisingFacet(attribute) {
  return MERCHANDISING_FACET_HINTS.some((hint) => attribute.includes(hint));
}

function isAvailabilityFacet(attribute) {
  return AVAILABILITY_FACET_HINTS.some((hint) => attribute.includes(hint));
}

function pickAvailabilityBucket(facet) {
  const buckets = pickBuckets(facet);
  const inStockBucket = buckets.find((bucket) => {
    const title = normalizeBucketTitle(bucket?.title);
    return title.includes('in stock') || title.includes('available');
  });

  return inStockBucket || buckets[0] || null;
}

function uniqueFacetInsert(list, facet) {
  if (!facet) return;
  const facetAttribute = normalizeAttribute(facet?.attribute);
  if (list.some((existing) => normalizeAttribute(existing?.attribute) === facetAttribute)) {
    return;
  }
  list.push(facet);
}

export function deriveQuickChips(facets = [], options = {}) {
  const maxChips = Number.isFinite(options.maxChips) ? options.maxChips : 4;
  if (!Array.isArray(facets) || facets.length === 0) return [];

  const selectedFacets = [];

  uniqueFacetInsert(selectedFacets, getFacetByPriority(facets, (attribute) => attribute === 'price'));
  uniqueFacetInsert(selectedFacets, getFacetByPriority(facets, (attribute) => attribute === 'categories'));
  uniqueFacetInsert(
    selectedFacets,
    getFacetByPriority(facets, (attribute) => isMerchandisingFacet(attribute)),
  );
  uniqueFacetInsert(
    selectedFacets,
    getFacetByPriority(facets, (attribute) => isAvailabilityFacet(attribute)),
  );

  facets.forEach((facet) => {
    if (selectedFacets.length >= maxChips) return;
    uniqueFacetInsert(selectedFacets, facet);
  });

  const chips = [];
  selectedFacets.forEach((facet) => {
    if (chips.length >= maxChips) return;

    const attribute = normalizeAttribute(facet?.attribute).toLowerCase();
    const bucket = attribute === 'availability' || isAvailabilityFacet(attribute)
      ? pickAvailabilityBucket(facet)
      : pickBuckets(facet)[0];

    if (!bucket) return;

    const chip = buildChipFromBucket(facet, bucket);
    if (chip) {
      chips.push(chip);
    }
  });

  return chips.slice(0, maxChips);
}

export function stripSystemFilters(filters = []) {
  return filters.filter((filter) => {
    const attribute = normalizeAttribute(filter.attribute).toLowerCase();
    return attribute !== 'visibility' && attribute !== 'categorypath';
  });
}

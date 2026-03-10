export const DEFAULT_EXPERIMENTATION_CONFIG = {
  registryPath: '/data/experiments/registry.json',
  siteId: 'current-site',
  debugEnabled: false,
  assignmentTtlSeconds: 60 * 60 * 24 * 30,
  slotHideTimeoutMs: 160,
  metricsAdapter: 'mock/local',
};

export const STORAGE_KEYS = {
  identity: 'eds-experiments:visitor-id',
  assignments: 'eds-experiments:assignments',
  events: 'eds-experiments:events',
  markupCache: 'eds-experiments:markup-cache',
  studioDrafts: 'eds-experiments:studio-drafts',
};

export const EXPERIMENT_EVENTS = {
  assigned: 'experimentation/assigned',
  exposed: 'experimentation/exposed',
  conversion: 'experimentation/conversion',
};

export function slugify(value = '') {
  return `${value}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-{2,}/g, '-');
}

export function hashString(input = '') {
  return `${input}`.split('').reduce((accumulator, character) => (
    (accumulator * 31 + character.charCodeAt(0)) % 2147483647
  ), 0);
}

export function createStableVisitorId(seed = '') {
  const state = hashString(`${seed}:${Date.now()}:${Math.random()}`);
  return `exp_${state.toString(36)}`;
}

export function hashToUnitInterval(seed = '') {
  return hashString(seed) / 2147483647;
}

export function getScheduleStatus(experiment, now = new Date()) {
  const start = experiment?.schedule?.start ? new Date(experiment.schedule.start) : null;
  const end = experiment?.schedule?.end ? new Date(experiment.schedule.end) : null;

  if (start && Number.isNaN(start.getTime())) return false;
  if (end && Number.isNaN(end.getTime())) return false;
  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
}

export function isExperimentRunnable(experiment, now = new Date()) {
  const status = `${experiment?.status || ''}`.toLowerCase();
  return ['active', 'running', 'live'].includes(status) && getScheduleStatus(experiment, now);
}

export function normalizePathname(pathname = '/') {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function normalizeStringList(values) {
  return Array.isArray(values)
    ? values.map((value) => `${value}`.trim().toLowerCase()).filter(Boolean)
    : [];
}

function normalizePathRules(paths = []) {
  return Array.isArray(paths)
    ? paths.map((path) => normalizePathname(`${path}`.trim())).filter(Boolean)
    : [];
}

export function createRuntimeContext({
  pathname = '/',
  referrer = '',
  device = 'desktop',
  pageType = 'CMS',
  authState = 'guest',
  customerGroupHash = '',
  segments = [],
  cartRules = [],
  geo = 'unknown',
  query = {},
  now = new Date(),
} = {}) {
  return {
    pathname: normalizePathname(pathname),
    referrer: `${referrer}`.toLowerCase(),
    device: `${device}`.toLowerCase(),
    pageType: `${pageType}`.toLowerCase(),
    authState: `${authState}`.toLowerCase(),
    customerGroupHash: `${customerGroupHash}`.trim().toLowerCase(),
    segments: normalizeStringList(segments),
    cartRules: normalizeStringList(cartRules),
    geo: `${geo}`.toLowerCase(),
    query,
    now,
  };
}

export function matchesAudience(experiment, runtimeContext) {
  const audience = experiment?.audience || {};
  const pathRules = normalizePathRules(audience.paths);
  const devices = normalizeStringList(audience.devices);
  const referrers = normalizeStringList(audience.referrers);
  const authStates = normalizeStringList(audience.authStates);
  const pageTypes = normalizeStringList(audience.pageTypes);
  const groups = normalizeStringList(audience.customerGroups);
  const segments = normalizeStringList(audience.segments);
  const cartRules = normalizeStringList(audience.cartRules);
  const geos = normalizeStringList(audience.geos);

  const pathMatch = !pathRules.length || pathRules.some((pathRule) => {
    if (pathRule.endsWith('*')) {
      return runtimeContext.pathname.startsWith(pathRule.slice(0, -1));
    }
    return runtimeContext.pathname === pathRule;
  });

  const deviceMatch = !devices.length || devices.includes(runtimeContext.device);
  const pageTypeMatch = !pageTypes.length || pageTypes.includes(runtimeContext.pageType);
  const authMatch = !authStates.length || authStates.includes(runtimeContext.authState);
  const referrerMatch = !referrers.length
    || referrers.some((value) => runtimeContext.referrer.includes(value));
  const groupMatch = !groups.length || groups.includes(runtimeContext.customerGroupHash);
  const segmentMatch = !segments.length
    || segments.some((value) => runtimeContext.segments.includes(value));
  const cartRuleMatch = !cartRules.length
    || cartRules.some((value) => runtimeContext.cartRules.includes(value));
  const geoMatch = !geos.length || geos.includes(runtimeContext.geo);

  return pathMatch
    && deviceMatch
    && pageTypeMatch
    && authMatch
    && referrerMatch
    && groupMatch
    && segmentMatch
    && cartRuleMatch
    && geoMatch;
}

export function getAllocationEntries(experiment) {
  const fallback = (experiment?.variants || []).map((variant) => ({
    variantKey: variant.key,
    weight: variant.key === 'control' ? 50 : 50,
  }));

  const source = Array.isArray(experiment?.allocation) && experiment.allocation.length
    ? experiment.allocation
    : fallback;

  return source
    .map((entry) => ({
      variantKey: entry.variantKey || entry.key,
      weight: Number(entry.weight || entry.allocation || 0),
    }))
    .filter((entry) => entry.variantKey && entry.weight > 0);
}

export function pickVariant(experiment, seed) {
  const entries = getAllocationEntries(experiment);
  const variants = experiment?.variants || [];

  if (!entries.length || !variants.length) {
    return variants.find((variant) => variant.key === 'control') || variants[0] || null;
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (!totalWeight) {
    return variants.find((variant) => variant.key === 'control') || variants[0] || null;
  }

  const threshold = hashToUnitInterval(seed) * totalWeight;
  let cursor = 0;

  for (let index = 0; index < entries.length; index += 1) {
    cursor += entries[index].weight;
    if (threshold <= cursor) {
      return variants.find((variant) => variant.key === entries[index].variantKey) || null;
    }
  }

  return variants.find((variant) => variant.key === entries[entries.length - 1].variantKey) || null;
}

export function createAssignmentSeed(experimentId, slotId, visitorId, pathname) {
  return `${experimentId}:${slotId}:${visitorId}:${pathname}`;
}

function isPreviewHost(hostname) {
  return hostname.includes('aem.page');
}

function extractEmbeddedUrl(candidate) {
  const match = `${candidate}`.match(/https?:\/\/[^\s)'"#]+/);
  return match ? match[0] : '';
}

export function normalizeSourceLink(sourceLink, currentOrigin = 'https://example.com') {
  const fallback = {
    sourceLink,
    sourceEnv: 'live',
    resolvedPath: '/',
    resolvedUrl: new URL('/', currentOrigin).toString(),
    siteId: new URL(currentOrigin).host,
  };

  if (!sourceLink) {
    return fallback;
  }

  try {
    let rawLink = `${sourceLink}`.trim();
    const authorUrl = new URL(rawLink, currentOrigin);

    if (authorUrl.hostname.endsWith('da.live')) {
      const embedded = extractEmbeddedUrl(authorUrl.hash) || extractEmbeddedUrl(authorUrl.search);
      if (embedded) {
        rawLink = embedded;
      } else if (authorUrl.searchParams.get('path')) {
        rawLink = authorUrl.searchParams.get('path');
      } else if (authorUrl.pathname && authorUrl.pathname !== '/') {
        rawLink = authorUrl.pathname;
      }
    }

    const resolved = new URL(rawLink, currentOrigin);
    const pathname = resolved.pathname.endsWith('.plain.html')
      ? resolved.pathname.replace(/\.plain\.html$/, '')
      : resolved.pathname;

    return {
      sourceLink,
      sourceEnv: isPreviewHost(resolved.hostname) ? 'preview' : 'live',
      resolvedPath: normalizePathname(pathname),
      resolvedUrl: resolved.toString(),
      siteId: resolved.host,
    };
  } catch (error) {
    return fallback;
  }
}

export function createPlainHtmlUrl(normalizedSource) {
  try {
    const url = new URL(normalizedSource.resolvedUrl);
    if (url.pathname.endsWith('.plain.html')) {
      return url.toString();
    }

    if (url.pathname.endsWith('.html')) {
      url.pathname = url.pathname.replace(/\.html$/, '.plain.html');
      return url.toString();
    }

    const barePath = url.pathname.replace(/\/$/, '');
    url.pathname = barePath ? `${barePath}.plain.html` : '/.plain.html';
    return url.toString();
  } catch (error) {
    return normalizedSource.resolvedUrl;
  }
}

function isFragmentPath(pathname = '') {
  return pathname.includes('/fragments/');
}

function getMainContainer(root) {
  return root.querySelector('main') || root;
}

function getSectionLabel(section, index) {
  const heading = section.querySelector('h1, h2, h3, h4, h5');
  if (heading?.textContent?.trim()) {
    return heading.textContent.trim();
  }

  return `Section ${index + 1}`;
}

export function collectSelectableTargets(root, source = {}) {
  const main = getMainContainer(root);
  const isFragmentSource = isFragmentPath(source.resolvedPath || source.resolvedUrl || '');
  const selections = [{
    key: isFragmentSource ? 'fragment-root' : 'page-root',
    selectionType: isFragmentSource ? 'fragment' : 'page',
    label: isFragmentSource ? 'Whole fragment' : 'Whole page',
    description: isFragmentSource
      ? 'Swap the full linked fragment payload'
      : 'Swap the entire main content area',
  }];

  const sections = [...main.querySelectorAll(':scope > div')];

  sections.forEach((section, sectionIndex) => {
    const label = getSectionLabel(section, sectionIndex);
    selections.push({
      key: `section:${sectionIndex}`,
      selectionType: 'section',
      label,
      description: `Section ${sectionIndex + 1}`,
    });

    [...section.querySelectorAll(':scope > div > div')].forEach((block, blockIndex) => {
      const blockName = block.classList[0] || 'block';
      selections.push({
        key: `block:${sectionIndex}:${blockIndex}:${blockName}`,
        selectionType: 'block',
        label: `${blockName} (${blockIndex + 1})`,
        description: `Block inside ${label}`,
      });
    });
  });

  return selections;
}

export function extractSelection(root, selectionType = 'page', selectionKey = 'page-root') {
  const main = getMainContainer(root);

  if (
    selectionType === 'page'
    || selectionType === 'fragment'
    || selectionKey === 'page-root'
    || selectionKey === 'fragment-root'
  ) {
    return main;
  }

  const sections = [...main.querySelectorAll(':scope > div')];

  if (selectionType === 'section') {
    const [, sectionIndex = '0'] = selectionKey.split(':');
    return sections[Number(sectionIndex)] || null;
  }

  if (selectionType === 'block') {
    const [, sectionIndex = '0', blockIndex = '0'] = selectionKey.split(':');
    const section = sections[Number(sectionIndex)];
    if (!section) return null;
    return [...section.querySelectorAll(':scope > div > div')][Number(blockIndex)] || null;
  }

  return null;
}

export function createSlotSelector(slotId) {
  return `[data-experiment-slot="${slotId}"]`;
}

export function createVariantFingerprint(experiment, variant) {
  return hashString(`${experiment.id}:${variant.key}:${variant.resolvedPath}:${variant.selectionKey}`).toString(36);
}

export function createExportBundle(experiments) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    experiments,
  }, null, 2);
}

/* eslint-disable import/extensions */
import { events } from '@dropins/tools/event-bus.js';
import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';
import { getPersonalizationData } from '@dropins/storefront-personalization/api.js';
import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
} from '../../scripts/aem.js';
import { checkIsAuthenticated, decorateLinks, detectPageType } from '../../scripts/commerce.js';
import {
  DEFAULT_EXPERIMENTATION_CONFIG,
  EXPERIMENT_EVENTS,
  STORAGE_KEYS,
  createAssignmentSeed,
  createPlainHtmlUrl,
  createSlotSelector,
  createVariantFingerprint,
  createRuntimeContext,
  isExperimentRunnable,
  matchesAudience,
  normalizeSourceLink,
  pickVariant,
  extractSelection,
} from './lib/experiments.mjs';
import {
  getOrCreateVisitorId,
  loadRegistry,
  localReportingAdapter,
} from './reporting/local-adapter.js';
import { createHttpReportingAdapter } from './reporting/http-adapter.js';

const activeAssignments = [];
let listenersBound = false;

function getExperimentationConfig() {
  const config = getConfigValue('experimentation') || {};
  return {
    ...DEFAULT_EXPERIMENTATION_CONFIG,
    registryPath: config['registry-path'] || DEFAULT_EXPERIMENTATION_CONFIG.registryPath,
    siteId: config['site-id'] || DEFAULT_EXPERIMENTATION_CONFIG.siteId,
    debugEnabled: config['debug-enabled'] ?? DEFAULT_EXPERIMENTATION_CONFIG.debugEnabled,
    assignmentTtlSeconds: Number(config['assignment-ttl-seconds'] || DEFAULT_EXPERIMENTATION_CONFIG.assignmentTtlSeconds),
    slotHideTimeoutMs: Number(config['slot-hide-timeout-ms'] || DEFAULT_EXPERIMENTATION_CONFIG.slotHideTimeoutMs),
    metricsAdapter: config['metrics-adapter'] || DEFAULT_EXPERIMENTATION_CONFIG.metricsAdapter,
  };
}

function getAdapter(config) {
  if (config.metricsAdapter === 'http') {
    return createHttpReportingAdapter(config['metrics-endpoint'] || '/api/experiments');
  }

  return localReportingAdapter;
}

function readAssignments() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.assignments) || '{}');
  } catch (error) {
    return {};
  }
}

function writeAssignments(assignments) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
  } catch (error) {
    // Ignore quota errors.
  }
}

function readMarkupCache() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEYS.markupCache) || '{}');
  } catch (error) {
    return {};
  }
}

function writeMarkupCache(cache) {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.markupCache, JSON.stringify(cache));
  } catch (error) {
    // Ignore cache write failures.
  }
}

function getOverride() {
  const params = new URLSearchParams(window.location.search);
  const experimentId = params.get('experiment');
  const variantKey = params.get('variant');

  if (params.get('exp_disable') === '1') {
    return { disabled: true };
  }

  if (experimentId && variantKey) {
    return {
      experimentId,
      variantKey,
      reason: 'url override',
    };
  }

  return null;
}

function getDeviceType() {
  if (window.matchMedia('(max-width: 767px)').matches) {
    return 'mobile';
  }

  if (window.matchMedia('(max-width: 1024px)').matches) {
    return 'tablet';
  }

  return 'desktop';
}

function getReferrerHost() {
  try {
    return new URL(document.referrer).host.toLowerCase();
  } catch (error) {
    return '';
  }
}

function normalizeHash(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function decorateFetchedMain(main) {
  decorateLinks(main);
  decorateButtons(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

async function fetchSourceMain(variant) {
  const normalized = normalizeSourceLink(
    variant.sourceLink || variant.resolvedPath,
    window.location.origin,
  );
  const cacheKey = createVariantFingerprint({ id: variant.key }, {
    ...variant,
    resolvedPath: normalized.resolvedPath,
  });
  const markupCache = readMarkupCache();
  const plainHtmlUrl = createPlainHtmlUrl(normalized);
  const cached = markupCache[cacheKey];

  if (cached?.html) {
    const main = document.createElement('main');
    main.innerHTML = cached.html;
    decorateFetchedMain(main);
    return main;
  }

  const response = await fetch(plainHtmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${plainHtmlUrl}`);
  }

  const html = await response.text();
  markupCache[cacheKey] = {
    html,
    cachedAt: Date.now(),
  };
  writeMarkupCache(markupCache);

  const main = document.createElement('main');
  main.innerHTML = html;
  decorateFetchedMain(main);
  return main;
}

function cloneSelection(selection, selectionType) {
  if (!selection) return null;

  if (selectionType === 'page' || selectionType === 'fragment') {
    const fragment = document.createDocumentFragment();
    [...selection.children].forEach((child) => {
      fragment.append(child.cloneNode(true));
    });
    return fragment;
  }

  return selection.cloneNode(true);
}

function markPageRoot(main) {
  main.dataset.experimentSlot = 'page-root';
}

function getSlotTarget(slotId) {
  if (slotId === 'page-root') {
    return document.querySelector('main');
  }

  return document.querySelector(createSlotSelector(slotId));
}

async function applyVariantToTarget(experiment, variant, target) {
  if (!variant?.sourceLink && !variant?.resolvedPath) {
    return false;
  }

  const fetchedMain = await fetchSourceMain(variant);
  const selection = extractSelection(
    fetchedMain,
    variant.selectionType || experiment.surface || 'page',
    variant.selectionKey || 'page-root',
  );

  if (!selection) {
    throw new Error(`Could not extract ${variant.selectionType}:${variant.selectionKey}`);
  }

  const cloned = cloneSelection(selection, variant.selectionType || experiment.surface);
  if (!cloned) {
    throw new Error('Could not clone selected content');
  }

  if (target.matches('main')) {
    target.replaceChildren(cloned);
    markPageRoot(target);
    return true;
  }

  target.replaceChildren(cloned);

  if (!target.classList.contains('block') && target.classList[0]) {
    decorateBlock(target);
  }

  return true;
}

function buildAssignmentPayload(experiment, variant, runtimeContext, reason, slotId) {
  const payload = {
    experimentId: experiment.id,
    experimentName: experiment.name,
    variantKey: variant.key,
    variantLabel: variant.label,
    slotId,
    pathname: runtimeContext.pathname,
    pageType: runtimeContext.pageType,
    device: runtimeContext.device,
    authState: runtimeContext.authState,
    referrer: runtimeContext.referrer,
    customerGroupHash: runtimeContext.customerGroupHash,
    segments: runtimeContext.segments,
    cartRules: runtimeContext.cartRules,
    reason,
    timestamp: new Date().toISOString(),
  };

  return payload;
}

async function recordAdapterEvent(adapter, payload) {
  await adapter.recordEvent(payload);
  events.emit(EXPERIMENT_EVENTS[payload.eventType] || payload.eventType, payload);

  if (window.adobeDataLayer?.push) {
    window.adobeDataLayer.push({
      event: `experiment-${payload.eventType}`,
      experimentContext: payload,
    });
  }
}

function buildExposureKey(payload) {
  return `${payload.experimentId}:${payload.variantKey}:${payload.slotId}:${payload.pathname}`;
}

async function recordAssignmentAndExposure(adapter, payload) {
  await recordAdapterEvent(adapter, {
    ...payload,
    eventType: 'assigned',
    metricKey: 'assigned',
  });

  const exposureKey = buildExposureKey(payload);
  if (window.sessionStorage.getItem(exposureKey)) {
    return;
  }

  window.sessionStorage.setItem(exposureKey, '1');
  await recordAdapterEvent(adapter, {
    ...payload,
    eventType: 'exposure',
    metricKey: 'exposure',
  });
}

function persistAssignment(config, experiment, variant, reason, pathname) {
  const assignments = readAssignments();
  assignments[experiment.id] = {
    variantKey: variant.key,
    reason,
    pathname,
    assignedAt: Date.now(),
    expiresAt: Date.now() + (config.assignmentTtlSeconds * 1000),
  };
  writeAssignments(assignments);
}

function getPersistedAssignment(config, experiment, pathname) {
  const assignments = readAssignments();
  const assignment = assignments[experiment.id];

  if (!assignment) return null;
  if (assignment.pathname !== pathname) return null;
  if (assignment.expiresAt < Date.now()) return null;

  return assignment;
}

function selectVariant(config, experiment, runtimeContext, visitorId) {
  const override = getOverride();
  const slotId = experiment.slotId || 'page-root';

  if (override?.disabled) {
    return null;
  }

  if (override?.experimentId === experiment.id) {
    const variant = experiment.variants.find((entry) => entry.key === override.variantKey);
    if (variant) {
      persistAssignment(config, experiment, variant, override.reason, runtimeContext.pathname);
      return { variant, reason: override.reason, slotId };
    }
  }

  const stored = getPersistedAssignment(config, experiment, runtimeContext.pathname);
  if (stored) {
    const variant = experiment.variants.find((entry) => entry.key === stored.variantKey);
    if (variant) {
      return { variant, reason: stored.reason || 'sticky assignment', slotId };
    }
  }

  const variant = pickVariant(
    experiment,
    createAssignmentSeed(experiment.id, slotId, visitorId, runtimeContext.pathname),
  );

  if (!variant) {
    return null;
  }

  persistAssignment(config, experiment, variant, 'bucketed', runtimeContext.pathname);
  return { variant, reason: 'bucketed', slotId };
}

function bindMetricsListeners(adapter) {
  if (listenersBound) {
    return;
  }

  listenersBound = true;

  const trackMetric = async (metricKey, value = 1, extra = {}) => {
    await Promise.all(activeAssignments.map((assignment) => recordAdapterEvent(adapter, {
      ...assignment.payload,
      ...extra,
      eventType: 'conversion',
      metricKey,
      value,
    })));
  };

  document.addEventListener('click', (event) => {
    const interactive = event.target.closest('a, button');
    if (!interactive || !activeAssignments.length) {
      return;
    }
    trackMetric('cta_click', 1, {
      href: interactive.getAttribute('href') || '',
      label: interactive.textContent?.trim() || interactive.getAttribute('aria-label') || '',
    });
  });

  let scrollTracked = false;
  document.addEventListener('scroll', () => {
    if (scrollTracked || !activeAssignments.length) {
      return;
    }

    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (height <= 0) {
      return;
    }

    const progress = Math.round((window.scrollY / height) * 100);
    if (progress >= 50) {
      scrollTracked = true;
      trackMetric('scroll_50', progress);
    }
  }, { passive: true });

  window.setTimeout(() => {
    if (activeAssignments.length) {
      trackMetric('engaged_session', 1);
    }
  }, 15000);

  if (window.adobeDataLayer?.push) {
    window.adobeDataLayer.push((dataLayer) => {
      dataLayer.addEventListener('add-to-cart', () => trackMetric('add_to_cart', 1));
      dataLayer.addEventListener('initiate-checkout', () => trackMetric('checkout_start', 1));
      dataLayer.addEventListener('place-order', (event) => {
        const revenue = Number(
          event?.eventInfo?.orderContext?.grandTotal
          || event?.orderContext?.grandTotal
          || 0,
        );
        trackMetric('purchase', 1);
        if (revenue) {
          trackMetric('revenue', revenue, { currency: 'USD' });
        }
      });
    });
  }

  events.on('quote-management/negotiable-quote-requested', () => trackMetric('quote_request', 1), { eager: true });
  events.on('quote-management/quote-template-generated', () => trackMetric('quote_template', 1), { eager: true });
  events.on('purchase-order/refresh', () => trackMetric('purchase_order', 1), { eager: true });
}

function getRecentDebugEvents(adapter, assignment, limit = 4) {
  if (typeof adapter.getEvents !== 'function') {
    return [];
  }

  return adapter.getEvents()
    .filter((event) => (
      event.experimentId === assignment.payload.experimentId
      && event.variantKey === assignment.payload.variantKey
    ))
    .slice(-limit)
    .reverse();
}

function renderDebugEvents(adapter, assignment) {
  const debugEvents = getRecentDebugEvents(adapter, assignment);

  if (!debugEvents.length) {
    return '<small>No tracked events yet.</small>';
  }

  return `
    <ul class="experiment-debug-panel__events">
      ${debugEvents.map((event) => `
        <li>
          <span>${event.metricKey}</span>
          <small>${new Date(event.timestamp).toLocaleTimeString()}</small>
        </li>
      `).join('')}
    </ul>
  `;
}

function createDebugPanel(assignments, adapter) {
  if (!getOverride() && new URLSearchParams(window.location.search).get('exp_debug') !== '1') {
    return;
  }

  const existing = document.querySelector('.experiment-debug-panel');
  if (existing) {
    existing.remove();
  }

  const panel = document.createElement('aside');
  panel.className = 'experiment-debug-panel';
  panel.innerHTML = `
    <button class="experiment-debug-panel__toggle" type="button">Experiments</button>
    <div class="experiment-debug-panel__body">
      <h3>Active Assignments</h3>
      <ul class="experiment-debug-panel__list">
        ${assignments.map((assignment) => `
          <li>
            <strong>${assignment.payload.experimentName}</strong>
            <span>${assignment.payload.variantLabel}</span>
            <small>${assignment.variant.sourceLink || 'current page'}</small>
            <small>${assignment.variant.resolvedPath || assignment.payload.pathname}</small>
            <small>${assignment.variant.selectionType || 'page'} / ${assignment.variant.selectionKey || 'page-root'}</small>
            <small>${assignment.payload.reason}</small>
            ${renderDebugEvents(adapter, assignment)}
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .experiment-debug-panel {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      width: 20rem;
      z-index: 9999;
      background: rgba(10, 17, 28, 0.92);
      color: #f7f4ef;
      border: 1px solid rgba(170, 255, 215, 0.35);
      border-radius: 1rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.32);
      overflow: hidden;
      font-family: 'Adobe Clean', sans-serif;
    }

    .experiment-debug-panel__toggle {
      width: 100%;
      padding: 0.85rem 1rem;
      background: transparent;
      border: 0;
      color: inherit;
      text-align: left;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .experiment-debug-panel__body {
      padding: 0 1rem 1rem;
    }

    .experiment-debug-panel__list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.75rem;
    }

    .experiment-debug-panel__list li {
      display: grid;
      gap: 0.2rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 0.84rem;
    }

    .experiment-debug-panel__list strong {
      color: #b6ffdf;
    }

    .experiment-debug-panel__events {
      margin: 0.35rem 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.2rem;
    }

    .experiment-debug-panel__events li {
      padding-top: 0;
      border-top: 0;
      grid-template-columns: 1fr auto;
      align-items: baseline;
    }
  `;

  panel.querySelector('.experiment-debug-panel__toggle').addEventListener('click', () => {
    panel.classList.toggle('is-collapsed');
    const body = panel.querySelector('.experiment-debug-panel__body');
    body.hidden = !body.hidden;
  });

  panel.querySelector('.experiment-debug-panel__body').hidden = false;
  document.head.append(style);
  document.body.append(panel);
}

function canRunExperiment(experiment, runtimeContext, claimedGroups) {
  const slotId = experiment.slotId || 'page-root';
  const group = experiment.mutualExclusionGroup;

  return Boolean(getSlotTarget(slotId))
    && isExperimentRunnable(experiment, runtimeContext.now)
    && matchesAudience(experiment, runtimeContext)
    && !(group && claimedGroups.has(group));
}

async function applyExperiment({
  adapter,
  config,
  experiment,
  runtimeContext,
  visitorId,
}) {
  const target = getSlotTarget(experiment.slotId || 'page-root');
  const selected = selectVariant(config, experiment, runtimeContext, visitorId);

  if (!target || !selected) {
    return null;
  }

  const { variant, reason, slotId } = selected;
  await applyVariantToTarget(experiment, variant, target);

  const payload = buildAssignmentPayload(experiment, variant, runtimeContext, reason, slotId);
  await recordAssignmentAndExposure(adapter, payload);

  return { experiment, variant, payload };
}

export async function initializeExperiments(main) {
  const config = getExperimentationConfig();
  const adapter = getAdapter(config);
  const registry = await loadRegistry(config);
  const visitorId = getOrCreateVisitorId();
  const personalization = getPersonalizationData();
  const runtimeContext = createRuntimeContext({
    pathname: window.location.pathname,
    referrer: getReferrerHost(),
    device: getDeviceType(),
    pageType: detectPageType(),
    authState: checkIsAuthenticated() ? 'authenticated' : 'guest',
    customerGroupHash: normalizeHash(events.lastPayload('auth/group-uid')),
    segments: personalization?.segments || [],
    cartRules: personalization?.cartRules || [],
  });

  markPageRoot(main);

  const claimedGroups = new Set();
  const appliedAssignments = [];

  await registry.reduce(
    (queue, experiment) => queue.then(async () => {
      if (!canRunExperiment(experiment, runtimeContext, claimedGroups)) {
        return;
      }

      try {
        const assignment = await applyExperiment({
          adapter,
          config,
          experiment,
          runtimeContext,
          visitorId,
        });

        if (!assignment) {
          return;
        }

        activeAssignments.push(assignment);
        appliedAssignments.push(assignment);

        if (experiment.mutualExclusionGroup) {
          claimedGroups.add(experiment.mutualExclusionGroup);
        }
      } catch (error) {
        // Keep control experience intact on fetch or extraction failure.
        // eslint-disable-next-line no-console
        console.warn('Experiment fallback to control', experiment.id, error);
      }
    }),
    Promise.resolve(),
  );

  bindMetricsListeners(adapter);
  createDebugPanel(appliedAssignments, adapter);

  return appliedAssignments;
}

export default initializeExperiments;

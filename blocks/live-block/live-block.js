import { events } from '@dropins/tools/event-bus.js';
import { readBlockConfig } from '../../scripts/aem.js';
import {
  checkIsAuthenticated,
  CUSTOMER_LOGIN_PATH,
  rootLink,
} from '../../scripts/commerce.js';

const DEFAULT_CONFIG = {
  title: 'Live Commerce Dashboard',
  guestCtaLabel: 'Sign in',
  guestCtaHref: CUSTOMER_LOGIN_PATH,
  rowsLimit: 3,
  showSparkline: true,
};

const MIN_ROWS = 1;
const MAX_ROWS = 5;
const FALLBACK_TEXT = 'Not available';
const EMPTY_ACTIVITY_TEXT = 'No recent commerce activity';

/**
 * Parse a string/boolean value to boolean.
 * @param {string | boolean | undefined} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
function parseBoolean(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
}

/**
 * Clamp rows limit to allowed range.
 * @param {string | number | undefined} value
 * @returns {number}
 */
function parseRowsLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return DEFAULT_CONFIG.rowsLimit;
  return Math.max(MIN_ROWS, Math.min(MAX_ROWS, parsed));
}

/**
 * Resolve author config with defaults.
 * @param {HTMLElement} block
 * @returns {object}
 */
function getConfig(block) {
  const config = readBlockConfig(block);
  return {
    title: config.title?.trim() || DEFAULT_CONFIG.title,
    guestCtaLabel: config['guest-cta-label']?.trim() || DEFAULT_CONFIG.guestCtaLabel,
    guestCtaHref: config['guest-cta-href']?.trim() || DEFAULT_CONFIG.guestCtaHref,
    rowsLimit: parseRowsLimit(config['rows-limit']),
    showSparkline: parseBoolean(config['show-sparkline'], DEFAULT_CONFIG.showSparkline),
  };
}

/**
 * Format monetary amount.
 * @param {number | undefined} value
 * @param {string | undefined} currency
 * @returns {string}
 */
function formatMoney(value, currency) {
  if (typeof value !== 'number' || Number.isNaN(value) || !currency) return FALLBACK_TEXT;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/**
 * Format integer count.
 * @param {number | undefined} value
 * @returns {string}
 */
function formatCount(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return FALLBACK_TEXT;
  return value.toLocaleString('en-US');
}

/**
 * Convert status code to display label.
 * @param {string | undefined} status
 * @returns {string}
 */
function formatStatus(status) {
  if (!status) return FALLBACK_TEXT;
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Convert configured href to localized route when needed.
 * @param {string} href
 * @returns {string}
 */
function resolveHref(href) {
  if (!href) return rootLink(CUSTOMER_LOGIN_PATH);
  if (href.startsWith('/')) return rootLink(href);
  return href;
}

/**
 * Build metric descriptor list from fetched data.
 * @param {object | null} orderHistory
 * @param {object | null} companyCredit
 * @param {object | null} myApprovals
 * @returns {Array<{label: string, value: string, isFallback?: boolean}>}
 */
function buildMetrics(orderHistory, companyCredit, myApprovals) {
  const credit = companyCredit?.credit?.available_credit;
  const approvalsCount = myApprovals?.totalCount;
  const ordersCount = orderHistory?.totalCount;

  return [
    {
      label: 'Credit Available',
      value: formatMoney(credit?.value, credit?.currency),
      isFallback: !credit || typeof credit.value !== 'number',
    },
    {
      label: 'Orders',
      value: formatCount(ordersCount),
      isFallback: typeof ordersCount !== 'number',
    },
    {
      label: 'Pending Approvals',
      value: formatCount(approvalsCount),
      isFallback: typeof approvalsCount !== 'number',
    },
  ];
}

/**
 * Build activity rows from purchase order list.
 * @param {object | null} purchaseOrders
 * @param {number} rowsLimit
 * @returns {Array<{id: string, label: string, sub: string, amount: string}>}
 */
function buildActivities(purchaseOrders, rowsLimit) {
  const items = purchaseOrders?.purchaseOrderItems || [];
  return items.slice(0, rowsLimit).map((po) => ({
    id: po.uid || po.number || '',
    label: po.number ? `PO #${po.number}` : 'Purchase Order',
    sub: formatStatus(po.status),
    amount: formatMoney(po.quote?.grandTotal?.value, po.quote?.grandTotal?.currency),
  }));
}

/**
 * Extract order total points for sparkline.
 * @param {object | null} orderHistory
 * @returns {number[]}
 */
function buildSparklinePoints(orderHistory) {
  const totals = (orderHistory?.items || [])
    .map((item) => item?.total?.grandTotal?.value)
    .filter((value) => typeof value === 'number' && Number.isFinite(value))
    .slice(0, 8);

  return totals.reverse();
}

/**
 * Build sparkline SVG from numeric points.
 * @param {number[]} points
 * @returns {SVGElement | null}
 */
function buildSparkline(points) {
  if (!Array.isArray(points) || points.length < 2) return null;

  const width = 320;
  const height = 76;
  const topPadding = 12;
  const bottomPadding = 12;
  const availableHeight = height - topPadding - bottomPadding;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  const stepX = width / (points.length - 1);

  const coordinates = points.map((point, index) => {
    const x = Math.round(index * stepX * 100) / 100;
    const normalized = (point - min) / range;
    const y = Math.round((height - bottomPadding - (normalized * availableHeight)) * 100) / 100;
    return [x, y];
  });

  const linePath = coordinates.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`;
  const [lastX, lastY] = coordinates[coordinates.length - 1];

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('live-block-sparkline-svg');

  const gradientId = `live-block-grad-${Math.random().toString(36).slice(2, 10)}`;
  const defs = document.createElementNS(ns, 'defs');
  const gradient = document.createElementNS(ns, 'linearGradient');
  gradient.setAttribute('id', gradientId);
  gradient.setAttribute('x1', '0');
  gradient.setAttribute('y1', '0');
  gradient.setAttribute('x2', '0');
  gradient.setAttribute('y2', '1');

  const stopA = document.createElementNS(ns, 'stop');
  stopA.setAttribute('offset', '0%');
  stopA.setAttribute('stop-color', '#0ca678');
  stopA.setAttribute('stop-opacity', '0.35');

  const stopB = document.createElementNS(ns, 'stop');
  stopB.setAttribute('offset', '100%');
  stopB.setAttribute('stop-color', '#0ca678');
  stopB.setAttribute('stop-opacity', '0');

  gradient.append(stopA, stopB);
  defs.append(gradient);

  const area = document.createElementNS(ns, 'path');
  area.setAttribute('d', areaPath);
  area.setAttribute('fill', `url(#${gradientId})`);

  const line = document.createElementNS(ns, 'path');
  line.setAttribute('d', linePath);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', '#22c55e');
  line.setAttribute('stroke-width', '2.5');
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('stroke-linejoin', 'round');

  const dot = document.createElementNS(ns, 'circle');
  dot.setAttribute('cx', String(lastX));
  dot.setAttribute('cy', String(lastY));
  dot.setAttribute('r', '3.8');
  dot.setAttribute('fill', '#22c55e');

  svg.append(defs, area, line, dot);
  return svg;
}

/**
 * Render guest-safe block state.
 * @param {HTMLElement} block
 * @param {object} config
 */
function renderGuest(block, config) {
  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-guest';
  wrapper.innerHTML = `
    <header class="live-block-header">
      <h2 class="live-block-title">${config.title}</h2>
      <span class="live-block-pill">Guest</span>
    </header>
    <p class="live-block-description">Sign in to view live commerce data.</p>
    <a class="live-block-cta" href="${resolveHref(config.guestCtaHref)}">${config.guestCtaLabel}</a>
  `;
  block.replaceChildren(wrapper);
}

/**
 * Render loading state.
 * @param {HTMLElement} block
 * @param {string} title
 */
function renderLoading(block, title) {
  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-loading';
  wrapper.innerHTML = `
    <header class="live-block-header">
      <h2 class="live-block-title">${title}</h2>
      <span class="live-block-pill">Live</span>
    </header>
    <p class="live-block-description" role="status">Loading commerce data...</p>
  `;
  block.replaceChildren(wrapper);
}

/**
 * Render authenticated data state.
 * @param {HTMLElement} block
 * @param {object} config
 * @param {Array<{label: string, value: string, isFallback?: boolean}>} metrics
 * @param {Array<{id: string, label: string, sub: string, amount: string}>} activities
 * @param {number[]} sparklinePoints
 */
function renderAuthenticated(block, config, metrics, activities, sparklinePoints) {
  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-auth';

  const metricsMarkup = metrics.map((metric) => `
    <article class="live-block-metric${metric.isFallback ? ' is-fallback' : ''}">
      <div class="live-block-metric-value">${metric.value}</div>
      <div class="live-block-metric-label">${metric.label}</div>
    </article>
  `).join('');

  const activityMarkup = activities.length > 0
    ? `<ul class="live-block-activity-list">
        ${activities.map((activity) => `
          <li class="live-block-activity-item">
            <div class="live-block-activity-main">
              <div class="live-block-activity-label">${activity.label}</div>
              <div class="live-block-activity-sub">${activity.sub}</div>
            </div>
            <div class="live-block-activity-amount">${activity.amount}</div>
          </li>
        `).join('')}
      </ul>`
    : `<p class="live-block-empty">${EMPTY_ACTIVITY_TEXT}</p>`;

  wrapper.innerHTML = `
    <header class="live-block-header">
      <h2 class="live-block-title">${config.title}</h2>
      <span class="live-block-pill">Live</span>
    </header>
    <div class="live-block-metrics">${metricsMarkup}</div>
    <div class="live-block-sparkline" aria-hidden="true"></div>
    <section class="live-block-activity" aria-label="Recent purchase orders">
      <h3 class="live-block-activity-title">Recent Purchase Orders</h3>
      ${activityMarkup}
    </section>
  `;

  const sparklineContainer = wrapper.querySelector('.live-block-sparkline');
  if (config.showSparkline) {
    const sparkline = buildSparkline(sparklinePoints);
    if (sparkline && sparklineContainer) {
      sparklineContainer.append(sparkline);
    } else if (sparklineContainer) {
      sparklineContainer.remove();
    }
  } else {
    sparklineContainer?.remove();
  }

  block.replaceChildren(wrapper);
}

/**
 * Render fetch error state.
 * @param {HTMLElement} block
 * @param {string} title
 */
function renderError(block, title) {
  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-error';
  wrapper.innerHTML = `
    <header class="live-block-header">
      <h2 class="live-block-title">${title}</h2>
      <span class="live-block-pill">Live</span>
    </header>
    <p class="live-block-empty" role="status">Unable to load live commerce data right now.</p>
  `;
  block.replaceChildren(wrapper);
}

/**
 * Execute a request and safely swallow failures.
 * @param {Function} requestFn
 * @returns {Promise<any | null>}
 */
async function safeRequest(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    console.warn('live-block: request failed', error);
    return null;
  }
}

/**
 * Initialize block and bind event refresh hooks.
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const config = getConfig(block);
  let refreshToken = 0;

  const refresh = async () => {
    const currentToken = refreshToken + 1;
    refreshToken = currentToken;

    if (!checkIsAuthenticated()) {
      renderGuest(block, config);
      return;
    }

    renderLoading(block, config.title);

    try {
      await Promise.all([
        import('../../scripts/initializers/account.js'),
        import('../../scripts/initializers/company.js'),
        import('../../scripts/initializers/purchase-order.js'),
      ]);

      const [
        accountApi,
        companyApi,
        purchaseOrderApi,
      ] = await Promise.all([
        import('@dropins/storefront-account/api.js'),
        import('@dropins/storefront-company-management/api.js'),
        import('@dropins/storefront-purchase-order/api.js'),
      ]);

      if (refreshToken !== currentToken) return;
      if (!checkIsAuthenticated()) {
        renderGuest(block, config);
        return;
      }

      const [
        orderHistory,
        companyCredit,
        allPurchaseOrders,
        myApprovals,
        companyPurchaseOrders,
      ] = await Promise.all([
        safeRequest(() => accountApi.getOrderHistoryList(20, 'viewAll', 1)),
        safeRequest(() => companyApi.getCompanyCredit()),
        safeRequest(() => purchaseOrderApi.getPurchaseOrders({}, 20, 1)),
        safeRequest(() => purchaseOrderApi.getPurchaseOrders({ myApprovals: true }, 20, 1)),
        safeRequest(
          () => purchaseOrderApi.getPurchaseOrders(
            { companyPurchaseOrders: true },
            config.rowsLimit,
            1,
          ),
        ),
      ]);

      if (refreshToken !== currentToken) return;

      const metrics = buildMetrics(orderHistory, companyCredit, myApprovals);
      const activities = buildActivities(
        companyPurchaseOrders || allPurchaseOrders,
        config.rowsLimit,
      );
      const sparklinePoints = buildSparklinePoints(orderHistory);

      renderAuthenticated(block, config, metrics, activities, sparklinePoints);
    } catch (error) {
      console.error('live-block: failed to load', error);
      if (refreshToken !== currentToken) return;
      renderError(block, config.title);
    }
  };

  await refresh();

  const authSubscription = events.on('authenticated', () => {
    refresh();
  });

  const purchaseOrderRefreshSubscription = events.on('purchase-order/refresh', () => {
    if (checkIsAuthenticated()) {
      refresh();
    }
  });

  block.addEventListener('DOMNodeRemoved', () => {
    authSubscription?.off?.();
    purchaseOrderRefreshSubscription?.off?.();
  }, { once: true });
}

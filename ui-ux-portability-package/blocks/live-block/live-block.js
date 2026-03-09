import {
  EMPTY_ACTIVITY_TEXT,
  FALLBACK_TEXT,
  SOURCE_STATUS,
  escapeHtml,
  formatCount,
  formatDateTime,
  formatMoney,
  getChartColor,
  getCommonConfig,
  metricsByGroup,
  resolveHref,
  runDashboardLifecycle,
} from './dashboard-core.js';

/**
 * Build a compact sparkline from line points.
 * @param {Array<{value:number}>} points
 * @returns {SVGElement | null}
 */
function buildSparkline(points) {
  if (!Array.isArray(points) || points.length < 2) return null;

  const width = 320;
  const height = 76;
  const topPadding = 12;
  const bottomPadding = 12;
  const availableHeight = height - topPadding - bottomPadding;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const stepX = width / (points.length - 1);

  const coordinates = values.map((point, index) => {
    const x = Math.round(index * stepX * 100) / 100;
    const normalized = (point - min) / range;
    const y = Math.round((height - bottomPadding - (normalized * availableHeight)) * 100) / 100;
    return [x, y];
  });

  const linePath = coordinates
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ');
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
  stopA.setAttribute('stop-color', '#34d399');
  stopA.setAttribute('stop-opacity', '0.35');

  const stopB = document.createElementNS(ns, 'stop');
  stopB.setAttribute('offset', '100%');
  stopB.setAttribute('stop-color', '#34d399');
  stopB.setAttribute('stop-opacity', '0');

  gradient.append(stopA, stopB);
  defs.append(gradient);

  const area = document.createElementNS(ns, 'path');
  area.setAttribute('d', areaPath);
  area.setAttribute('fill', `url(#${gradientId})`);

  const line = document.createElementNS(ns, 'path');
  line.setAttribute('d', linePath);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', '#34d399');
  line.setAttribute('stroke-width', '2.5');
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('stroke-linejoin', 'round');

  const dot = document.createElementNS(ns, 'circle');
  dot.setAttribute('cx', String(lastX));
  dot.setAttribute('cy', String(lastY));
  dot.setAttribute('r', '3.8');
  dot.setAttribute('fill', '#34d399');

  svg.append(defs, area, line, dot);
  return svg;
}

/**
 * Generate line chart SVG markup.
 * @param {object} chart
 * @returns {string}
 */
function renderLineChartMarkup(chart) {
  const width = 440;
  const height = 230;
  const padLeft = 44;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 42;

  const values = chart.points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const graphWidth = width - padLeft - padRight;
  const graphHeight = height - padTop - padBottom;
  const stepX = graphWidth / Math.max(chart.points.length - 1, 1);

  const coords = chart.points.map((point, index) => {
    const x = padLeft + (index * stepX);
    const y = padTop + (graphHeight - (((point.value - min) / range) * graphHeight));
    return {
      ...point,
      x,
      y,
    };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${(padLeft + graphWidth).toFixed(2)} ${(padTop + graphHeight).toFixed(2)} L${padLeft} ${(padTop + graphHeight).toFixed(2)} Z`;

  const circleMarkup = coords.map((point) => `
    <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3.5" fill="#34d399">
      <title>${escapeHtml(`${point.label}: ${formatMoney(point.value, chart.currency)}`)}</title>
    </circle>
  `).join('');

  const xTickIndexes = [0, Math.floor((coords.length - 1) / 2), coords.length - 1]
    .filter((index, position, arr) => arr.indexOf(index) === position);

  const xTicks = xTickIndexes.map((index) => {
    const point = coords[index];
    return `<text x="${point.x.toFixed(2)}" y="${(height - 16).toFixed(2)}" text-anchor="middle" class="live-block-chart-axis">${escapeHtml(point.label)}</text>`;
  }).join('');

  return `
    <div class="live-block-chart-svg-wrap">
      <svg class="live-block-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${chart.id}-title ${chart.id}-desc">
        <title id="${chart.id}-title">${escapeHtml(chart.title)}</title>
        <desc id="${chart.id}-desc">${escapeHtml(chart.description)}</desc>

        <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + graphHeight}" class="live-block-chart-grid-line" />
        <line x1="${padLeft}" y1="${padTop + graphHeight}" x2="${padLeft + graphWidth}" y2="${padTop + graphHeight}" class="live-block-chart-grid-line" />

        <text x="8" y="${(padTop + 8).toFixed(2)}" class="live-block-chart-axis">${escapeHtml(formatMoney(max, chart.currency))}</text>
        <text x="8" y="${(padTop + graphHeight).toFixed(2)}" class="live-block-chart-axis">${escapeHtml(formatMoney(min, chart.currency))}</text>

        <path d="${areaPath}" fill="url(#${chart.id}-area)" />
        <defs>
          <linearGradient id="${chart.id}-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#34d399" stop-opacity="0.04" />
          </linearGradient>
        </defs>

        <path d="${linePath}" class="live-block-chart-line" />
        ${circleMarkup}
        ${xTicks}
      </svg>
      <ul class="live-block-legend">
        <li>
          <span class="live-block-legend-dot" style="--live-legend-color:#34d399"></span>
          <span>Order total (${escapeHtml(chart.currency)})</span>
        </li>
      </ul>
    </div>
  `;
}

/**
 * Generate vertical bar chart SVG markup.
 * @param {object} chart
 * @returns {string}
 */
function renderBarChartMarkup(chart) {
  const width = 440;
  const height = 230;
  const padLeft = 42;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 52;

  const entries = chart.entries.slice(0, 8);
  const max = Math.max(...entries.map((entry) => entry.value));
  const graphWidth = width - padLeft - padRight;
  const graphHeight = height - padTop - padBottom;
  const barSlot = graphWidth / entries.length;
  const barWidth = Math.max(16, barSlot * 0.58);

  const bars = entries.map((entry, index) => {
    const ratio = entry.value / Math.max(max, 1);
    const h = Math.max(4, ratio * graphHeight);
    const x = padLeft + (index * barSlot) + ((barSlot - barWidth) / 2);
    const y = padTop + (graphHeight - h);
    const color = getChartColor(index);

    return `
      <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${h.toFixed(2)}" rx="5" fill="${color}">
        <title>${escapeHtml(`${entry.label}: ${entry.value}`)}</title>
      </rect>
      <text x="${(x + (barWidth / 2)).toFixed(2)}" y="${(padTop + graphHeight + 16).toFixed(2)}" text-anchor="middle" class="live-block-chart-axis">
        ${escapeHtml(entry.label.length > 10 ? `${entry.label.slice(0, 10)}...` : entry.label)}
      </text>
    `;
  }).join('');

  const legend = entries.map((entry, index) => `
    <li>
      <span class="live-block-legend-dot" style="--live-legend-color:${getChartColor(index)}"></span>
      <span>${escapeHtml(entry.label)}: ${escapeHtml(formatCount(entry.value))}</span>
    </li>
  `).join('');

  return `
    <div class="live-block-chart-svg-wrap">
      <svg class="live-block-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${chart.id}-title ${chart.id}-desc">
        <title id="${chart.id}-title">${escapeHtml(chart.title)}</title>
        <desc id="${chart.id}-desc">${escapeHtml(chart.description)}</desc>

        <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + graphHeight}" class="live-block-chart-grid-line" />
        <line x1="${padLeft}" y1="${padTop + graphHeight}" x2="${padLeft + graphWidth}" y2="${padTop + graphHeight}" class="live-block-chart-grid-line" />

        <text x="8" y="${(padTop + 8).toFixed(2)}" class="live-block-chart-axis">${escapeHtml(formatCount(max))}</text>
        <text x="8" y="${(padTop + graphHeight).toFixed(2)}" class="live-block-chart-axis">0</text>

        ${bars}
      </svg>

      <ul class="live-block-legend">
        ${legend}
      </ul>
    </div>
  `;
}

/**
 * Generate donut chart SVG markup.
 * @param {object} chart
 * @returns {string}
 */
function renderDonutChartMarkup(chart) {
  const width = 440;
  const height = 230;
  const cx = 145;
  const cy = 112;
  const radius = 62;
  const strokeWidth = 26;

  let offset = 0;
  const circumference = 2 * Math.PI * radius;

  const segments = chart.entries.map((entry, index) => {
    const value = Math.max(entry.value, 0);
    const ratio = chart.total ? value / chart.total : 0;
    const length = ratio * circumference;
    const color = getChartColor(index);
    const segment = `
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})">
        <title>${escapeHtml(`${entry.label}: ${entry.value}`)}</title>
      </circle>
    `;
    offset += length;
    return segment;
  }).join('');

  const legend = chart.entries.map((entry, index) => `
    <li>
      <span class="live-block-legend-dot" style="--live-legend-color:${getChartColor(index)}"></span>
      <span>${escapeHtml(entry.label)}: ${escapeHtml(formatCount(entry.value))}</span>
    </li>
  `).join('');

  return `
    <div class="live-block-chart-svg-wrap">
      <svg class="live-block-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${chart.id}-title ${chart.id}-desc">
        <title id="${chart.id}-title">${escapeHtml(chart.title)}</title>
        <desc id="${chart.id}-desc">${escapeHtml(chart.description)}</desc>

        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="rgb(148 163 184 / 25%)" stroke-width="${strokeWidth}" />
        ${segments}

        <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="live-block-chart-center-label">${escapeHtml(formatCount(chart.total))}</text>
        <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="live-block-chart-axis">Users</text>
      </svg>

      <ul class="live-block-legend">
        ${legend}
      </ul>
    </div>
  `;
}

/**
 * Generate stacked status bar chart SVG markup.
 * @param {object} chart
 * @returns {string}
 */
function renderStackedBarChartMarkup(chart) {
  const width = 440;
  const height = 190;
  const x = 18;
  const y = 58;
  const barWidth = 400;
  const barHeight = 34;
  const total = Math.max(chart.total, 1);

  let cursor = x;

  const segments = chart.entries.map((entry, index) => {
    const segmentWidth = Math.max(6, (entry.value / total) * barWidth);
    const color = getChartColor(index);
    const rect = `
      <rect x="${cursor.toFixed(2)}" y="${y}" width="${segmentWidth.toFixed(2)}" height="${barHeight}" rx="4" fill="${color}">
        <title>${escapeHtml(`${entry.label}: ${entry.value}`)}</title>
      </rect>
    `;
    cursor += segmentWidth;
    return rect;
  }).join('');

  const legend = chart.entries.map((entry, index) => {
    const pct = chart.total ? ((entry.value / chart.total) * 100) : 0;
    return `
      <li>
        <span class="live-block-legend-dot" style="--live-legend-color:${getChartColor(index)}"></span>
        <span>${escapeHtml(entry.label)}: ${escapeHtml(formatCount(entry.value))} (${pct.toFixed(0)}%)</span>
      </li>
    `;
  }).join('');

  return `
    <div class="live-block-chart-svg-wrap">
      <svg class="live-block-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${chart.id}-title ${chart.id}-desc">
        <title id="${chart.id}-title">${escapeHtml(chart.title)}</title>
        <desc id="${chart.id}-desc">${escapeHtml(chart.description)}</desc>

        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="6" fill="rgb(15 23 42 / 42%)" />
        ${segments}
        <text x="${x}" y="${y - 14}" class="live-block-chart-axis">0</text>
        <text x="${x + barWidth}" y="${y - 14}" text-anchor="end" class="live-block-chart-axis">${escapeHtml(formatCount(chart.total))}</text>
      </svg>

      <ul class="live-block-legend">
        ${legend}
      </ul>
    </div>
  `;
}

/**
 * Render chart markup with fallback handling.
 * @param {object} chart
 * @returns {string}
 */
function renderChartMarkup(chart) {
  if (chart.state !== 'ready') {
    return `<p class="live-block-chart-empty" role="status">${escapeHtml(chart.emptyText || FALLBACK_TEXT)}</p>`;
  }

  if (chart.type === 'line') return renderLineChartMarkup(chart);
  if (chart.type === 'bar') return renderBarChartMarkup(chart);
  if (chart.type === 'donut') return renderDonutChartMarkup(chart);
  if (chart.type === 'stacked') return renderStackedBarChartMarkup(chart);

  return `<p class="live-block-chart-empty" role="status">${escapeHtml(FALLBACK_TEXT)}</p>`;
}

/**
 * Render a metric group section.
 * @param {string} title
 * @param {Array<object>} metrics
 * @param {string} subtitle
 * @returns {string}
 */
function renderMetricSection(title, metrics, subtitle = '') {
  const cards = metrics.map((metric) => `
    <article class="live-block-metric${metric.isFallback ? ' is-fallback' : ''}" tabindex="0">
      <div class="live-block-metric-value">${escapeHtml(metric.value)}</div>
      <div class="live-block-metric-label">${escapeHtml(metric.label)}</div>
      ${metric.note ? `<div class="live-block-metric-note">${escapeHtml(metric.note)}</div>` : ''}
    </article>
  `).join('');

  return `
    <section class="live-block-section" aria-label="${escapeHtml(title)}">
      <header class="live-block-section-header">
        <h3 class="live-block-section-title">${escapeHtml(title)}</h3>
        ${subtitle ? `<p class="live-block-section-subtitle">${escapeHtml(subtitle)}</p>` : ''}
      </header>
      <div class="live-block-metrics-grid">
        ${cards}
      </div>
    </section>
  `;
}

/**
 * Render an activity list card.
 * @param {string} title
 * @param {Array<object>} rows
 * @returns {string}
 */
function renderActivityCard(title, rows) {
  const items = rows.length
    ? `<ul class="live-block-activity-list">
        ${rows.map((row) => `
          <li class="live-block-activity-item" tabindex="0">
            <div class="live-block-activity-main">
              <div class="live-block-activity-title">${escapeHtml(row.title)}</div>
              <div class="live-block-activity-subtitle">${escapeHtml(row.subtitle)}</div>
              <div class="live-block-activity-date">${escapeHtml(row.date)}</div>
            </div>
            <div class="live-block-activity-amount">${escapeHtml(row.amount)}</div>
          </li>
        `).join('')}
      </ul>`
    : `<p class="live-block-empty">${EMPTY_ACTIVITY_TEXT}</p>`;

  return `
    <section class="live-block-activity-card" aria-label="${escapeHtml(title)}">
      <h3 class="live-block-activity-card-title">${escapeHtml(title)}</h3>
      ${items}
    </section>
  `;
}

/**
 * Render source health chips.
 * @param {Record<string, any>} sources
 * @returns {string}
 */
function renderSourceHealth(sources) {
  const entries = Object.entries(sources);
  const okCount = entries.filter(([, source]) => source.status === SOURCE_STATUS.OK).length;

  return `
    <section class="live-block-sources" aria-label="Data source status">
      <div class="live-block-sources-summary">${escapeHtml(`Sources live: ${okCount}/${entries.length}`)}</div>
      <ul class="live-block-sources-list">
        ${entries.map(([name, source]) => `
          <li class="live-block-source-chip is-${escapeHtml(source.status)}">
            <span class="live-block-source-name">${escapeHtml(name)}</span>
            <span class="live-block-source-status">${escapeHtml(source.status)}</span>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

/**
 * Render guest mode.
 * @param {HTMLElement} block
 * @param {object} config
 */
function renderGuest(block, config) {
  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-guest';
  wrapper.innerHTML = `
    <header class="live-block-header">
      <h2 class="live-block-title">${escapeHtml(config.title)}</h2>
      <span class="live-block-pill">Guest</span>
    </header>
    <p class="live-block-description">Sign in to view live commerce data.</p>
    <a class="live-block-cta" href="${escapeHtml(resolveHref(config.guestCtaHref))}">${escapeHtml(config.guestCtaLabel)}</a>
  `;
  block.replaceChildren(wrapper);
}

/**
 * Render loading state.
 * @param {HTMLElement} block
 * @param {string} title
 * @param {string} message
 */
function renderLoading(block, title, message) {
  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-loading';
  wrapper.innerHTML = `
    <header class="live-block-header">
      <h2 class="live-block-title">${escapeHtml(title)}</h2>
      <span class="live-block-pill">Live</span>
    </header>
    <p class="live-block-description" role="status" aria-live="polite">${escapeHtml(message)}</p>
  `;

  block.replaceChildren(wrapper);
}

/**
 * Render authenticated dashboard state.
 * @param {HTMLElement} block
 * @param {object} config
 * @param {object} viewModel
 * @param {Function} onRefresh
 */
function renderAuthenticated(block, config, viewModel, onRefresh) {
  const financeMetrics = metricsByGroup(viewModel.metrics, 'finance');
  const operationsMetrics = metricsByGroup(viewModel.metrics, 'operations');
  const sourcingMetrics = metricsByGroup(viewModel.metrics, 'sourcing');
  const visibleCharts = config.showCharts ? viewModel.charts : [];

  const wrapper = document.createElement('section');
  wrapper.className = 'live-block-shell live-block-shell-auth';

  const hasSectionEnabled = config.showFinanceSection
    || config.showOperationsSection
    || config.showSourcingSection;

  wrapper.innerHTML = `
    <header class="live-block-header">
      <div class="live-block-header-main">
        <h2 class="live-block-title">${escapeHtml(config.title)}</h2>
        <p class="live-block-status" role="status" aria-live="polite">${escapeHtml(
    config.showLastUpdated
      ? `Last updated ${formatDateTime(viewModel.lastUpdatedAt)}`
      : 'Live commerce data loaded',
  )}</p>
      </div>
      <div class="live-block-header-actions">
        <span class="live-block-pill">Live</span>
        <button type="button" class="live-block-refresh" data-live-block-refresh>
          ${escapeHtml(config.refreshLabel)}
        </button>
      </div>
    </header>

    ${hasSectionEnabled
    ? ''
    : '<p class="live-block-empty">No dashboard sections are currently enabled.</p>'}

    ${config.showFinanceSection
    ? renderMetricSection('Finance', financeMetrics, 'Credit and cash exposure')
    : ''}

    ${config.showOperationsSection
    ? renderMetricSection(
      'Operations',
      operationsMetrics,
      `${viewModel.windows.orderWindowDays}-day windowed metrics within fetched records`,
    )
    : ''}

    ${config.showSparkline && viewModel.sparklinePoints.length >= 2
    ? '<section class="live-block-sparkline" aria-hidden="true"></section>'
    : ''}

    ${config.showSourcingSection
    ? renderMetricSection('Sourcing', sourcingMetrics, 'Buyer intent and pipeline surfaces')
    : ''}

    ${(config.showOperationsSection || config.showFinanceSection || config.showSourcingSection)
    ? `<section class="live-block-activity-grid" aria-label="Recent activity">
        ${config.showOperationsSection ? renderActivityCard('Recent Purchase Orders', viewModel.activity.purchaseOrders) : ''}
        ${config.showFinanceSection ? renderActivityCard('Recent Credit Transactions', viewModel.activity.creditHistory) : ''}
        ${config.showSourcingSection ? renderActivityCard('Recent Quotes', viewModel.activity.quotes) : ''}
      </section>`
    : ''}

    ${visibleCharts.length > 0
    ? `<section class="live-block-charts" aria-label="Dashboard charts">
        <header class="live-block-section-header">
          <h3 class="live-block-section-title">Detailed Graphs</h3>
          <p class="live-block-section-subtitle">Labeled trends and distributions</p>
        </header>
        <div class="live-block-chart-grid">
          ${visibleCharts.map((chart) => `
            <article class="live-block-chart-card" aria-label="${escapeHtml(chart.title)}">
              <header class="live-block-chart-header">
                <h4 class="live-block-chart-title">${escapeHtml(chart.title)}</h4>
                <p class="live-block-chart-description">${escapeHtml(chart.description)}</p>
              </header>
              ${renderChartMarkup(chart)}
            </article>
          `).join('')}
        </div>
      </section>`
    : ''}

    ${renderSourceHealth(viewModel.sources)}
  `;

  const sparklineContainer = wrapper.querySelector('.live-block-sparkline');
  if (sparklineContainer) {
    const sparkline = buildSparkline(viewModel.sparklinePoints);
    if (sparkline) {
      sparklineContainer.append(sparkline);
    } else {
      sparklineContainer.remove();
    }
  }

  const refreshButton = wrapper.querySelector('[data-live-block-refresh]');
  refreshButton?.addEventListener('click', () => {
    onRefresh();
  });

  block.replaceChildren(wrapper);
}

/**
 * Decorate block.
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const config = getCommonConfig(block);

  await runDashboardLifecycle({
    block,
    config,
    renderGuest,
    renderLoading,
    renderAuthenticated,
  });
}

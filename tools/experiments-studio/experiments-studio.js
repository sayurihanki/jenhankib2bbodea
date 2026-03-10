/* eslint-disable import/extensions */
import {
  DEFAULT_EXPERIMENTATION_CONFIG,
  STORAGE_KEYS,
  collectSelectableTargets,
  createExportBundle,
  createPlainHtmlUrl,
  normalizeSourceLink,
  slugify,
} from '../../plugins/experimentation/lib/experiments.mjs';
import {
  computeExperimentReport,
  createBlankSeed,
} from '../../plugins/experimentation/lib/reporting.mjs';
import {
  loadRegistry,
  localReportingAdapter,
} from '../../plugins/experimentation/reporting/local-adapter.js';

const app = document.getElementById('experiments-studio-app');

const state = {
  registry: [],
  drafts: loadDrafts(),
  portfolio: null,
  selectedId: null,
  activeTab: 'builder',
  sourceSelections: {},
  sourceStatus: {},
};

function loadDrafts() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.studioDrafts) || '{}');
  } catch (error) {
    return {};
  }
}

function saveDrafts() {
  window.localStorage.setItem(STORAGE_KEYS.studioDrafts, JSON.stringify(state.drafts));
}

function formatPercent(value = 0) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMoney(value = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatWhole(value = 0) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function mergeExperiments() {
  const merged = [...state.registry];

  Object.values(state.drafts).forEach((draft) => {
    const index = merged.findIndex((entry) => entry.id === draft.id);
    if (index >= 0) {
      merged[index] = draft;
    } else {
      merged.unshift(draft);
    }
  });

  return merged;
}

function getSelectedExperiment() {
  const experiments = mergeExperiments();
  return experiments.find((experiment) => experiment.id === state.selectedId)
    || experiments[0]
    || null;
}

function isDraft(experiment) {
  return Boolean(state.drafts[experiment.id]);
}

function ensureDraft(experiment) {
  if (!state.drafts[experiment.id]) {
    state.drafts[experiment.id] = structuredClone(experiment);
    saveDrafts();
  }
  return state.drafts[experiment.id];
}

function createExperimentTemplate() {
  const id = `exp-${Date.now().toString(36)}`;
  return {
    id,
    name: 'Untitled experiment',
    status: 'draft',
    slotId: 'page-root',
    surface: 'page',
    primaryMetric: 'purchase',
    secondaryMetrics: ['add_to_cart', 'revenue'],
    guardrails: ['scroll_50', 'engaged_session'],
    mutualExclusionGroup: '',
    audience: {
      paths: ['/'],
      devices: ['desktop', 'tablet', 'mobile'],
    },
    schedule: {
      start: new Date().toISOString().slice(0, 10),
      end: '',
    },
    allocation: [
      { variantKey: 'control', weight: 50 },
      { variantKey: 'variant-b', weight: 50 },
    ],
    variants: [
      {
        key: 'control',
        label: 'Control',
        allocation: 50,
        sourceLink: '',
        resolvedPath: '',
        sourceEnv: 'live',
        selectionType: 'page',
        selectionKey: 'page-root',
        previewImage: '',
      },
      {
        key: 'variant-b',
        label: 'Variant B',
        allocation: 50,
        sourceLink: '',
        resolvedPath: '',
        sourceEnv: 'preview',
        selectionType: 'page',
        selectionKey: 'page-root',
        previewImage: '',
      },
    ],
  };
}

function buildReport(experiment) {
  const seeded = state.portfolio?.reportMap?.[experiment.id];
  if (seeded) {
    return seeded;
  }
  return computeExperimentReport(experiment, [], createBlankSeed(experiment));
}

async function resolveVariantSource(experimentId, variantIndex) {
  const experiment = ensureDraft(getSelectedExperiment());
  const variant = experiment.variants[variantIndex];
  const sourceKey = `${experimentId}:${variantIndex}`;

  if (!variant?.sourceLink) {
    state.sourceStatus[sourceKey] = 'Paste a source link first.';
    render();
    return;
  }

  state.sourceStatus[sourceKey] = 'Resolving link…';
  render();

  try {
    const normalized = normalizeSourceLink(variant.sourceLink, window.location.origin);
    const response = await fetch(createPlainHtmlUrl(normalized));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${variant.sourceLink}`);
    }
    const html = await response.text();
    const main = document.createElement('main');
    main.innerHTML = html;
    const selections = collectSelectableTargets(main, normalized);
    state.sourceSelections[sourceKey] = selections;
    variant.resolvedPath = normalized.resolvedPath;
    variant.sourceEnv = normalized.sourceEnv;
    if (!selections.some((entry) => entry.key === variant.selectionKey)) {
      variant.selectionType = selections[0]?.selectionType || 'page';
      variant.selectionKey = selections[0]?.key || 'page-root';
    }
    state.sourceStatus[sourceKey] = `${selections.length} target${selections.length === 1 ? '' : 's'} found.`;
    saveDrafts();
    render();
  } catch (error) {
    state.sourceStatus[sourceKey] = error.message;
    render();
  }
}

function updateExperiment(updater) {
  const current = getSelectedExperiment();
  if (!current) return;
  const draft = ensureDraft(current);
  updater(draft);
  saveDrafts();
  render();
}

function createSlotSnippet(experiment) {
  return [
    '| experiment-slot |',
    `| slotId | ${experiment.slotId || 'page-root'} |`,
    `| surfaceHint | ${experiment.surface || 'page'} |`,
    `| notes | Generated from Experiments Studio for ${experiment.name} |`,
  ].join('\n');
}

function downloadFile(name, contents) {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderSummary(experiments) {
  const summary = {
    active: state.portfolio?.summary?.active || 0,
    draft: experiments.filter((entry) => entry.status === 'draft').length,
    paused: experiments.filter((entry) => entry.status === 'paused').length,
    exposures: state.portfolio?.summary?.exposures || 0,
    revenue: state.portfolio?.summary?.revenue || 0,
    guardrails: state.portfolio?.summary?.guardrails || 0,
  };

  return `
    <section class="studio-hero">
      <div class="studio-hero__eyebrow">DA.Live Experimentation Command Center</div>
      <h1 class="studio-hero__title">Paste links. Resolve blocks. Read the signal.</h1>
      <p class="studio-hero__lede">
        Link-backed experiments for DA.Live pages, sections, blocks, and fragments, with a portfolio dashboard and per-variant reporting stitched into the same workspace.
      </p>
      <div class="studio-metrics">
        <article class="studio-card">
          <div class="studio-card__eyebrow">Active</div>
          <div class="studio-card__value">${formatWhole(summary.active)}</div>
        </article>
        <article class="studio-card">
          <div class="studio-card__eyebrow">Drafts</div>
          <div class="studio-card__value">${formatWhole(summary.draft)}</div>
        </article>
        <article class="studio-card">
          <div class="studio-card__eyebrow">Exposures</div>
          <div class="studio-card__value">${formatWhole(summary.exposures)}</div>
        </article>
        <article class="studio-card">
          <div class="studio-card__eyebrow">Revenue</div>
          <div class="studio-card__value">${formatMoney(summary.revenue)}</div>
        </article>
        <article class="studio-card">
          <div class="studio-card__eyebrow">Guardrails</div>
          <div class="studio-card__value">${formatWhole(summary.guardrails)}</div>
        </article>
      </div>
    </section>
  `;
}

function renderSidebar(experiments) {
  const cards = experiments.map((experiment) => {
    const report = buildReport(experiment);
    const warning = report.warnings[0];

    return `
      <article class="studio-experiment-card ${state.selectedId === experiment.id ? 'is-selected' : ''}" data-action="select-experiment" data-experiment-id="${experiment.id}">
        <h3 class="studio-experiment-card__title">${experiment.name}</h3>
        <div class="studio-experiment-card__meta">${experiment.surface} · ${experiment.slotId || 'page-root'} · ${experiment.primaryMetric}</div>
        <div class="studio-badges">
          <span class="studio-badge">${experiment.status}</span>
          ${isDraft(experiment) ? '<span class="studio-badge is-good">Local draft</span>' : ''}
          ${warning ? `<span class="studio-badge ${warning.type === 'srm' ? 'is-warn' : 'is-good'}">${warning.label}</span>` : ''}
        </div>
      </article>
    `;
  }).join('');

  return `
    <section class="studio-panel studio-sidebar">
      <div class="studio-panel__header">
        <div>
          <div class="studio-card__eyebrow">Portfolio</div>
          <h2>Experiments</h2>
        </div>
        <button class="studio-button" data-action="new-experiment" type="button">New</button>
      </div>
      <div class="studio-panel__body">
        <div class="studio-list">${cards}</div>
      </div>
    </section>
  `;
}

function renderVariantCard(experiment, variant, index) {
  const sourceKey = `${experiment.id}:${index}`;
  const selections = state.sourceSelections[sourceKey] || [];
  const selectionOptions = (
    selections.length
      ? selections
      : [{ key: variant.selectionKey || 'page-root', label: variant.selectionKey || 'page-root' }]
  ).map((selection) => (
    `<option value="${selection.key}" ${variant.selectionKey === selection.key ? 'selected' : ''}>${selection.label}</option>`
  )).join('');

  return `
    <article class="studio-variant">
      <div class="studio-variant__header">
        <div>
          <strong>${variant.label || `Variant ${index + 1}`}</strong>
          <div class="studio-panel__subtle">${variant.key}</div>
        </div>
        <button class="studio-button--ghost" data-action="remove-variant" data-variant-index="${index}" type="button">Remove</button>
      </div>
      <div class="studio-grid-fields">
        <div class="studio-field">
          <label>Label</label>
          <input class="studio-input" data-variant-index="${index}" data-variant-field="label" value="${variant.label || ''}" />
        </div>
        <div class="studio-field">
          <label>Key</label>
          <input class="studio-input" data-variant-index="${index}" data-variant-field="key" value="${variant.key || ''}" />
        </div>
        <div class="studio-field">
          <label>Allocation %</label>
          <input class="studio-input" type="number" min="1" max="100" data-variant-index="${index}" data-variant-field="allocation" value="${variant.allocation || 50}" />
        </div>
      </div>
      <div class="studio-field">
        <label>Source link</label>
        <input class="studio-input" data-variant-index="${index}" data-variant-field="sourceLink" value="${variant.sourceLink || ''}" placeholder="Paste a DA author, preview, or live URL" />
        <div class="studio-field__hint">${variant.resolvedPath ? `${variant.sourceEnv} → ${variant.resolvedPath}` : 'No source resolved yet.'}</div>
      </div>
      <div class="studio-source-options">
        <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
          <button class="studio-button" data-action="resolve-variant" data-variant-index="${index}" type="button">Resolve link</button>
          <span class="studio-help">${state.sourceStatus[sourceKey] || 'Pick a source and the Studio will inspect its blocks.'}</span>
        </div>
        <div class="studio-grid-fields">
          <div class="studio-field">
            <label>Selection type</label>
            <select class="studio-select" data-variant-index="${index}" data-variant-field="selectionType">
              ${['page', 'section', 'block', 'fragment'].map((type) => `<option value="${type}" ${variant.selectionType === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
          </div>
          <div class="studio-field">
            <label>Selection target</label>
            <select class="studio-select" data-variant-index="${index}" data-variant-field="selectionKey">
              ${selectionOptions}
            </select>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderBuilder(experiment) {
  const exportJson = createExportBundle([experiment]);
  return `
    <section class="studio-workbench">
      <article class="studio-panel">
        <div class="studio-panel__header">
          <div>
            <div class="studio-card__eyebrow">Builder</div>
            <h2>${experiment.name}</h2>
          </div>
          <div style="display:flex; gap:0.55rem; flex-wrap:wrap;">
            <button class="studio-button--ghost" data-action="save-draft" type="button">Save draft</button>
            <button class="studio-button--ghost" data-action="duplicate-experiment" type="button">Duplicate</button>
            <button class="studio-button--ghost" data-action="pause-experiment" type="button">Pause</button>
            <button class="studio-button--ghost" data-action="archive-experiment" type="button">Archive</button>
          </div>
        </div>
        <div class="studio-panel__body studio-fields">
          <div class="studio-grid-fields">
            <div class="studio-field">
              <label>Name</label>
              <input class="studio-input" data-root-field="name" value="${experiment.name}" />
            </div>
            <div class="studio-field">
              <label>Status</label>
              <select class="studio-select" data-root-field="status">
                ${['draft', 'active', 'paused', 'archived'].map((status) => `<option value="${status}" ${experiment.status === status ? 'selected' : ''}>${status}</option>`).join('')}
              </select>
            </div>
            <div class="studio-field">
              <label>Surface</label>
              <select class="studio-select" data-root-field="surface">
                ${['page', 'section', 'block', 'fragment'].map((surface) => `<option value="${surface}" ${experiment.surface === surface ? 'selected' : ''}>${surface}</option>`).join('')}
              </select>
            </div>
            <div class="studio-field">
              <label>Slot ID</label>
              <input class="studio-input" data-root-field="slotId" value="${experiment.slotId || 'page-root'}" />
            </div>
          </div>
          <div class="studio-grid-fields">
            <div class="studio-field">
              <label>Primary metric</label>
              <select class="studio-select" data-root-field="primaryMetric">
                ${['purchase', 'cta_click', 'add_to_cart', 'checkout_start', 'quote_request'].map((metric) => `<option value="${metric}" ${experiment.primaryMetric === metric ? 'selected' : ''}>${metric}</option>`).join('')}
              </select>
            </div>
            <div class="studio-field">
              <label>Audience paths</label>
              <input class="studio-input" data-audience-field="paths" value="${(experiment.audience?.paths || []).join(', ')}" />
              <div class="studio-field__hint">Comma-separated path or wildcard rules</div>
            </div>
            <div class="studio-field">
              <label>Devices</label>
              <input class="studio-input" data-audience-field="devices" value="${(experiment.audience?.devices || []).join(', ')}" />
            </div>
            <div class="studio-field">
              <label>Mutual exclusion</label>
              <input class="studio-input" data-root-field="mutualExclusionGroup" value="${experiment.mutualExclusionGroup || ''}" />
            </div>
          </div>
          <div class="studio-field">
            <label>Variants</label>
            <div class="studio-variants">
              ${experiment.variants.map((variant, index) => renderVariantCard(experiment, variant, index)).join('')}
            </div>
            <button class="studio-button--ghost" data-action="add-variant" type="button">Add variant</button>
          </div>
        </div>
      </article>
      <article class="studio-panel">
        <div class="studio-panel__header">
          <div>
            <div class="studio-card__eyebrow">Export + Slot Snippet</div>
            <h2>DA handoff</h2>
          </div>
          <div style="display:flex; gap:0.55rem; flex-wrap:wrap;">
            <button class="studio-button" data-action="export-selected" type="button">Export JSON</button>
            <button class="studio-button--ghost" data-action="export-all" type="button">Export all</button>
          </div>
        </div>
        <div class="studio-panel__body studio-fields">
          <div class="studio-field">
            <label>Experiment bundle</label>
            <textarea class="studio-textarea studio-code" readonly>${exportJson}</textarea>
          </div>
          <div class="studio-field">
            <label>Experiment slot snippet</label>
            <textarea class="studio-textarea studio-code" readonly>${createSlotSnippet(experiment)}</textarea>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderReport(experiment) {
  const report = buildReport(experiment);
  const maxExposure = Math.max(...report.variants.map((variant) => variant.exposures || 0), 1);
  return `
    <section class="studio-panel">
      <div class="studio-panel__header">
        <div>
          <div class="studio-card__eyebrow">Metrics dashboard</div>
          <h2>${report.name}</h2>
        </div>
        <div class="studio-panel__subtle">Primary metric: ${report.primaryMetric}</div>
      </div>
      <div class="studio-panel__body studio-fields">
        <div class="studio-report-grid">
          <article class="studio-card">
            <div class="studio-card__eyebrow">Exposures</div>
            <div class="studio-card__value">${formatWhole(report.totalExposures)}</div>
          </article>
          <article class="studio-card">
            <div class="studio-card__eyebrow">Revenue</div>
            <div class="studio-card__value">${formatMoney(report.totalRevenue)}</div>
          </article>
          <article class="studio-card">
            <div class="studio-card__eyebrow">Warnings</div>
            <div class="studio-card__value">${formatWhole(report.warnings.length)}</div>
          </article>
        </div>
        <div class="studio-warning-list">
          ${report.warnings.map((warning) => `<article class="studio-variant-metric"><strong>${warning.label}</strong><div class="studio-panel__subtle">${warning.description}</div></article>`).join('') || '<div class="studio-empty">No major guardrail warnings right now.</div>'}
        </div>
        <div class="studio-variant-grid">
          ${report.variants.map((variant) => `
            <article class="studio-variant-metric">
              <strong>${variant.label}</strong>
              <div class="studio-panel__subtle">${variant.sourceLink || 'Current page'}</div>
              <div class="studio-badges">
                <span class="studio-badge">Exposures ${formatWhole(variant.exposures)}</span>
                <span class="studio-badge is-good">CVR ${formatPercent(variant.conversionRate)}</span>
                <span class="studio-badge">PTBB ${formatPercent(variant.probabilityToBeBest || 0)}</span>
              </div>
              <div class="studio-chart">
                <div class="studio-chart__row">
                  <div class="studio-panel__subtle">Exposure share</div>
                  <div class="studio-chart__bar" style="--bar-width:${(variant.exposures / maxExposure) * 100}%"><span></span></div>
                </div>
                <div class="studio-panel__subtle">Revenue ${formatMoney(variant.revenue)} · RPV ${formatMoney(variant.rpv)} · AOV ${formatMoney(variant.aov)}</div>
                <div class="studio-panel__subtle">95% credible interval ${formatPercent(variant.credibleInterval[0])} – ${formatPercent(variant.credibleInterval[1])}</div>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderQa(experiment) {
  const report = buildReport(experiment);
  const recentEvents = localReportingAdapter.getEvents()
    .filter((event) => event.experimentId === experiment.id)
    .slice(-8)
    .reverse();

  return `
    <section class="studio-panel">
      <div class="studio-panel__header">
        <div>
          <div class="studio-card__eyebrow">QA + Debug</div>
          <h2>Override and verify</h2>
        </div>
      </div>
      <div class="studio-panel__body studio-fields">
        <div class="studio-field">
          <label>Override URL</label>
          <textarea class="studio-textarea studio-code" readonly>${window.location.origin}/?experiment=${experiment.id}&variant=${experiment.variants[1]?.key || experiment.variants[0]?.key}&exp_debug=1</textarea>
        </div>
        <div class="studio-field">
          <label>Recent tracked events</label>
          <div class="studio-event-list">
            ${recentEvents.map((event) => `
              <article class="studio-variant-metric">
                <strong>${event.metricKey}</strong>
                <div class="studio-panel__subtle">${event.variantKey} · ${event.eventType} · ${event.timestamp}</div>
              </article>
            `).join('') || '<div class="studio-empty">No local event activity captured for this experiment yet.</div>'}
          </div>
        </div>
        <div class="studio-field">
          <label>Report snapshot</label>
          <textarea class="studio-textarea studio-code" readonly>${JSON.stringify(report, null, 2)}</textarea>
        </div>
      </div>
    </section>
  `;
}

function renderMain(experiment) {
  return `
    <section class="studio-panel studio-main">
      <div class="studio-panel__header">
        <div>
          <div class="studio-card__eyebrow">${isDraft(experiment) ? 'Local draft' : 'Published registry'}</div>
          <h2>${experiment.name}</h2>
        </div>
        <div class="studio-panel__subtle">${experiment.id}</div>
      </div>
      <div class="studio-tabs">
        ${['builder', 'report', 'qa'].map((tab) => `<button class="studio-tab ${state.activeTab === tab ? 'is-active' : ''}" data-action="switch-tab" data-tab="${tab}" type="button">${tab}</button>`).join('')}
      </div>
      ${state.activeTab === 'builder' ? renderBuilder(experiment) : ''}
      ${state.activeTab === 'report' ? renderReport(experiment) : ''}
      ${state.activeTab === 'qa' ? renderQa(experiment) : ''}
    </section>
  `;
}

function render() {
  const experiments = mergeExperiments();
  const selected = getSelectedExperiment();

  if (!selected) {
    app.innerHTML = '<div class="studio-empty">No experiments available.</div>';
    return;
  }

  app.innerHTML = `
    <div class="studio-shell">
      ${renderSummary(experiments)}
      <div class="studio-grid">
        ${renderSidebar(experiments)}
        ${renderMain(selected)}
      </div>
    </div>
  `;
}

function handleRootField(target) {
  updateExperiment((experiment) => {
    experiment[target.dataset.rootField] = target.value;
    if (target.dataset.rootField === 'name' && (!experiment.id || experiment.id.startsWith('exp-'))) {
      experiment.id = slugify(target.value) || experiment.id;
    }
  });
}

function handleAudienceField(target) {
  updateExperiment((experiment) => {
    experiment.audience = experiment.audience || {};
    experiment.audience[target.dataset.audienceField] = target.value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  });
}

function handleVariantField(target) {
  const variantIndex = Number(target.dataset.variantIndex);
  updateExperiment((experiment) => {
    const variant = experiment.variants[variantIndex];
    if (!variant) return;
    const field = target.dataset.variantField;
    variant[field] = field === 'allocation' ? Number(target.value || 0) : target.value;
    if (field === 'key' && !variant.label) {
      variant.label = target.value;
    }
    experiment.allocation = experiment.variants.map((entry) => ({
      variantKey: entry.key,
      weight: Number(entry.allocation || 0),
    }));
  });
}

function handleAction(event) {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) {
    return;
  }

  const current = getSelectedExperiment();

  switch (action) {
    case 'new-experiment': {
      const experiment = createExperimentTemplate();
      state.drafts[experiment.id] = experiment;
      state.selectedId = experiment.id;
      saveDrafts();
      render();
      break;
    }
    case 'select-experiment':
      state.selectedId = event.target.closest('[data-experiment-id]').dataset.experimentId;
      render();
      break;
    case 'switch-tab':
      state.activeTab = event.target.dataset.tab;
      render();
      break;
    case 'save-draft':
      ensureDraft(current);
      saveDrafts();
      render();
      break;
    case 'duplicate-experiment': {
      const draft = structuredClone(ensureDraft(current));
      draft.id = `${draft.id}-copy-${Date.now().toString(36)}`;
      draft.name = `${draft.name} copy`;
      state.drafts[draft.id] = draft;
      state.selectedId = draft.id;
      saveDrafts();
      render();
      break;
    }
    case 'pause-experiment':
      updateExperiment((experiment) => { experiment.status = 'paused'; });
      break;
    case 'archive-experiment':
      updateExperiment((experiment) => { experiment.status = 'archived'; });
      break;
    case 'add-variant':
      updateExperiment((experiment) => {
        const nextIndex = experiment.variants.length + 1;
        experiment.variants.push({
          key: `variant-${String.fromCharCode(96 + nextIndex)}`,
          label: `Variant ${nextIndex}`,
          allocation: 0,
          sourceLink: '',
          resolvedPath: '',
          sourceEnv: 'preview',
          selectionType: 'page',
          selectionKey: 'page-root',
          previewImage: '',
        });
        experiment.allocation = experiment.variants.map((entry) => ({
          variantKey: entry.key,
          weight: Number(entry.allocation || 0),
        }));
      });
      break;
    case 'remove-variant': {
      const variantIndex = Number(event.target.dataset.variantIndex);
      updateExperiment((experiment) => {
        experiment.variants.splice(variantIndex, 1);
        experiment.allocation = experiment.variants.map((entry) => ({
          variantKey: entry.key,
          weight: Number(entry.allocation || 0),
        }));
      });
      break;
    }
    case 'resolve-variant':
      resolveVariantSource(current.id, Number(event.target.dataset.variantIndex));
      break;
    case 'export-selected':
      downloadFile(`${current.id}.json`, createExportBundle([ensureDraft(current)]));
      break;
    case 'export-all':
      downloadFile('experiments-bundle.json', createExportBundle(mergeExperiments()));
      break;
    default:
      break;
  }
}

app.addEventListener('click', handleAction);

app.addEventListener('input', (event) => {
  const { target } = event;
  if (target.dataset.rootField) {
    handleRootField(target);
  } else if (target.dataset.audienceField) {
    handleAudienceField(target);
  } else if (target.dataset.variantField) {
    handleVariantField(target);
  }
});

app.addEventListener('change', (event) => {
  const { target } = event;
  if (target.dataset.rootField) {
    handleRootField(target);
  } else if (target.dataset.audienceField) {
    handleAudienceField(target);
  } else if (target.dataset.variantField) {
    handleVariantField(target);
  }
});

async function bootstrap() {
  const [registry, portfolio] = await Promise.all([
    loadRegistry(DEFAULT_EXPERIMENTATION_CONFIG),
    localReportingAdapter.getPortfolio(DEFAULT_EXPERIMENTATION_CONFIG),
  ]);

  state.registry = registry;
  state.portfolio = portfolio;
  state.selectedId = state.selectedId || mergeExperiments()[0]?.id;
  render();
}

bootstrap();

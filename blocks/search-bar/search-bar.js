import { events } from '@dropins/tools/event-bus.js';
import { getProductLink, rootLink, fetchPlaceholders } from '../../scripts/commerce.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
import {
  deriveQuickChips,
  hasFilter,
  serializeFiltersToParam,
  stripSystemFilters,
  toggleFilter,
} from '../../scripts/search/chips.js';
import { withSearchContext } from '../../scripts/search/context.js';
import {
  recordSearchProductClick,
  recordSearchQuery,
  recordSuggestionClick,
  resetSearchProfile,
} from '../../scripts/search/profile.js';
import {
  isPersonalizationTreatment,
  loadSearchSettings,
  resetSearchSettings,
  setPersonalizationEnabled,
  withP13nParam,
} from '../../scripts/search/settings.js';
import { getTopSuggestions } from '../../scripts/search/suggestions.js';
import { emitSearchTelemetry } from '../../scripts/search/telemetry.js';

const SEARCH_SCOPE_PREFIX = 'search-bar-block';
const LIVE_SEARCH_REQUEST_PAGE_SIZE = 20;
const DEFAULT_MIN_QUERY_LENGTH = 2;
const MIN_MIN_QUERY_LENGTH = 1;
const MAX_MIN_QUERY_LENGTH = 5;
const DEFAULT_DEBOUNCE_MS = 120;
const MIN_DEBOUNCE_MS = 0;
const MAX_DEBOUNCE_MS = 1000;
const DEFAULT_OPEN_DELAY_MS = 0;
const MIN_OPEN_DELAY_MS = 0;
const MAX_OPEN_DELAY_MS = 1000;
const DEFAULT_RESULT_COUNT = 8;
const MIN_RESULT_COUNT = 2;
const MAX_RESULT_COUNT = 20;
const DEFAULT_PANEL_MAX_HEIGHT_PX = 576;
const MIN_PANEL_MAX_HEIGHT_PX = 200;
const MAX_PANEL_MAX_HEIGHT_PX = 1200;
const DEFAULT_VIEW_ALL_MODE = 'auto';
const DEFAULT_PLACEHOLDER = 'Search products...';
const LIVE_SEARCH_OPEN_EVENT = 'bodea:live-search-open';
let searchBarInstanceCounter = 0;

function getSafeAemAlias(product) {
  const rawAlias = product?.urlKey || product?.sku || 'product-image';
  return encodeURIComponent(rawAlias);
}

function getUniqueId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  searchBarInstanceCounter += 1;
  return `${prefix}-${searchBarInstanceCounter}`;
}

function getConfigValue(blockValue, sectionData, keys, fallback) {
  if (typeof blockValue === 'string' && blockValue.trim()) return blockValue;
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof sectionData?.[key] === 'string' && sectionData[key].trim()) return sectionData[key];
  }
  return fallback;
}

function sanitizeInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeAlignment(value, fallback = 'center') {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (normalized === 'full') return 'wide';
  return ['left', 'center', 'right', 'wide'].includes(normalized) ? normalized : fallback;
}

function normalizeViewAllMode(value, fallback = DEFAULT_VIEW_ALL_MODE) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized) return fallback;
  if (['auto', 'always', 'never'].includes(normalized)) return normalized;
  // eslint-disable-next-line no-console
  console.warn(`search-bar: invalid searchbar-viewall "${value}". Using "${fallback}".`);
  return fallback;
}

function normalizePanelMaxHeight(value, fallback = DEFAULT_PANEL_MAX_HEIGHT_PX) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized || normalized === 'default') return fallback;
  if (normalized === 'compact') return 420;
  if (normalized === 'tall') return 720;
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed)) {
    // eslint-disable-next-line no-console
    console.warn(`search-bar: invalid searchbar-maxheight "${value}". Using "${fallback}".`);
    return fallback;
  }
  return Math.min(MAX_PANEL_MAX_HEIGHT_PX, Math.max(MIN_PANEL_MAX_HEIGHT_PX, parsed));
}

function normalizeOnOff(value, fallback = true) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized === 'on' || normalized === 'true') return true;
  if (normalized === 'off' || normalized === 'false') return false;
  return fallback;
}

function normalizeShowHide(value, fallback = true) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized === 'show') return true;
  if (normalized === 'hide') return false;
  return fallback;
}

function normalizeHref(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch (e) {
    return value;
  }
}

function parseBlockConfig(block) {
  const rows = [...block.children];
  const sectionData = block.closest('.section')?.dataset || {};
  const placeholder = rows[0]?.textContent.trim() || DEFAULT_PLACEHOLDER;
  const position = normalizeAlignment(
    getConfigValue(
      block.dataset.searchbarAlign,
      sectionData,
      ['searchbarAlign', 'dataSearchbarAlign'],
      'center',
    ),
    'center',
  );
  const resultCount = sanitizeInteger(
    getConfigValue(
      block.dataset.searchbarResults,
      sectionData,
      [
        'searchbarResults',
        'dataSearchbarResults',
        'searchbarResultcount',
        'dataSearchbarResultcount',
      ],
      `${DEFAULT_RESULT_COUNT}`,
    ),
    DEFAULT_RESULT_COUNT,
    MIN_RESULT_COUNT,
    MAX_RESULT_COUNT,
  );
  const minQueryLength = sanitizeInteger(
    getConfigValue(
      block.dataset.searchbarMinquery,
      sectionData,
      ['searchbarMinquery', 'dataSearchbarMinquery'],
      `${DEFAULT_MIN_QUERY_LENGTH}`,
    ),
    DEFAULT_MIN_QUERY_LENGTH,
    MIN_MIN_QUERY_LENGTH,
    MAX_MIN_QUERY_LENGTH,
  );
  const debounceMs = sanitizeInteger(
    getConfigValue(
      block.dataset.searchbarDebounce,
      sectionData,
      ['searchbarDebounce', 'dataSearchbarDebounce'],
      `${DEFAULT_DEBOUNCE_MS}`,
    ),
    DEFAULT_DEBOUNCE_MS,
    MIN_DEBOUNCE_MS,
    MAX_DEBOUNCE_MS,
  );
  const openDelayMs = sanitizeInteger(
    getConfigValue(
      block.dataset.searchbarOpendelay,
      sectionData,
      ['searchbarOpendelay', 'dataSearchbarOpendelay'],
      `${DEFAULT_OPEN_DELAY_MS}`,
    ),
    DEFAULT_OPEN_DELAY_MS,
    MIN_OPEN_DELAY_MS,
    MAX_OPEN_DELAY_MS,
  );
  const panelMaxHeightPx = normalizePanelMaxHeight(
    getConfigValue(
      block.dataset.searchbarMaxheight,
      sectionData,
      ['searchbarMaxheight', 'dataSearchbarMaxheight'],
      `${DEFAULT_PANEL_MAX_HEIGHT_PX}`,
    ),
    DEFAULT_PANEL_MAX_HEIGHT_PX,
  );
  const viewAllMode = normalizeViewAllMode(
    getConfigValue(
      block.dataset.searchbarViewall,
      sectionData,
      ['searchbarViewall', 'dataSearchbarViewall'],
      DEFAULT_VIEW_ALL_MODE,
    ),
    DEFAULT_VIEW_ALL_MODE,
  );
  const personalizationEnabled = normalizeOnOff(
    getConfigValue(
      block.dataset.searchbarPersonalization,
      sectionData,
      ['searchbarPersonalization', 'dataSearchbarPersonalization'],
      'on',
    ),
    true,
  );
  const liveChipsEnabled = normalizeOnOff(
    getConfigValue(
      block.dataset.searchbarLivechips,
      sectionData,
      ['searchbarLivechips', 'dataSearchbarLivechips'],
      'on',
    ),
    true,
  );
  const suggestionsEnabled = normalizeOnOff(
    getConfigValue(
      block.dataset.searchbarSuggestions,
      sectionData,
      ['searchbarSuggestions', 'dataSearchbarSuggestions'],
      'on',
    ),
    true,
  );
  const personalizationToggleVisible = normalizeShowHide(
    getConfigValue(
      block.dataset.searchbarPersonalizationToggle,
      sectionData,
      ['searchbarPersonalizationToggle', 'dataSearchbarPersonalizationToggle'],
      'show',
    ),
    true,
  );

  return {
    placeholder,
    position,
    resultCount,
    minQueryLength,
    debounceMs,
    openDelayMs,
    panelMaxHeightPx,
    viewAllMode,
    personalizationEnabled,
    liveChipsEnabled,
    suggestionsEnabled,
    personalizationToggleVisible,
  };
}

function applyInputA11y(input, resultsId, expanded) {
  if (!input) return;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-controls', resultsId);
  input.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');
}

/**
 * Decorates the search bar block.
 * @param {Element} block The search bar block element.
 */
export default async function decorate(block) {
  const config = parseBlockConfig(block);
  const eventsController = new AbortController();
  const { signal } = eventsController;
  const instanceId = getUniqueId('searchbar');
  const resultsId = getUniqueId('search-results');
  const searchScope = `${SEARCH_SCOPE_PREFIX}-${instanceId}`;
  let searchSettings = loadSearchSettings();

  block.dataset.searchbarAlign = config.position;
  block.dataset.searchbarResults = `${config.resultCount}`;
  block.dataset.searchbarMinquery = `${config.minQueryLength}`;
  block.dataset.searchbarDebounce = `${config.debounceMs}`;
  block.dataset.searchbarOpendelay = `${config.openDelayMs}`;
  block.dataset.searchbarMaxheight = `${config.panelMaxHeightPx}`;
  block.dataset.searchbarViewall = config.viewAllMode;
  block.dataset.searchbarPersonalization = config.personalizationEnabled ? 'on' : 'off';
  block.dataset.searchbarLivechips = config.liveChipsEnabled ? 'on' : 'off';
  block.dataset.searchbarSuggestions = config.suggestionsEnabled ? 'on' : 'off';
  block.dataset.searchbarPersonalizationToggle = config.personalizationToggleVisible ? 'show' : 'hide';

  const searchBarContainer = document.createElement('div');
  searchBarContainer.classList.add('search-bar-container', `search-bar--${config.position}`);
  searchBarContainer.setAttribute('aria-expanded', 'false');
  searchBarContainer.dataset.searchStatus = 'initializing';

  const form = document.createElement('form');
  form.classList.add('search-bar-form');
  form.setAttribute('role', 'search');
  form.setAttribute('aria-controls', resultsId);
  form.setAttribute('aria-busy', 'true');

  const searchIconButton = document.createElement('button');
  searchIconButton.type = 'submit';
  searchIconButton.classList.add('search-bar-icon');
  searchIconButton.setAttribute('aria-label', 'Search');
  searchIconButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('search-bar-input-wrapper');

  const fallbackInput = document.createElement('input');
  fallbackInput.type = 'search';
  fallbackInput.name = 'search';
  fallbackInput.placeholder = config.placeholder;
  inputWrapper.append(fallbackInput);

  const resultsDiv = document.createElement('div');
  resultsDiv.classList.add('search-bar-results');
  resultsDiv.setAttribute('id', resultsId);
  resultsDiv.setAttribute('role', 'region');
  resultsDiv.setAttribute('aria-label', 'Search results');
  resultsDiv.setAttribute('aria-hidden', 'true');
  resultsDiv.setAttribute('aria-busy', 'false');

  const personalizationControls = document.createElement('div');
  personalizationControls.className = 'search-bar-personalization-controls';

  const suggestionsRow = document.createElement('div');
  suggestionsRow.className = 'search-bar-suggestions';
  suggestionsRow.hidden = true;

  const quickChipsRow = document.createElement('div');
  quickChipsRow.className = 'search-bar-quick-chips';
  quickChipsRow.hidden = true;

  const resultsMount = document.createElement('div');
  resultsMount.className = 'search-bar-results-mount';

  const moreFiltersRow = document.createElement('div');
  moreFiltersRow.className = 'search-bar-more-filters';
  moreFiltersRow.hidden = true;

  const moreFiltersLink = document.createElement('a');
  moreFiltersLink.className = 'search-bar-more-filters-link';
  moreFiltersLink.href = rootLink('/search');
  moreFiltersLink.textContent = 'More filters';
  moreFiltersRow.append(moreFiltersLink);

  resultsDiv.append(
    personalizationControls,
    suggestionsRow,
    quickChipsRow,
    resultsMount,
    moreFiltersRow,
  );

  const liveRegion = document.createElement('div');
  liveRegion.classList.add('search-bar-sr-only');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');

  const fallbackNote = document.createElement('p');
  fallbackNote.classList.add('search-bar-fallback-note');
  fallbackNote.hidden = true;

  form.append(inputWrapper, searchIconButton);
  searchBarContainer.append(form, resultsDiv, fallbackNote, liveRegion);
  block.replaceChildren(searchBarContainer);

  let searchInput = fallbackInput;
  applyInputA11y(searchInput, resultsId, false);

  let dropinsAvailable = false;
  let search;
  let clearAnnouncementTimer;
  let debounceTimer;
  let openResultsTimer;
  let disconnectionObserver;
  let searchResultSubscription;
  let latestTypedPhrase = '';
  let dispatchedPhrase = '';
  let latestResultCount = 0;
  let viewAllResultsWrapper;
  let viewAllResultsButton;
  let latestQuickChips = [];
  let latestSuggestions = [];
  let activeQuickFilters = [];
  let latestResultSkuByHref = new Map();
  let lastSuggestionImpressionKey = '';

  const clearTimers = () => {
    if (clearAnnouncementTimer) {
      clearTimeout(clearAnnouncementTimer);
      clearAnnouncementTimer = undefined;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
    if (openResultsTimer) {
      clearTimeout(openResultsTimer);
      openResultsTimer = undefined;
    }
  };

  signal.addEventListener('abort', () => {
    clearTimers();
    if (disconnectionObserver) {
      disconnectionObserver.disconnect();
      disconnectionObserver = undefined;
    }
    if (searchResultSubscription?.off) {
      searchResultSubscription.off();
      searchResultSubscription = undefined;
    }
  }, { once: true });

  const announce = (text) => {
    liveRegion.textContent = text;
  };

  const clearAnnouncementSoon = () => {
    if (clearAnnouncementTimer) clearTimeout(clearAnnouncementTimer);
    clearAnnouncementTimer = setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  };

  const setResultsOpen = (isOpen) => {
    resultsDiv.classList.toggle('is-open', isOpen);
    resultsDiv.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    searchBarContainer.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    applyInputA11y(searchInput, resultsId, isOpen);
  };

  const syncViewAllVisibility = () => {
    if (!viewAllResultsWrapper) return;
    let isVisible = latestResultCount > 0;
    if (config.viewAllMode === 'never') isVisible = false;
    if (config.viewAllMode === 'auto') isVisible = latestResultCount >= config.resultCount;
    viewAllResultsWrapper.hidden = !isVisible;
  };

  const openLinkedLiveSearch = (query = '') => {
    if (!document.querySelector('.nav-search-panel')) {
      return false;
    }

    window.dispatchEvent(new CustomEvent(LIVE_SEARCH_OPEN_EVENT, {
      detail: {
        query,
        focus: true,
      },
    }));
    return true;
  };

  const lockPanelHeight = () => {
    if (!resultsDiv.classList.contains('is-open')) return;
    const currentHeight = Math.round(resultsDiv.getBoundingClientRect().height);
    if (currentHeight > 0) {
      resultsDiv.style.minHeight = `${currentHeight}px`;
    }
    resultsDiv.dataset.loading = 'true';
  };

  const unlockPanelHeight = () => {
    resultsDiv.style.removeProperty('min-height');
    delete resultsDiv.dataset.loading;
  };

  const syncPanelHeight = () => {
    if (!resultsDiv.classList.contains('is-open')) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const viewportCap = Math.round(window.innerHeight * (isMobile ? 0.68 : 0.7));
    const contentHeight = Math.ceil(resultsDiv.scrollHeight);
    const minOpenHeight = 120;
    const configuredCap = Math.min(viewportCap, config.panelMaxHeightPx);
    const nextMaxHeight = Math.max(minOpenHeight, Math.min(contentHeight, configuredCap));
    resultsDiv.style.maxHeight = `${nextMaxHeight}px`;
  };

  const openResults = (onOpen) => {
    if (openResultsTimer) {
      clearTimeout(openResultsTimer);
      openResultsTimer = undefined;
    }
    if (config.openDelayMs <= 0) {
      setResultsOpen(true);
      onOpen?.();
      return;
    }
    openResultsTimer = setTimeout(() => {
      setResultsOpen(true);
      openResultsTimer = undefined;
      onOpen?.();
    }, config.openDelayMs);
  };

  const closeResults = (announcement = '') => {
    if (openResultsTimer) {
      clearTimeout(openResultsTimer);
      openResultsTimer = undefined;
    }
    setResultsOpen(false);
    resultsDiv.setAttribute('aria-busy', 'false');
    resultsDiv.style.removeProperty('max-height');
    unlockPanelHeight();
    if (announcement) {
      announce(announcement);
      clearAnnouncementSoon();
    }
  };

  const getLiveFilters = () => [
    { attribute: 'visibility', in: ['Search', 'Catalog, Search'] },
    ...activeQuickFilters,
  ];

  const getEffectiveSearchSettings = () => (
    config.personalizationEnabled
      ? searchSettings
      : {
        ...searchSettings,
        personalizationEnabled: false,
      }
  );

  const buildSearchHref = (phrase = latestTypedPhrase) => {
    const target = new URL(rootLink('/search'), window.location.origin);
    if (phrase) {
      target.searchParams.set('q', phrase);
    }

    const filterParam = serializeFiltersToParam(activeQuickFilters);
    if (filterParam) {
      target.searchParams.set('filter', filterParam);
    }

    const relativeUrl = `${target.pathname}${target.search}${target.hash}`;
    return withP13nParam(relativeUrl, getEffectiveSearchSettings());
  };

  const syncViewAllLink = (phrase = latestTypedPhrase) => {
    if (!viewAllResultsButton) return;
    const href = buildSearchHref(phrase);
    viewAllResultsButton.setProps((prev) => ({ ...prev, href }));
  };

  const syncMoreFiltersLink = (phrase = latestTypedPhrase) => {
    if (!phrase) {
      moreFiltersRow.hidden = true;
      return;
    }
    moreFiltersLink.href = buildSearchHref(phrase);
    moreFiltersRow.hidden = false;
  };

  function performSearch(phrase, options = {}) {
    const { immediate = false } = options;
    latestTypedPhrase = phrase.trim();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }

    if (!dropinsAvailable || !search) {
      closeResults();
      return;
    }

    if (!latestTypedPhrase) {
      search(null, { scope: searchScope });
      closeResults();
      return;
    }

    if (latestTypedPhrase.length < config.minQueryLength) {
      closeResults();
      return;
    }

    const runSearch = () => {
      dispatchedPhrase = latestTypedPhrase;
      resultsDiv.setAttribute('aria-busy', 'true');
      lockPanelHeight();

      const baseRequest = {
        phrase: dispatchedPhrase,
        pageSize: LIVE_SEARCH_REQUEST_PAGE_SIZE,
        filter: getLiveFilters(),
      };
      const { request, personalization } = withSearchContext(
        baseRequest,
        getEffectiveSearchSettings(),
      );
      emitSearchRequestTelemetry(personalization, request);

      search(request, { scope: searchScope });
    };

    if (immediate || config.debounceMs <= 0) {
      runSearch();
      return;
    }

    debounceTimer = setTimeout(runSearch, config.debounceMs);
  }

  const renderSuggestions = (uiText) => {
    suggestionsRow.innerHTML = '';

    if (!config.suggestionsEnabled || latestSuggestions.length === 0 || !latestTypedPhrase) {
      suggestionsRow.hidden = true;
      return;
    }

    const label = document.createElement('p');
    label.className = 'search-bar-suggestions-label';
    label.textContent = uiText.searchSuggestions;
    suggestionsRow.append(label);

    const list = document.createElement('div');
    list.className = 'search-bar-suggestions-list';

    latestSuggestions.forEach((suggestion) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-bar-suggestion-pill';
      button.textContent = suggestion;
      button.addEventListener('click', () => {
        if (!searchInput) return;
        searchInput.value = suggestion;
        recordSuggestionClick(suggestion, { surface: 'search-bar' });
        emitSearchTelemetry('search-suggestion-click', {
          surface: 'search-bar',
          suggestion,
        });
        performSearch(suggestion, { immediate: true });
      }, { signal });
      list.append(button);
    });

    suggestionsRow.append(list);
    suggestionsRow.hidden = false;

    const nextImpressionKey = `${latestTypedPhrase}:${latestSuggestions.join('|')}`;
    if (nextImpressionKey !== lastSuggestionImpressionKey) {
      lastSuggestionImpressionKey = nextImpressionKey;
      emitSearchTelemetry('search-suggestion-impression', {
        surface: 'search-bar',
        phrase: latestTypedPhrase,
        suggestions: [...latestSuggestions],
      });
    }
  };

  const renderQuickChips = () => {
    quickChipsRow.innerHTML = '';

    if (!config.liveChipsEnabled || latestQuickChips.length === 0 || !latestTypedPhrase) {
      quickChipsRow.hidden = true;
      return;
    }

    latestQuickChips.forEach((chip) => {
      const chipButton = document.createElement('button');
      chipButton.type = 'button';
      chipButton.className = 'search-bar-chip';
      const selected = hasFilter(activeQuickFilters, chip.filter);
      chipButton.setAttribute('aria-pressed', selected ? 'true' : 'false');
      chipButton.classList.toggle('is-active', selected);
      chipButton.textContent = chip.label;
      chipButton.addEventListener('click', () => {
        const wasSelected = hasFilter(activeQuickFilters, chip.filter);
        activeQuickFilters = toggleFilter(activeQuickFilters, chip.filter);
        emitSearchTelemetry(wasSelected ? 'search-chip-removed' : 'search-chip-applied', {
          surface: 'search-bar',
          chip: chip.label,
          attribute: chip.attribute,
        });
        syncViewAllLink();
        syncMoreFiltersLink();
        renderQuickChips();
        performSearch(latestTypedPhrase, { immediate: true });
      }, { signal });
      quickChipsRow.append(chipButton);
    });

    quickChipsRow.hidden = false;
  };

  const updatePanelVisibility = (uiText) => {
    const hasVisibleResults = latestResultCount > 0;
    const hasAuxiliaryContent = latestSuggestions.length > 0 || latestQuickChips.length > 0;

    if (hasVisibleResults || hasAuxiliaryContent) {
      openResults(() => {
        requestAnimationFrame(() => {
          syncPanelHeight();
          unlockPanelHeight();
        });
      });

      if (hasVisibleResults) {
        announce(`${latestResultCount} ${latestResultCount === 1 ? uiText.resultFound : uiText.resultsFound}`);
      } else {
        announce('');
      }
      return;
    }

    closeResults();
    unlockPanelHeight();
    announce('');
  };

  function emitSearchRequestTelemetry(personalization, request) {
    const effectiveSettings = getEffectiveSearchSettings();
    emitSearchTelemetry('search-request-context', {
      surface: 'search-bar',
      phrase: request?.phrase || '',
      hasContext: Boolean(personalization.context),
      personalizationEnabled: effectiveSettings.personalizationEnabled,
      treatment: isPersonalizationTreatment(effectiveSettings),
      holdoutBucket: effectiveSettings.holdoutBucket,
    });
  }

  function updatePersonalizationControls(uiText) {
    personalizationControls.innerHTML = '';

    if (!config.personalizationEnabled || !config.personalizationToggleVisible) {
      personalizationControls.hidden = true;
      return;
    }

    const controlsInner = document.createElement('div');
    controlsInner.className = 'search-bar-personalization-inner';

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'search-bar-personalization-toggle';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = Boolean(searchSettings.personalizationEnabled);

    const toggleText = document.createElement('span');
    toggleText.textContent = uiText.personalizedResults;

    toggleLabel.append(toggle, toggleText);

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'search-bar-personalization-reset';
    resetButton.textContent = uiText.resetSearchPreferences;

    toggle.addEventListener('change', () => {
      searchSettings = setPersonalizationEnabled(toggle.checked);
      emitSearchTelemetry('search-personalization-toggle', {
        surface: 'search-bar',
        enabled: searchSettings.personalizationEnabled,
      });
      syncViewAllLink();
      syncMoreFiltersLink();
      if (latestTypedPhrase.length >= config.minQueryLength) {
        performSearch(latestTypedPhrase, { immediate: true });
      }
    }, { signal });

    resetButton.addEventListener('click', () => {
      resetSearchProfile();
      searchSettings = resetSearchSettings();
      activeQuickFilters = [];
      emitSearchTelemetry('search-personalization-reset', {
        surface: 'search-bar',
      });
      syncViewAllLink();
      syncMoreFiltersLink();
      renderQuickChips();
      if (latestTypedPhrase.length >= config.minQueryLength) {
        performSearch(latestTypedPhrase, { immediate: true });
      }
    }, { signal });

    controlsInner.append(toggleLabel, resetButton);
    personalizationControls.append(controlsInner);
    personalizationControls.hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput?.value?.trim() || '';
    if (!query) return;

    recordSearchQuery(query, { surface: 'search-bar' });

    if (openLinkedLiveSearch(query)) {
      return;
    }

    window.location.href = buildSearchHref(query);
  }, { signal });

  form.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT') {
      const currentValue = e.target.value.trim();
      if (currentValue.length >= config.minQueryLength && !resultsDiv.classList.contains('is-open')) {
        performSearch(currentValue);
      }
    }
  }, { signal });

  document.addEventListener('click', (e) => {
    if (!searchBarContainer.contains(e.target) && resultsDiv.classList.contains('is-open')) {
      closeResults('Search results closed');
      if (searchInput && document.activeElement === searchInput) {
        searchInput.blur();
      }
    }
  }, { signal });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resultsDiv.classList.contains('is-open')) {
      closeResults('Search results closed');
      if (searchInput) {
        searchInput.blur();
      }
    }
  }, { signal });

  window.addEventListener('resize', () => {
    if (resultsDiv.classList.contains('is-open')) {
      syncPanelHeight();
    }
  }, { signal, passive: true });

  resultsMount.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const sku = latestResultSkuByHref.get(normalizeHref(anchor.href));
    if (!sku) return;

    recordSearchProductClick(sku, { surface: 'search-bar' });
  }, { signal });

  const observerRoot = block.parentElement || block.closest('main') || document.body;
  disconnectionObserver = new MutationObserver(() => {
    if (!block.isConnected) {
      eventsController.abort();
    }
  });
  disconnectionObserver.observe(observerRoot, {
    childList: true,
    subtree: observerRoot === document.body,
  });

  try {
    await import('../../scripts/initializers/search.js');

    const [
      { search: searchApi },
      { render },
      { SearchResults },
      { provider: UI, Input, Button },
      labels,
    ] = await Promise.all([
      import('@dropins/storefront-product-discovery/api.js'),
      import('@dropins/storefront-product-discovery/render.js'),
      import('@dropins/storefront-product-discovery/containers/SearchResults.js'),
      import('@dropins/tools/components.js'),
      fetchPlaceholders().catch(() => ({})),
    ]);

    search = searchApi;
    const uiText = {
      search: labels.Global?.Search || 'Search',
      searchResults: labels.Global?.SearchResults || 'Search results',
      searchViewAll: labels.Global?.SearchViewAll || 'View All Results',
      resultFound: labels.Global?.SearchResultFound || 'result found',
      resultsFound: labels.Global?.SearchResultsFound || 'results found',
      resultsClosed: labels.Global?.SearchResultsClosed || 'Search results closed',
      searchSuggestions: labels.Global?.SearchSuggestions || 'Suggestions',
      moreFilters: labels.Global?.SearchMoreFilters || 'More filters',
      personalizedResults: labels.Global?.SearchPersonalized || 'Personalized results',
      resetSearchPreferences: labels.Global?.SearchResetPreferences || 'Reset search preferences',
      fallbackInlineUnavailable: labels.Global?.SearchInlineUnavailable
        || 'Inline suggestions unavailable. Press Enter to search.',
    };

    moreFiltersLink.textContent = uiText.moreFilters;
    updatePersonalizationControls(uiText);

    searchIconButton.setAttribute('aria-label', uiText.search);
    resultsDiv.setAttribute('aria-label', uiText.searchResults);

    searchResultSubscription = events.on('search/result', (payload) => {
      const payloadPhrase = payload?.request?.phrase;
      if (!payload?.request || (payloadPhrase && payloadPhrase !== latestTypedPhrase)) {
        return;
      }

      activeQuickFilters = stripSystemFilters(payload.request.filter || []);
      latestQuickChips = config.liveChipsEnabled
        ? deriveQuickChips(payload.result?.facets || [], { maxChips: 4 })
        : [];
      latestSuggestions = config.suggestionsEnabled
        ? getTopSuggestions(payload.result?.suggestions || [], 3)
        : [];

      latestResultSkuByHref = new Map((payload.result?.items || []).map((item) => [
        normalizeHref(getProductLink(item.urlKey, item.sku)),
        item.sku,
      ]));

      renderQuickChips();
      renderSuggestions(uiText);
      syncMoreFiltersLink(payload.request.phrase || latestTypedPhrase);
      syncViewAllLink(payload.request.phrase || latestTypedPhrase);
      updatePanelVisibility(uiText);
    }, { eager: true, scope: searchScope });

    render.render(SearchResults, {
      skeletonCount: config.resultCount,
      scope: searchScope,
      routeProduct: ({ urlKey, sku }) => getProductLink(urlKey, sku),
      onSearchResult: (results) => {
        if (!dispatchedPhrase || latestTypedPhrase !== dispatchedPhrase) {
          return;
        }

        if (Array.isArray(results) && results.length > config.resultCount) {
          results.splice(config.resultCount);
        }

        latestResultCount = results.length;
        syncViewAllVisibility();
        resultsDiv.setAttribute('aria-busy', 'false');
        resultsDiv.dataset.resultCount = `${results.length}`;

        updatePanelVisibility(uiText);
      },
      slots: {
        ProductImage: (ctx) => {
          const { product, defaultImageProps } = ctx;
          const anchorWrapper = document.createElement('a');
          anchorWrapper.href = getProductLink(product.urlKey, product.sku);

          if (!defaultImageProps?.src) {
            ctx.replaceWith(anchorWrapper);
            return;
          }

          tryRenderAemAssetsImage(ctx, {
            alias: getSafeAemAlias(product),
            imageProps: defaultImageProps,
            wrapper: anchorWrapper,
            params: {
              width: defaultImageProps.width,
              height: defaultImageProps.height,
            },
          });
        },
        Footer: async (ctx) => {
          viewAllResultsWrapper = document.createElement('div');
          viewAllResultsWrapper.classList.add('search-bar-view-all');

          viewAllResultsButton = await UI.render(Button, {
            children: uiText.searchViewAll,
            variant: 'secondary',
            href: buildSearchHref(),
          })(viewAllResultsWrapper);

          ctx.appendChild(viewAllResultsWrapper);
          syncViewAllVisibility();

          ctx.onChange((next) => {
            syncViewAllLink(next.variables?.phrase || latestTypedPhrase);
          });
        },
      },
    })(resultsMount);

    inputWrapper.replaceChildren();
    UI.render(Input, {
      name: 'search',
      placeholder: config.placeholder,
      onValue: (phrase) => {
        performSearch(phrase);
      },
    })(inputWrapper);

    searchInput = inputWrapper.querySelector('input[name="search"]') || inputWrapper.querySelector('input') || fallbackInput;
    if (searchInput && fallbackInput.value) {
      searchInput.value = fallbackInput.value;
    }
    applyInputA11y(searchInput, resultsId, false);

    dropinsAvailable = true;
    searchBarContainer.dataset.searchStatus = 'ready';
    form.setAttribute('aria-busy', 'false');
    fallbackNote.hidden = true;

    const initialValue = searchInput?.value?.trim() || '';
    if (initialValue.length >= config.minQueryLength) {
      performSearch(initialValue);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('search-bar: inline search unavailable. Falling back to submit-only mode.', error);
    searchBarContainer.dataset.searchStatus = 'fallback';
    form.setAttribute('aria-busy', 'false');
    closeResults();
    fallbackNote.textContent = 'Inline suggestions are currently unavailable. Press Enter to search.';
    fallbackNote.hidden = false;
  }
}

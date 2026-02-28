import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';

const SEARCH_SETTINGS_VERSION = 1;
const SEARCH_SETTINGS_SUFFIX = 'searchSettings:v1';
const DEFAULT_PERSONALIZATION_ENABLED = true;
const CONTROL_BUCKET_THRESHOLD = 0.1;
const P13N_PARAM = 'p13n';
const memoryStorage = new Map();

function getSafeLocalStorage() {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

function readStorageValue(key) {
  const storage = getSafeLocalStorage();
  if (storage) {
    return storage.getItem(key);
  }
  return memoryStorage.get(key) || null;
}

function writeStorageValue(key, value) {
  const storage = getSafeLocalStorage();
  if (storage) {
    storage.setItem(key, value);
    return;
  }
  memoryStorage.set(key, value);
}

function sanitizeStorePrefix(rawPrefix) {
  if (!rawPrefix || typeof rawPrefix !== 'string') return 'default';
  const sanitized = rawPrefix.trim().replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  return sanitized || 'default';
}

function getStorePrefix() {
  const rawPrefix = getConfigValue('headers.cs.Magento-Store-View-Code')
    || getConfigValue('commerce-store-view-code')
    || getConfigValue('headers.cs.magento-store-view-code');

  return sanitizeStorePrefix(rawPrefix);
}

export function getSearchSettingsStorageKey() {
  return `${getStorePrefix()}:${SEARCH_SETTINGS_SUFFIX}`;
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

function getP13nParamValue(url = window.location.href) {
  try {
    const parsed = new URL(url, window.location.origin);
    const value = parsed.searchParams.get(P13N_PARAM);
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'on') return true;
    if (normalized === 'off') return false;
    return null;
  } catch (e) {
    return null;
  }
}

function assignHoldoutBucket() {
  return Math.random() < CONTROL_BUCKET_THRESHOLD ? 'control' : 'treatment';
}

function applyUrlOverride(settings) {
  const urlOverride = getP13nParamValue();
  if (urlOverride === null) return settings;
  return {
    ...settings,
    personalizationEnabled: urlOverride,
  };
}

export function loadSearchSettings() {
  const defaults = {
    version: SEARCH_SETTINGS_VERSION,
    personalizationEnabled: DEFAULT_PERSONALIZATION_ENABLED,
    holdoutBucket: assignHoldoutBucket(),
    resetAt: null,
  };

  const parsed = parseJson(readStorageValue(getSearchSettingsStorageKey()));
  const merged = {
    ...defaults,
    ...(parsed || {}),
  };

  const withOverride = applyUrlOverride(merged);
  saveSearchSettings(withOverride);
  return withOverride;
}

export function saveSearchSettings(nextSettings) {
  const value = {
    ...nextSettings,
    version: SEARCH_SETTINGS_VERSION,
  };
  writeStorageValue(getSearchSettingsStorageKey(), JSON.stringify(value));
  return value;
}

export function setPersonalizationUrlState(isEnabled, replaceState = true) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(P13N_PARAM, isEnabled ? 'on' : 'off');

    if (replaceState) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  } catch (e) {
    // Ignore URL update failures.
  }
}

export function setPersonalizationEnabled(isEnabled, options = {}) {
  const { syncUrl = true } = options;
  const settings = loadSearchSettings();
  const updated = saveSearchSettings({
    ...settings,
    personalizationEnabled: Boolean(isEnabled),
  });

  if (syncUrl) {
    setPersonalizationUrlState(Boolean(isEnabled));
  }

  return updated;
}

export function resetSearchSettings(options = {}) {
  const { syncUrl = true } = options;
  const settings = loadSearchSettings();
  const updated = saveSearchSettings({
    ...settings,
    personalizationEnabled: DEFAULT_PERSONALIZATION_ENABLED,
    resetAt: new Date().toISOString(),
  });

  if (syncUrl) {
    setPersonalizationUrlState(DEFAULT_PERSONALIZATION_ENABLED);
  }

  return updated;
}

export function isPersonalizationTreatment(settings = loadSearchSettings()) {
  return settings.holdoutBucket !== 'control';
}

export function isPersonalizationActive(settings = loadSearchSettings()) {
  return Boolean(settings.personalizationEnabled) && isPersonalizationTreatment(settings);
}

export function withP13nParam(targetUrl, settingsOrEnabled = loadSearchSettings()) {
  const isEnabled = typeof settingsOrEnabled === 'boolean'
    ? settingsOrEnabled
    : Boolean(settingsOrEnabled.personalizationEnabled);

  try {
    const parsed = new URL(targetUrl, window.location.origin);
    parsed.searchParams.set(P13N_PARAM, isEnabled ? 'on' : 'off');
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (e) {
    return targetUrl;
  }
}

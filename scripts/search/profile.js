import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';

const SEARCH_PROFILE_VERSION = 1;
const SEARCH_PROFILE_SUFFIX = 'searchProfile:v1';
const SEARCH_PROFILE_TTL_MS = 1000 * 60 * 60 * 24 * 90;
const MAX_VIEW_HISTORY = 20;
const MAX_QUERY_HISTORY = 40;
const MAX_SUGGESTION_HISTORY = 40;
const MAX_ADD_TO_CART_HISTORY = 40;
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

function removeStorageValue(key) {
  const storage = getSafeLocalStorage();
  if (storage) {
    storage.removeItem(key);
    return;
  }
  memoryStorage.delete(key);
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

export function getSearchProfileStorageKey() {
  return `${getStorePrefix()}:${SEARCH_PROFILE_SUFFIX}`;
}

function createEmptyProfile() {
  return {
    version: SEARCH_PROFILE_VERSION,
    updatedAt: null,
    queryHistory: [],
    viewHistory: [],
    suggestionHistory: [],
    addToCartHistory: [],
  };
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

function isExpired(profile) {
  if (!profile?.updatedAt) return false;
  const updatedAt = Date.parse(profile.updatedAt);
  if (Number.isNaN(updatedAt)) return true;
  return (Date.now() - updatedAt) > SEARCH_PROFILE_TTL_MS;
}

function trimHistory(items, maxItems) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, maxItems);
}

function touchProfile(nextProfile) {
  return {
    ...nextProfile,
    version: SEARCH_PROFILE_VERSION,
    updatedAt: new Date().toISOString(),
    queryHistory: trimHistory(nextProfile.queryHistory, MAX_QUERY_HISTORY),
    viewHistory: trimHistory(nextProfile.viewHistory, MAX_VIEW_HISTORY),
    suggestionHistory: trimHistory(nextProfile.suggestionHistory, MAX_SUGGESTION_HISTORY),
    addToCartHistory: trimHistory(nextProfile.addToCartHistory, MAX_ADD_TO_CART_HISTORY),
  };
}

export function loadSearchProfile() {
  const parsed = parseJson(readStorageValue(getSearchProfileStorageKey()));
  if (!parsed || isExpired(parsed)) {
    const emptyProfile = createEmptyProfile();
    saveSearchProfile(emptyProfile);
    return emptyProfile;
  }

  const merged = {
    ...createEmptyProfile(),
    ...parsed,
  };

  const touched = touchProfile(merged);
  saveSearchProfile(touched);
  return touched;
}

export function saveSearchProfile(nextProfile) {
  const touched = touchProfile(nextProfile);
  writeStorageValue(getSearchProfileStorageKey(), JSON.stringify(touched));
  return touched;
}

function prependUniqueEntries(entries, nextEntry, uniqueResolver, maxItems) {
  const nextKey = uniqueResolver(nextEntry);
  const deduped = entries.filter((entry) => uniqueResolver(entry) !== nextKey);
  return [nextEntry, ...deduped].slice(0, maxItems);
}

function normalizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function recordSearchQuery(query, metadata = {}) {
  const normalizedQuery = normalizeString(query);
  if (!normalizedQuery) return loadSearchProfile();

  const profile = loadSearchProfile();
  const entry = {
    query: normalizedQuery,
    dateTime: new Date().toISOString(),
    surface: metadata.surface || 'unknown',
  };

  return saveSearchProfile({
    ...profile,
    queryHistory: prependUniqueEntries(
      profile.queryHistory,
      entry,
      (item) => item.query.toLowerCase(),
      MAX_QUERY_HISTORY,
    ),
  });
}

export function recordSuggestionClick(suggestion, metadata = {}) {
  const normalizedSuggestion = normalizeString(suggestion);
  if (!normalizedSuggestion) return loadSearchProfile();

  const profile = loadSearchProfile();
  const entry = {
    suggestion: normalizedSuggestion,
    dateTime: new Date().toISOString(),
    surface: metadata.surface || 'unknown',
  };

  return saveSearchProfile({
    ...profile,
    suggestionHistory: prependUniqueEntries(
      profile.suggestionHistory,
      entry,
      (item) => item.suggestion.toLowerCase(),
      MAX_SUGGESTION_HISTORY,
    ),
  });
}

export function recordSearchProductClick(sku, metadata = {}) {
  const normalizedSku = normalizeString(sku);
  if (!normalizedSku) return loadSearchProfile();

  const profile = loadSearchProfile();
  const entry = {
    sku: normalizedSku,
    dateTime: new Date().toISOString(),
    surface: metadata.surface || 'unknown',
  };

  return saveSearchProfile({
    ...profile,
    viewHistory: prependUniqueEntries(
      profile.viewHistory,
      entry,
      (item) => item.sku,
      MAX_VIEW_HISTORY,
    ),
  });
}

export function recordSearchAddToCart(sku, metadata = {}) {
  const normalizedSku = normalizeString(sku);
  if (!normalizedSku) return loadSearchProfile();

  const profile = loadSearchProfile();
  const entry = {
    sku: normalizedSku,
    dateTime: new Date().toISOString(),
    surface: metadata.surface || 'unknown',
  };

  return saveSearchProfile({
    ...profile,
    addToCartHistory: prependUniqueEntries(
      profile.addToCartHistory,
      entry,
      (item) => item.sku,
      MAX_ADD_TO_CART_HISTORY,
    ),
  });
}

export function getUserViewHistory(maxEntries = MAX_VIEW_HISTORY) {
  const profile = loadSearchProfile();
  return trimHistory(profile.viewHistory, maxEntries).map(({ sku, dateTime }) => ({
    sku,
    dateTime,
  }));
}

export function resetSearchProfile() {
  removeStorageValue(getSearchProfileStorageKey());
  const emptyProfile = createEmptyProfile();
  saveSearchProfile(emptyProfile);
  return emptyProfile;
}

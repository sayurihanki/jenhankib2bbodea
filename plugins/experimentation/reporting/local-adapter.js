/* eslint-disable import/extensions */
import {
  DEFAULT_EXPERIMENTATION_CONFIG,
  STORAGE_KEYS,
  createStableVisitorId,
} from '../lib/experiments.mjs';
import {
  computeExperimentReport,
  computePortfolio,
  createBlankSeed,
} from '../lib/reporting.mjs';

function getStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Deliberately ignore storage quota errors.
  }
}

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      return fallback;
    }

    return await response.json();
  } catch (error) {
    return fallback;
  }
}

function getEvents() {
  return getStorage(STORAGE_KEYS.events, []);
}

function saveEvents(events) {
  setStorage(STORAGE_KEYS.events, events.slice(-600));
}

export function getOrCreateVisitorId() {
  const existing = window.localStorage.getItem(STORAGE_KEYS.identity);
  if (existing) return existing;
  const visitorId = createStableVisitorId(window.location.host);
  window.localStorage.setItem(STORAGE_KEYS.identity, visitorId);
  return visitorId;
}

export async function loadRegistry(config = DEFAULT_EXPERIMENTATION_CONFIG) {
  const registry = await fetchJson(config.registryPath, { experiments: [] });
  return Array.isArray(registry.experiments) ? registry.experiments : [];
}

export async function loadSeeds() {
  const seeded = await fetchJson('/data/experiments/mock-reports.json', { reports: {} });
  return seeded.reports || {};
}

export const localReportingAdapter = {
  async recordEvent(event) {
    const events = getEvents();
    events.push({
      ...event,
      id: event.id || `${event.experimentId}:${event.variantKey}:${Date.now()}`,
    });
    saveEvents(events);
    return event;
  },

  async getPortfolio(config = DEFAULT_EXPERIMENTATION_CONFIG) {
    const [registry, seeds] = await Promise.all([loadRegistry(config), loadSeeds()]);
    const events = getEvents();
    const hydratedSeeds = registry.reduce((accumulator, experiment) => {
      accumulator[experiment.id] = seeds[experiment.id] || createBlankSeed(experiment);
      return accumulator;
    }, {});
    return computePortfolio(registry, events, hydratedSeeds);
  },

  async getExperimentReport(experimentId, config = DEFAULT_EXPERIMENTATION_CONFIG) {
    const [registry, seeds] = await Promise.all([loadRegistry(config), loadSeeds()]);
    const experiment = registry.find((entry) => entry.id === experimentId);
    if (!experiment) {
      return null;
    }
    return computeExperimentReport(
      experiment,
      getEvents().filter((event) => event.experimentId === experimentId),
      seeds[experimentId] || createBlankSeed(experiment),
    );
  },

  async getSegmentBreakdown(experimentId, dimension, config = DEFAULT_EXPERIMENTATION_CONFIG) {
    const report = await this.getExperimentReport(experimentId, config);
    return report?.segmentBreakdowns?.[dimension] || [];
  },

  getEvents,
};

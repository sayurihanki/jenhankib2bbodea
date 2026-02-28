import { events } from '@dropins/tools/event-bus.js';
import { getUserViewHistory } from './profile.js';
import { isPersonalizationActive, loadSearchSettings } from './settings.js';

let customerGroupValue = null;
let customerGroupSubscribed = false;

function normalizeCustomerGroup(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;

  const candidates = [
    payload.customerGroup,
    payload.customerGroupId,
    payload.groupId,
    payload.uid,
  ];

  const matched = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return matched ? matched.trim() : null;
}

function ensureCustomerGroupSubscription() {
  if (customerGroupSubscribed) return;

  customerGroupSubscribed = true;

  try {
    if (typeof events.lastPayload === 'function') {
      customerGroupValue = normalizeCustomerGroup(events.lastPayload('auth/group-uid'));
    }
  } catch (e) {
    // Ignore event bus lookup failures.
  }

  try {
    events.on('auth/group-uid', (payload) => {
      customerGroupValue = normalizeCustomerGroup(payload);
    }, { eager: true });
  } catch (e) {
    // Ignore event bus subscription failures.
  }
}

export function getCustomerGroup() {
  ensureCustomerGroupSubscription();
  return customerGroupValue;
}

export function getPersonalizationReason(context) {
  if (!context) return null;
  if (Array.isArray(context.userViewHistory) && context.userViewHistory.length > 0) {
    return 'based on recent search behavior';
  }
  if (context.customerGroup) {
    return 'popular in your company';
  }
  return null;
}

export function buildSearchContext(settings = loadSearchSettings()) {
  ensureCustomerGroupSubscription();

  if (!isPersonalizationActive(settings)) {
    return {
      context: undefined,
      hasContext: false,
      reason: null,
      applied: false,
    };
  }

  const userViewHistory = getUserViewHistory(20);
  const customerGroup = getCustomerGroup();

  const context = {};
  if (userViewHistory.length > 0) {
    context.userViewHistory = userViewHistory;
  }
  if (customerGroup) {
    context.customerGroup = customerGroup;
  }

  const hasContext = Object.keys(context).length > 0;

  return {
    context: hasContext ? context : undefined,
    hasContext,
    reason: hasContext ? getPersonalizationReason(context) : null,
    applied: true,
  };
}

export function withSearchContext(request, settings = loadSearchSettings()) {
  const baseRequest = { ...(request || {}) };
  delete baseRequest.context;

  const personalization = buildSearchContext(settings);
  if (!personalization.context) {
    return {
      request: baseRequest,
      personalization,
    };
  }

  return {
    request: {
      ...baseRequest,
      context: personalization.context,
    },
    personalization,
  };
}

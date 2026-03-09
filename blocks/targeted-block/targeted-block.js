import { events } from '@dropins/tools/event-bus.js';
import { getPersonalizationData } from '@dropins/storefront-personalization/api.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const targetedBlocks = [];
let listenersBound = false;

function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

function prepareIds(providedIds) {
  return providedIds
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => btoa(value));
}

function normalizeList(values) {
  return Array.isArray(values)
    ? values.map((value) => `${value}`.trim()).filter(Boolean)
    : [];
}

function normalizeGroupHash(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function includesAny(actual, expected) {
  return expected.some((value) => actual.includes(value));
}

function normalizeFragmentPath(path) {
  if (typeof path !== 'string') {
    return '';
  }

  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return '';
  }

  if (trimmedPath.startsWith('/')) {
    return trimmedPath;
  }

  try {
    return new URL(trimmedPath, window.location.href).pathname;
  } catch (error) {
    return trimmedPath;
  }
}

function getInlineContent(block) {
  const contentRow = [...block.querySelectorAll(':scope > div')].find((row) => {
    const [labelCell] = row.children;
    return toClassName(labelCell?.textContent) === 'content';
  });

  const contentCell = contentRow?.children?.[1];
  if (!contentCell) {
    return null;
  }

  const container = document.createElement('div');
  container.append(...contentCell.childNodes);
  return container;
}

async function hashBase64Value(base64Value) {
  const decoded = atob(base64Value);
  const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getRuntimeState() {
  const personalizationData = getPersonalizationData();

  return {
    groupHash: normalizeGroupHash(events.lastPayload('auth/group-uid')),
    personalization: {
      groups: normalizeList(personalizationData.groups),
      segments: normalizeList(personalizationData.segments),
      cartRules: normalizeList(personalizationData.cartRules),
    },
  };
}

function matchesCustomerGroups(instance, runtimeState) {
  if (!instance.groups.length) {
    return true;
  }

  if (runtimeState.groupHash && instance.groupHashes.includes(runtimeState.groupHash)) {
    return true;
  }

  return includesAny(runtimeState.personalization.groups, instance.groups);
}

function matchesPersonalization(actualValues, expectedValues) {
  if (!expectedValues.length) {
    return true;
  }

  return includesAny(actualValues, expectedValues);
}

function isEligible(instance, runtimeState) {
  return matchesCustomerGroups(instance, runtimeState)
    && matchesPersonalization(runtimeState.personalization.segments, instance.segments)
    && matchesPersonalization(runtimeState.personalization.cartRules, instance.cartRules);
}

function getBlockOrder() {
  return new Map(
    [...document.querySelectorAll('.targeted-block')].map((element, index) => [element, index]),
  );
}

function setBlockVisibility(instance, visible) {
  instance.block.hidden = !visible;
  instance.block.setAttribute('aria-hidden', `${!visible}`);
}

function updateTargetedBlocks() {
  const visibleTypes = new Set();
  const runtimeState = getRuntimeState();
  const blockOrder = getBlockOrder();

  targetedBlocks
    .filter((instance) => instance.block.isConnected)
    .sort((left, right) => (blockOrder.get(left.block) ?? 0) - (blockOrder.get(right.block) ?? 0))
    .forEach((instance) => {
      const matches = isEligible(instance, runtimeState);
      const typeKey = instance.type || '';
      const visible = matches && (!typeKey || !visibleTypes.has(typeKey));

      if (visible && typeKey) {
        visibleTypes.add(typeKey);
      }

      setBlockVisibility(instance, visible);
    });
}

function bindListeners() {
  if (listenersBound) {
    return;
  }

  listenersBound = true;

  const refresh = () => updateTargetedBlocks();

  events.on('authenticated', refresh, { eager: true });
  events.on('auth/group-uid', refresh, { eager: true });
  events.on('personalization/updated', refresh, { eager: true });
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);

  const {
    fragment,
    type,
    'customer-segments': customerSegments,
    'customer-groups': customerGroups,
    'cart-rules': rules,
  } = blockConfig;

  const fragmentPath = normalizeFragmentPath(fragment);
  const fragmentContent = fragmentPath ? await loadFragment(fragmentPath) : null;
  const content = fragmentContent || getInlineContent(block);

  const groups = customerGroups !== undefined ? prepareIds(customerGroups) : [];
  const segments = customerSegments !== undefined ? prepareIds(customerSegments) : [];
  const cartRules = rules !== undefined ? prepareIds(rules) : [];
  const groupHashes = await Promise.all(groups.map(hashBase64Value));

  const contentContainer = document.createElement('div');
  if (content) {
    if (content.matches?.('main')) {
      contentContainer.append(...content.childNodes);
    } else {
      contentContainer.append(content);
    }
  }

  block.replaceChildren(contentContainer);

  targetedBlocks.push({
    block,
    type: type?.trim(),
    groups,
    groupHashes,
    segments,
    cartRules,
  });

  bindListeners();
  updateTargetedBlocks();
}

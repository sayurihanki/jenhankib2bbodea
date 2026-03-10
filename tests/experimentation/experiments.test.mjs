/* eslint-disable import/extensions */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createAssignmentSeed,
  createPlainHtmlUrl,
  createRuntimeContext,
  matchesAudience,
  normalizeSourceLink,
  pickVariant,
} from '../../plugins/experimentation/lib/experiments.mjs';

test('normalizeSourceLink resolves preview and author links', () => {
  const preview = normalizeSourceLink(
    'https://main--site--org.aem.page/products/example',
    'https://example.com',
  );
  const author = normalizeSourceLink(
    'https://da.live/edit#/https://main--site--org.aem.page/fragments/hero-fragment',
    'https://example.com',
  );

  assert.equal(preview.sourceEnv, 'preview');
  assert.equal(preview.resolvedPath, '/products/example');
  assert.equal(author.resolvedPath, '/fragments/hero-fragment');
});

test('createPlainHtmlUrl keeps explicit plain html links intact', () => {
  const url = createPlainHtmlUrl({
    resolvedUrl: 'https://example.com/data/experiments/sources/editorial-homepage.plain.html',
  });

  assert.equal(
    url,
    'https://example.com/data/experiments/sources/editorial-homepage.plain.html',
  );
});

test('createPlainHtmlUrl maps the homepage to the EDS root plain html path', () => {
  const url = createPlainHtmlUrl({
    resolvedUrl: 'https://example.com/',
  });

  assert.equal(url, 'https://example.com/.plain.html');
});

test('matchesAudience honors path wildcards and device filters', () => {
  const experiment = {
    audience: {
      paths: ['/products/*'],
      devices: ['desktop'],
      authStates: ['guest'],
    },
  };

  const runtime = createRuntimeContext({
    pathname: '/products/rack-1',
    device: 'desktop',
    authState: 'guest',
  });

  assert.equal(matchesAudience(experiment, runtime), true);
  assert.equal(matchesAudience(experiment, createRuntimeContext({
    pathname: '/products/rack-1',
    device: 'mobile',
    authState: 'guest',
  })), false);
});

test('pickVariant is deterministic for a given seed', () => {
  const experiment = {
    allocation: [
      { variantKey: 'control', weight: 50 },
      { variantKey: 'variant-b', weight: 50 },
    ],
    variants: [
      { key: 'control' },
      { key: 'variant-b' },
    ],
  };

  const seed = createAssignmentSeed('exp', 'page-root', 'visitor-1', '/');
  const left = pickVariant(experiment, seed);
  const right = pickVariant(experiment, seed);

  assert.equal(left.key, right.key);
});

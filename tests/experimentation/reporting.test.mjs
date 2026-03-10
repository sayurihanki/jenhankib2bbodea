/* eslint-disable import/extensions */
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeExperimentReport, computePortfolio } from '../../plugins/experimentation/lib/reporting.mjs';

test('computeExperimentReport produces variant metrics and warnings', () => {
  const experiment = {
    id: 'exp-one',
    name: 'Experiment One',
    status: 'active',
    primaryMetric: 'purchase',
    allocation: [
      { variantKey: 'control', weight: 50 },
      { variantKey: 'variant-b', weight: 50 },
    ],
    variants: [
      { key: 'control', label: 'Control' },
      { key: 'variant-b', label: 'Variant B' },
    ],
  };
  const events = [
    {
      experimentId: 'exp-one',
      variantKey: 'control',
      eventType: 'exposure',
      metricKey: 'exposure',
      timestamp: '2026-03-10T00:00:00.000Z',
      value: 1,
    },
    {
      experimentId: 'exp-one',
      variantKey: 'control',
      eventType: 'exposure',
      metricKey: 'exposure',
      timestamp: '2026-03-10T00:00:01.000Z',
      value: 1,
    },
    {
      experimentId: 'exp-one',
      variantKey: 'variant-b',
      eventType: 'exposure',
      metricKey: 'exposure',
      timestamp: '2026-03-10T00:00:02.000Z',
      value: 1,
    },
    {
      experimentId: 'exp-one',
      variantKey: 'variant-b',
      eventType: 'conversion',
      metricKey: 'purchase',
      timestamp: '2026-03-10T00:00:03.000Z',
      value: 1,
    },
    {
      experimentId: 'exp-one',
      variantKey: 'variant-b',
      eventType: 'conversion',
      metricKey: 'revenue',
      timestamp: '2026-03-10T00:00:03.000Z',
      value: 320,
    },
  ];

  const report = computeExperimentReport(experiment, events);

  assert.equal(report.variants.length, 2);
  assert.equal(report.totalExposures, 3);
  assert.equal(report.variants[1].revenue, 320);
  assert.ok(report.warnings.length >= 1);
});

test('computePortfolio summarizes multiple experiments', () => {
  const registry = [
    {
      id: 'alpha',
      name: 'Alpha',
      status: 'active',
      variants: [{ key: 'control', label: 'Control' }],
    },
    {
      id: 'beta',
      name: 'Beta',
      status: 'draft',
      variants: [{ key: 'control', label: 'Control' }],
    },
  ];

  const portfolio = computePortfolio(registry, []);

  assert.equal(portfolio.summary.active, 1);
  assert.equal(portfolio.summary.draft, 1);
  assert.equal(portfolio.reports.length, 2);
});

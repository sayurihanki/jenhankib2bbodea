/* eslint-disable import/extensions */
import { getAllocationEntries, hashString } from './experiments.mjs';

const Z_SCORE_95 = 1.959963984540054;

export const METRIC_LABELS = {
  exposure: 'Exposures',
  cta_click: 'CTA clicks',
  add_to_cart: 'Add to cart',
  checkout_start: 'Checkout starts',
  purchase: 'Purchases',
  revenue: 'Revenue',
  quote_request: 'Quote requests',
  purchase_order: 'Purchase orders',
  requisition: 'Requisition actions',
  company_action: 'Company account actions',
};

function normalCdf(value) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function betaPosterior(successes, exposures) {
  const alpha = 0.5 + successes;
  const beta = 0.5 + Math.max(exposures - successes, 0);
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (((alpha + beta) ** 2) * (alpha + beta + 1));
  const deviation = Math.sqrt(variance);

  return {
    mean,
    low: Math.max(0, mean - Z_SCORE_95 * deviation),
    high: Math.min(1, mean + Z_SCORE_95 * deviation),
    variance,
  };
}

function createMetricSummary(events, metricKey) {
  const values = events
    .filter((event) => event.metricKey === metricKey)
    .map((event) => Number(event.value || 0));

  return {
    count: values.length,
    total: values.reduce((sum, value) => sum + value, 0),
    values,
  };
}

function createVariantReport(experiment, variant, variantEvents, primaryMetric) {
  const exposures = variantEvents.filter((event) => event.eventType === 'exposure');
  const primaryMetricEvents = variantEvents.filter((event) => event.metricKey === primaryMetric);
  const revenueSummary = createMetricSummary(variantEvents, 'revenue');
  const ratePosterior = betaPosterior(primaryMetricEvents.length, exposures.length || 1);
  const revenuePerVisitor = exposures.length ? revenueSummary.total / exposures.length : 0;
  const averageOrderValue = primaryMetricEvents.length
    ? revenueSummary.total / primaryMetricEvents.length
    : 0;

  return {
    variantKey: variant.key,
    label: variant.label,
    sourceLink: variant.sourceLink,
    resolvedPath: variant.resolvedPath,
    exposures: exposures.length,
    conversions: primaryMetricEvents.length,
    conversionRate: ratePosterior.mean,
    credibleInterval: [ratePosterior.low, ratePosterior.high],
    revenue: revenueSummary.total,
    rpv: revenuePerVisitor,
    aov: averageOrderValue,
    metrics: Object.keys(METRIC_LABELS).reduce((accumulator, metricKey) => {
      const summary = createMetricSummary(variantEvents, metricKey);
      accumulator[metricKey] = {
        count: summary.count,
        total: summary.total,
      };
      return accumulator;
    }, {}),
  };
}

function calculateProbabilityToBeBest(variants) {
  if (variants.length < 2) {
    return variants.map((variant) => ({
      variantKey: variant.variantKey,
      probability: 1,
    }));
  }

  return variants.map((variant) => {
    const competitors = variants.filter((entry) => entry.variantKey !== variant.variantKey);
    const probability = competitors.reduce((accumulator, competitor) => {
      const meanDelta = variant.conversionRate - competitor.conversionRate;
      const variance = Math.max(
        ((variant.credibleInterval[1] - variant.credibleInterval[0]) / (2 * Z_SCORE_95)) ** 2
          + (
            (competitor.credibleInterval[1] - competitor.credibleInterval[0])
            / (2 * Z_SCORE_95)
          ) ** 2,
        0.0000001,
      );

      return accumulator * normalCdf(meanDelta / Math.sqrt(variance));
    }, 1);

    return {
      variantKey: variant.variantKey,
      probability,
    };
  });
}

function calculateSrm(experiment, variants) {
  const allocations = getAllocationEntries(experiment);
  const allocationMap = allocations.reduce((accumulator, entry) => {
    accumulator[entry.variantKey] = entry.weight;
    return accumulator;
  }, {});

  const totalWeight = allocations.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  const totalExposures = variants.reduce((sum, variant) => sum + variant.exposures, 0);

  if (totalExposures < 20) {
    return { chiSquare: 0, isWarning: false };
  }

  const chiSquare = variants.reduce((sum, variant) => {
    const expected = totalExposures * ((allocationMap[variant.variantKey] || 0) / totalWeight);
    if (!expected) return sum;
    return sum + (((variant.exposures - expected) ** 2) / expected);
  }, 0);

  return {
    chiSquare,
    isWarning: chiSquare > 6.63,
  };
}

function buildTimeSeries(events) {
  const buckets = new Map();

  events.forEach((event) => {
    const date = new Date(event.timestamp);
    const key = date.toISOString().slice(0, 10);
    const bucket = buckets.get(key) || { exposures: 0, conversions: 0, revenue: 0 };
    if (event.eventType === 'exposure') bucket.exposures += 1;
    if (event.metricKey === 'purchase') bucket.conversions += 1;
    if (event.metricKey === 'revenue') bucket.revenue += Number(event.value || 0);
    buckets.set(key, bucket);
  });

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, bucket]) => ({ date, ...bucket }));
}

function buildSegmentBreakdown(events, dimension = 'device') {
  const segments = new Map();

  events.forEach((event) => {
    const key = event[dimension] || 'unknown';
    const current = segments.get(key) || { exposures: 0, conversions: 0, revenue: 0 };
    if (event.eventType === 'exposure') current.exposures += 1;
    if (event.metricKey === 'purchase') current.conversions += 1;
    if (event.metricKey === 'revenue') current.revenue += Number(event.value || 0);
    segments.set(key, current);
  });

  return [...segments.entries()].map(([key, entry]) => ({
    key,
    exposures: entry.exposures,
    conversions: entry.conversions,
    revenue: entry.revenue,
    conversionRate: entry.exposures ? entry.conversions / entry.exposures : 0,
  }));
}

function buildWarnings(experiment, variants, primaryMetric) {
  const totalExposures = variants.reduce((sum, variant) => sum + variant.exposures, 0);
  const srm = calculateSrm(experiment, variants);
  const control = variants.find((variant) => variant.variantKey === 'control') || variants[0];
  const winner = [...variants].sort((left, right) => right.conversionRate - left.conversionRate)[0];
  const warnings = [];

  if (totalExposures < 50) {
    warnings.push({
      type: 'needs-traffic',
      label: 'Needs traffic',
      description: 'The experiment has not seen enough exposures to produce stable readouts.',
    });
  }

  if (srm.isWarning) {
    warnings.push({
      type: 'srm',
      label: 'Sample ratio mismatch',
      description: 'Observed exposures differ materially from the planned allocation.',
    });
  }

  if (winner && control && winner.variantKey !== control.variantKey) {
    const lift = control.conversionRate
      ? (winner.conversionRate - control.conversionRate) / control.conversionRate
      : winner.conversionRate;

    if (lift > 0.15) {
      warnings.push({
        type: 'likely-winner',
        label: 'Likely winner',
        description: `${winner.label} is trending ahead on ${primaryMetric}.`,
      });
    }
  }

  return warnings;
}

export function computeExperimentReport(experiment, events = [], seed = null) {
  const primaryMetric = experiment.primaryMetric || 'purchase';
  const variants = (experiment.variants || []).map((variant) => createVariantReport(
    experiment,
    variant,
    events.filter((event) => event.variantKey === variant.key),
    primaryMetric,
  ));

  const probabilities = calculateProbabilityToBeBest(variants);
  const probabilityMap = probabilities.reduce((accumulator, entry) => {
    accumulator[entry.variantKey] = entry.probability;
    return accumulator;
  }, {});

  const totalExposures = variants.reduce((sum, variant) => sum + variant.exposures, 0);
  const totalRevenue = variants.reduce((sum, variant) => sum + variant.revenue, 0);
  const timeSeries = buildTimeSeries(events);
  const segmentBreakdowns = ['device', 'authState', 'referrer', 'pathname', 'customerGroupHash']
    .reduce((accumulator, dimension) => {
      accumulator[dimension] = buildSegmentBreakdown(events, dimension);
      return accumulator;
    }, {});

  const enrichedVariants = variants.map((variant) => ({
    ...variant,
    probabilityToBeBest: probabilityMap[variant.variantKey] || 0,
    expectedLoss: Math.max(
      0,
      ((Math.max(...variants.map((entry) => entry.conversionRate)) - variant.conversionRate) || 0)
        * (variant.exposures || 1),
    ),
  }));

  const report = {
    experimentId: experiment.id,
    name: experiment.name,
    status: experiment.status,
    primaryMetric,
    variants: enrichedVariants,
    totalExposures,
    totalRevenue,
    timeSeries,
    segmentBreakdowns,
    warnings: buildWarnings(experiment, enrichedVariants, primaryMetric),
  };

  if (!seed) {
    return report;
  }

  return {
    ...seed,
    ...report,
    warnings: [...(seed.warnings || []), ...report.warnings],
    timeSeries: (seed.timeSeries?.length ? seed.timeSeries : report.timeSeries),
    segmentBreakdowns: Object.keys(report.segmentBreakdowns).reduce((accumulator, key) => {
      accumulator[key] = report.segmentBreakdowns[key]?.length
        ? report.segmentBreakdowns[key]
        : seed.segmentBreakdowns?.[key] || [];
      return accumulator;
    }, {}),
    variants: report.variants.map((variant) => {
      const seededVariant = (seed.variants || [])
        .find((entry) => entry.variantKey === variant.variantKey) || {};
      return {
        ...seededVariant,
        ...variant,
      };
    }),
  };
}

export function computePortfolio(registry = [], events = [], seeds = {}) {
  const reports = registry.map((experiment) => computeExperimentReport(
    experiment,
    events.filter((event) => event.experimentId === experiment.id),
    seeds[experiment.id] || null,
  ));

  const summary = reports.reduce((accumulator, report) => {
    accumulator.active += report.status === 'active' ? 1 : 0;
    accumulator.draft += report.status === 'draft' ? 1 : 0;
    accumulator.paused += report.status === 'paused' ? 1 : 0;
    accumulator.archived += report.status === 'archived' ? 1 : 0;
    accumulator.exposures += report.totalExposures || 0;
    accumulator.revenue += report.totalRevenue || 0;
    accumulator.guardrails += report.warnings.filter((warning) => warning.type === 'srm').length;
    return accumulator;
  }, {
    active: 0,
    draft: 0,
    paused: 0,
    archived: 0,
    exposures: 0,
    revenue: 0,
    guardrails: 0,
  });

  return {
    summary,
    reports,
    reportMap: reports.reduce((accumulator, report) => {
      accumulator[report.experimentId] = report;
      return accumulator;
    }, {}),
  };
}

export function createBlankSeed(experiment) {
  const base = hashString(experiment.id);
  const exposures = 140 + (base % 240);
  const conversions = Math.max(4, Math.round(exposures * (0.02 + ((base % 9) / 100))));
  const revenue = conversions * (140 + (base % 120));
  const today = new Date();
  const timeSeries = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date: date.toISOString().slice(0, 10),
      exposures: Math.max(8, Math.round(exposures / 7) + ((index % 2 === 0) ? 6 : -4)),
      conversions: Math.max(1, Math.round(conversions / 7) + ((index % 2 === 0) ? 1 : 0)),
      revenue: Math.max(60, Math.round(revenue / 7) + (index * 8)),
    };
  });

  return {
    warnings: [],
    timeSeries,
    segmentBreakdowns: {
      device: [
        {
          key: 'desktop',
          exposures: Math.round(exposures * 0.58),
          conversions: Math.round(conversions * 0.6),
          revenue: Math.round(revenue * 0.62),
          conversionRate: 0.04,
        },
        {
          key: 'mobile',
          exposures: Math.round(exposures * 0.34),
          conversions: Math.round(conversions * 0.28),
          revenue: Math.round(revenue * 0.25),
          conversionRate: 0.03,
        },
        {
          key: 'tablet',
          exposures: Math.round(exposures * 0.08),
          conversions: Math.round(conversions * 0.12),
          revenue: Math.round(revenue * 0.13),
          conversionRate: 0.05,
        },
      ],
      authState: [
        {
          key: 'guest',
          exposures: Math.round(exposures * 0.7),
          conversions: Math.round(conversions * 0.63),
          revenue: Math.round(revenue * 0.55),
          conversionRate: 0.03,
        },
        {
          key: 'authenticated',
          exposures: Math.round(exposures * 0.3),
          conversions: Math.round(conversions * 0.37),
          revenue: Math.round(revenue * 0.45),
          conversionRate: 0.06,
        },
      ],
      referrer: [],
      pathname: [],
      customerGroupHash: [],
    },
    variants: (experiment.variants || []).map((variant, index) => ({
      variantKey: variant.key,
      exposures: Math.round(exposures / (experiment.variants.length || 1)),
      conversions: Math.max(1, Math.round(conversions / (experiment.variants.length || 1)) + index),
      revenue: Math.round(revenue / (experiment.variants.length || 1)),
    })),
  };
}

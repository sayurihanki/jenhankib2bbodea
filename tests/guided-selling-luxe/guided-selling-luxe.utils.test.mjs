import test from 'node:test';
import assert from 'node:assert/strict';

/* eslint-disable import/extensions */
import {
  BLOCK_NAME,
  buildAnalyticsDetail,
  buildProductSearchRequest,
  buildSessionPayload,
  collectCollectionTargets,
  getNextOptionIndex,
  normalizeBlockConfig,
  normalizeSchema,
  rankPersonas,
  resolveResultState,
  restoreSessionState,
} from '../../blocks/guided-selling-luxe/guided-selling-luxe.utils.mjs';
/* eslint-enable import/extensions */

const RAW_SCHEMA = {
  id: 'Bodea Rack Finder',
  version: '2026-04-13',
  compareHref: '/server-racks?sort=position_DESC',
  contactHref: '/contact',
  tieBreakerOrder: ['deployment-environment', 'rack-capacity', 'highest-priority'],
  personas: [
    {
      id: 'compact-edge',
      title: 'Compact Edge',
      route: '/network-enclosures?filter=sku:BD-NE-06U-1',
      collection: {
        route: '/network-enclosures?filter=sku:BD-NE-06U-1',
        search: {
          skus: ['BD-NE-06U-1', 'BD-NE-12U-GLASS-6U'],
        },
      },
    },
    {
      id: 'quiet-office-retail',
      title: 'Quiet Office Retail',
      route: '/server-racks?filter=sku:BD-SR-QUIET-12U',
      collection: {
        route: '/server-racks?filter=sku:BD-SR-QUIET-12U',
        search: {
          skus: ['BD-SR-QUIET-12U'],
        },
      },
    },
    {
      id: 'secure-growth',
      title: 'Secure Growth',
      route: '/network-enclosures?filter=sku:BD-NE-12U-GLASS-12U',
      collection: {
        route: '/network-enclosures?filter=sku:BD-NE-12U-GLASS-12U',
        search: {
          skus: ['BD-NE-12U-GLASS-12U', 'BD-NE-12U-GLASS-24U'],
        },
      },
    },
  ],
  questions: [
    {
      id: 'deployment-environment',
      title: 'Where will this rack live?',
      answers: [
        {
          id: 'branch-office',
          label: 'Branch office',
          weights: {
            'compact-edge': 4,
            'quiet-office-retail': 2,
            'secure-growth': 3,
          },
        },
        {
          id: 'retail-backroom',
          label: 'Retail backroom',
          weights: {
            'compact-edge': 1,
            'quiet-office-retail': 5,
            'secure-growth': 2,
          },
        },
      ],
    },
    {
      id: 'rack-capacity',
      title: 'How much capacity do you need?',
      answers: [
        {
          id: 'u-1-6',
          label: '1-6U',
          weights: {
            'compact-edge': 4,
            'quiet-office-retail': 1,
            'secure-growth': 1,
          },
        },
        {
          id: 'u-7-12',
          label: '7-12U',
          weights: {
            'compact-edge': 2,
            'quiet-office-retail': 3,
            'secure-growth': 4,
          },
        },
      ],
    },
    {
      id: 'highest-priority',
      title: 'What matters most?',
      answers: [
        {
          id: 'quiet-operation',
          label: 'Quiet operation',
          weights: {
            'compact-edge': 1,
            'quiet-office-retail': 5,
            'secure-growth': 1,
          },
        },
        {
          id: 'secure-access',
          label: 'Secure access',
          weights: {
            'compact-edge': 1,
            'quiet-office-retail': 1,
            'secure-growth': 5,
          },
        },
      ],
    },
  ],
  crossCategoryModules: [
    {
      id: 'server-racks',
      title: 'Server Racks',
      route: '/server-racks',
      search: {
        categoryPath: ['server-racks'],
      },
    },
    {
      id: 'power-cooling',
      title: 'Power and Cooling',
      route: '/power-cooling',
      search: {
        categoryPath: ['power-cooling'],
      },
    },
  ],
};

test('normalizeBlockConfig applies defaults and block theme guards', () => {
  const config = normalizeBlockConfig({
    'schema-url': '/data/guided-selling/bodea-rack-finder.json',
    theme: 'gold',
  }, {
    pathSlug: 'rack-finder',
  });

  assert.equal(config.schemaUrl, '/data/guided-selling/bodea-rack-finder.json');
  assert.equal(config.theme, 'gold');
  assert.equal(config.blockId, 'data-guided-selling-bodea-rack-finder-json');
  assert.equal(BLOCK_NAME, 'guided-selling-luxe');
});

test('normalizeSchema validates and normalizes personas, questions, and modules', () => {
  const { errors, schema } = normalizeSchema(RAW_SCHEMA);

  assert.deepEqual(errors, []);
  assert.equal(schema.personas.length, 3);
  assert.equal(schema.questions.length, 3);
  assert.deepEqual(schema.tieBreakerOrder, [
    'deployment-environment',
    'rack-capacity',
    'highest-priority',
  ]);
  assert.equal(schema.crossCategoryModules[0].search.categoryPath[0], 'server-racks');
});

test('rankPersonas uses tie-break order after total score ties', () => {
  const { schema } = normalizeSchema(RAW_SCHEMA);

  const ranking = rankPersonas(schema, {
    'deployment-environment': 'branch-office',
    'rack-capacity': 'u-7-12',
    'highest-priority': 'quiet-operation',
  });

  assert.deepEqual(
    ranking.map((entry) => `${entry.personaId}:${entry.total}`),
    [
      'quiet-office-retail:10',
      'secure-growth:8',
      'compact-edge:7',
    ],
  );

  const tieRanking = rankPersonas(schema, {
    'deployment-environment': 'branch-office',
    'rack-capacity': 'u-7-12',
  });

  assert.deepEqual(
    tieRanking.map((entry) => entry.personaId),
    ['secure-growth', 'compact-edge', 'quiet-office-retail'],
  );
});

test('resolveResultState returns winner, alternates, and selections', () => {
  const { schema } = normalizeSchema(RAW_SCHEMA);
  const result = resolveResultState(schema, {
    'deployment-environment': 'retail-backroom',
    'rack-capacity': 'u-7-12',
    'highest-priority': 'quiet-operation',
  });

  assert.equal(result.winner.id, 'quiet-office-retail');
  assert.equal(result.alternates.length, 2);
  assert.equal(result.selections.length, 3);
});

test('buildSessionPayload and restoreSessionState preserve valid answers only', () => {
  const { schema } = normalizeSchema(RAW_SCHEMA);
  const payload = buildSessionPayload(schema, {
    started: true,
    completed: true,
    currentStepIndex: 99,
    answersByQuestion: {
      'deployment-environment': 'branch-office',
      'rack-capacity': 'u-7-12',
      'highest-priority': 'secure-access',
      ghost: 'nope',
    },
    startedAt: 123,
  });

  const restored = restoreSessionState(schema, payload);

  assert.equal(restored.started, true);
  assert.equal(restored.completed, true);
  assert.deepEqual(restored.answersByQuestion, {
    'deployment-environment': 'branch-office',
    'rack-capacity': 'u-7-12',
    'highest-priority': 'secure-access',
  });
});

test('buildProductSearchRequest shapes search filters without pathname leakage', () => {
  const request = buildProductSearchRequest({
    limit: 4,
    sort: 'position_DESC,name_ASC',
    search: {
      categoryPath: ['network-enclosures'],
      skus: ['BD-NE-12U-GLASS-12U'],
      filters: [
        {
          attribute: 'price',
          range: {
            from: 500,
            to: 5000,
          },
        },
      ],
    },
  });

  assert.deepEqual(request.filter, [
    {
      attribute: 'categoryPath',
      in: ['network-enclosures'],
    },
    {
      attribute: 'sku',
      in: ['BD-NE-12U-GLASS-12U'],
    },
    {
      attribute: 'price',
      range: {
        from: 500,
        to: 5000,
      },
    },
    {
      attribute: 'visibility',
      in: ['Search', 'Catalog, Search'],
    },
  ]);
  assert.deepEqual(request.sort, [
    {
      attribute: 'position',
      direction: 'DESC',
    },
    {
      attribute: 'name',
      direction: 'ASC',
    },
  ]);
});

test('collectCollectionTargets and buildAnalyticsDetail include ranked routes', () => {
  const { schema } = normalizeSchema(RAW_SCHEMA);
  const result = resolveResultState(schema, {
    'deployment-environment': 'retail-backroom',
    'rack-capacity': 'u-7-12',
    'highest-priority': 'quiet-operation',
  });

  assert.deepEqual(collectCollectionTargets(schema, result), [
    '/server-racks?filter=sku:BD-SR-QUIET-12U',
    '/network-enclosures?filter=sku:BD-NE-12U-GLASS-12U',
    '/network-enclosures?filter=sku:BD-NE-06U-1',
    '/server-racks',
    '/power-cooling',
    '/server-racks?sort=position_DESC',
  ]);

  const detail = buildAnalyticsDetail(schema, result, {
    event: 'quiz_complete',
  });

  assert.equal(detail.persona_id, 'quiet-office-retail');
  assert.equal(detail.event, 'quiz_complete');
  assert.equal(detail.persona_rankings[0], 'quiet-office-retail:13');
});

test('getNextOptionIndex supports arrow and boundary navigation', () => {
  assert.equal(getNextOptionIndex(1, 'ArrowRight', 4), 2);
  assert.equal(getNextOptionIndex(1, 'ArrowLeft', 4), 0);
  assert.equal(getNextOptionIndex(2, 'End', 4), 3);
  assert.equal(getNextOptionIndex(2, 'Home', 4), 0);
});

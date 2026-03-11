import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBaseCartPayload,
  createInitialState,
  getAwardSelectionState,
  getConfigurationValidation,
  mapSelectionsToOptionsUIDs,
  normalizeDataset,
  resolveCommerceOptionMappings,
  resolveEnteredOptionUIDsByLabel,
  serializeAwardManifest,
} from '../../blocks/medal-rack-configurator/medal-rack-configurator.lib.js';

function createProductFixture() {
  return {
    sku: 'medalrackconfigurator',
    variantSku: 'medalrackconfigurator-medium',
    options: [
      {
        label: 'Rack Size',
        items: [
          { id: 'uid-size-standard', label: 'Standard' },
          { id: 'uid-size-medium', label: 'Medium' },
          { id: 'uid-size-large', label: 'Large' },
          { id: 'uid-size-xl', label: 'Extra Large' },
        ],
      },
      {
        label: 'Wood Finish',
        items: [
          { id: 'uid-wood-walnut', label: 'Walnut' },
          { id: 'uid-wood-mahogany', label: 'Mahogany' },
          { id: 'uid-wood-ebony', label: 'Ebony' },
          { id: 'uid-wood-cherry', label: 'Cherry' },
          { id: 'uid-wood-maple', label: 'Maple' },
        ],
      },
      {
        label: 'Hardware Finish',
        items: [
          { id: 'uid-hardware-gold', label: 'Gold' },
          { id: 'uid-hardware-silver', label: 'Silver' },
          { id: 'uid-hardware-brass', label: 'Brass' },
          { id: 'uid-hardware-pewter', label: 'Pewter' },
        ],
      },
      {
        label: 'Branch of Service',
        items: [
          { id: 'uid-branch-usmc', label: 'USMC' },
          { id: 'uid-branch-army', label: 'Army' },
          { id: 'uid-branch-navy', label: 'Navy' },
          { id: 'uid-branch-usaf', label: 'USAF' },
          { id: 'uid-branch-uscg', label: 'USCG' },
          { id: 'uid-branch-ussf', label: 'USSF' },
        ],
      },
    ],
    inputOptions: [
      {
        id: 'uid-inscription',
        title: 'Inscription',
        label: 'Inscription',
        required: false,
        type: 'field',
        range: { to: 48 },
      },
      {
        id: 'uid-award-manifest',
        title: 'Award Manifest',
        label: 'Award Manifest',
        required: true,
        type: 'area',
        range: { to: 4096 },
      },
    ],
  };
}

test('normalizeDataset fills Commerce defaults and authored maxAwards', () => {
  const dataset = normalizeDataset({
    sizes: [
      {
        id: 'travel',
        label: 'Travel',
        dimensions: '7" x 9"',
        cost: '15',
        maxAwards: '6',
      },
    ],
    defaults: {
      size: 'does-not-exist',
      inscription: '  <b>Always Faithful</b>  ',
    },
  });

  assert.equal(dataset.commerce.baseSku, 'medalrackconfigurator');
  assert.equal(dataset.commerce.optionLabels.awardManifest, 'Award Manifest');
  assert.equal(dataset.sizes[0].id, 'travel');
  assert.equal(dataset.sizes[0].maxAwards, 6);
  assert.equal(dataset.defaults.size, 'travel');
  assert.equal(dataset.defaults.inscription, 'Always Faithful');
});

test('mapSelectionsToOptionsUIDs resolves dataset selections against Commerce labels', () => {
  const dataset = normalizeDataset();
  const product = createProductFixture();
  const mappings = resolveCommerceOptionMappings(dataset, product);
  const state = createInitialState(dataset);

  state.sizeId = 'md';
  state.woodId = 'mahogany';
  state.hardwareId = 'brass';
  state.branchId = 'navy';

  assert.deepEqual(
    mapSelectionsToOptionsUIDs(state, mappings.selectable),
    [
      'uid-size-medium',
      'uid-wood-mahogany',
      'uid-hardware-brass',
      'uid-branch-navy',
    ],
  );
});

test('resolveEnteredOptionUIDsByLabel finds inscription and award manifest UIDs', () => {
  const product = createProductFixture();

  assert.deepEqual(
    resolveEnteredOptionUIDsByLabel(product, {
      inscription: 'Inscription',
      awardManifest: 'Award Manifest',
    }),
    {
      inscription: 'uid-inscription',
      awardManifest: 'uid-award-manifest',
    },
  );
});

test('serializeAwardManifest sorts selected awards by precedence', () => {
  const dataset = normalizeDataset();
  const state = createInitialState(dataset);

  state.branchId = 'usmc';
  state.awardQuantities = {
    'silver-star-usmc': 2,
    'navy-cross-usmc': 1,
    'purple-heart-usmc': 3,
  };

  assert.equal(
    serializeAwardManifest(dataset, state),
    [
      '2|navy-cross-usmc|Navy Cross|qty:1',
      '3|silver-star-usmc|Silver Star|qty:2',
      '5|purple-heart-usmc|Purple Heart|qty:3',
    ].join('\n'),
  );
});

test('getConfigurationValidation rejects award counts beyond size maxAwards', () => {
  const dataset = normalizeDataset();
  const state = createInitialState(dataset);

  state.sizeId = 'sm';
  state.branchId = 'army';
  state.awardQuantities = {
    'medal-of-honor-army': 2,
    'distinguished-service-cross-army': 2,
    'silver-star-army': 2,
    'bronze-star-army': 2,
    'purple-heart-army': 1,
  };

  const awardState = getAwardSelectionState(dataset, state);
  const validation = getConfigurationValidation(dataset, state);

  assert.equal(awardState.maxAwards, 8);
  assert.equal(awardState.total, 9);
  assert.equal(awardState.overLimit, true);
  assert.equal(validation.valid, false);
});

test('buildBaseCartPayload returns the exact base rack cart payload', () => {
  const dataset = normalizeDataset();
  const product = createProductFixture();
  const mappings = resolveCommerceOptionMappings(dataset, product);
  const state = createInitialState(dataset);

  state.sizeId = 'md';
  state.woodId = 'mahogany';
  state.hardwareId = 'brass';
  state.branchId = 'navy';
  state.inscriptionValue = 'For Service and Honor';
  state.awardQuantities = {
    'navy-cross-navy': 1,
    'silver-star-navy': 2,
  };

  assert.deepEqual(
    buildBaseCartPayload(product, dataset, state, mappings),
    {
      sku: 'medalrackconfigurator-medium',
      quantity: 1,
      optionsUIDs: [
        'uid-size-medium',
        'uid-wood-mahogany',
        'uid-hardware-brass',
        'uid-branch-navy',
      ],
      enteredOptions: [
        {
          uid: 'uid-inscription',
          value: 'For Service and Honor',
        },
        {
          uid: 'uid-award-manifest',
          value: [
            '2|navy-cross-navy|Navy Cross|qty:1',
            '3|silver-star-navy|Silver Star|qty:2',
          ].join('\n'),
        },
      ],
    },
  );
});

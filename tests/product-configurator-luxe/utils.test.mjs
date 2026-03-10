import test from 'node:test';
import assert from 'node:assert/strict';

/* eslint-disable import/extensions */
import {
  buildCartItems,
  evaluateConditions,
  extractDisplayPrice,
  findOptionByLabel,
  normalizeProductOptions,
} from '../../blocks/product-configurator-luxe/product-configurator-luxe.utils.mjs';
/* eslint-enable import/extensions */

test('extractDisplayPrice prefers live PDP price shape', () => {
  const price = extractDisplayPrice({
    prices: {
      final: {
        amount: 1299,
        currency: 'USD',
      },
    },
  });

  assert.deepEqual(price, {
    amount: 1299,
    currency: 'USD',
  });
});

test('normalizeProductOptions handles raw Commerce option payloads', () => {
  const options = normalizeProductOptions({
    options: [
      {
        id: 'attr_u',
        title: 'U',
        required: false,
        multi: false,
        values: [
          {
            id: 'u-12',
            title: '12U',
            inStock: true,
          },
          {
            id: 'u-24',
            title: '24U',
            inStock: true,
          },
        ],
      },
    ],
  }, ['u-24']);

  assert.equal(options[0].label, 'U');
  assert.equal(options[0].items[1].selected, true);
});

test('findOptionByLabel is resilient to label formatting', () => {
  const option = findOptionByLabel([
    {
      id: 'attr_u',
      label: 'Rack Height',
      items: [],
    },
  ], 'rack height');

  assert.equal(option.id, 'attr_u');
});

test('evaluateConditions supports includes and excludes', () => {
  const matches = evaluateConditions([
    {
      controlId: 'deployment',
      includes: ['warehouse'],
    },
    {
      controlId: 'airflow',
      excludes: ['quiet-zone'],
    },
  ], {
    deployment: 'warehouse',
    airflow: 'balanced',
  });

  assert.equal(matches, true);
});

test('buildCartItems adds accessory lines that match the configured quantity', () => {
  const items = buildCartItems({
    sku: 'BD-NE-12U-GLASS',
    optionsUIDs: ['u-24'],
  }, [
    {
      id: 'patch-25',
      sku: 'BODEA Cat6 Patch Cable – Snagless Boot-25 ft',
      quantityStrategy: 'match-base-quantity',
    },
  ], 3);

  assert.deepEqual(items, [
    {
      sku: 'BD-NE-12U-GLASS',
      quantity: 3,
      optionsUIDs: ['u-24'],
    },
    {
      sku: 'BODEA Cat6 Patch Cable – Snagless Boot-25 ft',
      quantity: 3,
      customFields: {
        configuratorAddon: true,
        configuratorSource: 'patch-25',
      },
    },
  ]);
});

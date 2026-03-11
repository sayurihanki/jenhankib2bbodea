import test from 'node:test';
import assert from 'node:assert/strict';

/* eslint-disable import/extensions */
import {
  normalizeDataset,
  resolveMappedValue,
  resolveTechnicalDetails,
  shouldRenderTechnicalDetails,
} from '../../blocks/product-technical-details/product-technical-details.utils.mjs';
/* eslint-enable import/extensions */

test('normalizeDataset preserves section order and opens the first section by default', () => {
  const dataset = normalizeDataset({
    detailsSections: [
      {
        title: 'Dimensions',
        rows: [{ label: 'Height', value: '2,000 mm' }],
      },
      {
        title: 'Power',
        rows: [{ label: 'Current', value: '16 A' }],
      },
    ],
  });

  assert.equal(dataset.detailsSections[0].title, 'Dimensions');
  assert.equal(dataset.detailsSections[0].open, true);
  assert.equal(dataset.detailsSections[1].title, 'Power');
  assert.equal(dataset.detailsSections[1].open, false);
});

test('resolveMappedValue prefers product attributes and falls back to authored values', () => {
  const product = {
    attributes: [
      {
        name: 'rack_height',
        value: '48',
      },
    ],
  };

  assert.equal(
    resolveMappedValue(product, {
      attribute: 'rack_height',
      fallbackValue: '42',
    }),
    '48',
  );

  assert.equal(
    resolveMappedValue(product, {
      attribute: 'missing_value',
      value: 'authored',
    }),
    'authored',
  );
});

test('resolveTechnicalDetails maps cards and detail rows from product attributes', () => {
  const product = {
    attributes: [
      {
        name: 'rack_height',
        value: '42',
      },
      {
        name: 'operating_temperature',
        value: '0-45 deg C',
      },
    ],
  };

  const model = resolveTechnicalDetails(product, {
    specCards: [
      {
        label: 'Rack Height',
        attribute: 'rack_height',
        fallbackValue: '24',
        unit: 'U',
      },
    ],
    detailsSections: [
      {
        title: 'Cooling',
        rows: [
          {
            label: 'Operating Temperature',
            attribute: 'operating_temperature',
            value: '5-35 deg C',
          },
        ],
      },
    ],
  });

  assert.equal(model.specCards[0].displayValue, '42');
  assert.equal(model.specCards[0].displayUnit, 'U');
  assert.equal(model.detailsSections[0].rows[0].resolvedValue, '0-45 deg C');
});

test('shouldRenderTechnicalDetails gates immersive mode on the ready payload', () => {
  assert.equal(shouldRenderTechnicalDetails('default', null), true);
  assert.equal(
    shouldRenderTechnicalDetails('rack-immersive', {
      status: 'ready',
      presentation: 'rack-immersive',
    }),
    true,
  );
  assert.equal(
    shouldRenderTechnicalDetails('rack-immersive', {
      status: 'ready',
      presentation: 'default',
    }),
    false,
  );
});

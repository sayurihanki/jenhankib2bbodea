/* eslint-disable import/extensions */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  COMMERCE_ENTERED_OPTION_TITLES,
  COMMERCE_SELECTABLE_OPTION_TITLES,
  buildCommerceContractIndex,
  createUniformCommerceCartItem,
  createUniformCommerceContract,
  normalizeCommerceKey,
  validateCommerceProductContract,
} from '../../blocks/uniform-configurator/uniform-configurator.commerce.js';
import {
  buildLineItems,
  computeTotal,
  createInitialState,
  normalizeDataset,
} from '../../blocks/uniform-configurator/uniform-configurator.lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const datasetPath = resolve(
  __dirname,
  '../../data/configurators/marine-officer-dress-blues.json',
);

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function loadDataset() {
  const raw = JSON.parse(await readFile(datasetPath, 'utf8'));
  return normalizeDataset(raw);
}

function buildMockContractProduct(data) {
  const contract = createUniformCommerceContract(data);

  return {
    sku: 'USMC-OFFICER-BLUES-PACKAGE',
    options: contract.selectableOptions.map(({ title, values }) => ({
      id: `option-${slugify(title)}`,
      title,
      required: ![
        COMMERCE_SELECTABLE_OPTION_TITLES.shoeSize,
        COMMERCE_SELECTABLE_OPTION_TITLES.shoeWidth,
        COMMERCE_SELECTABLE_OPTION_TITLES.beltSize,
        COMMERCE_SELECTABLE_OPTION_TITLES.buckleStyle,
        COMMERCE_SELECTABLE_OPTION_TITLES.coverSize,
        COMMERCE_SELECTABLE_OPTION_TITLES.frameSize,
        COMMERCE_SELECTABLE_OPTION_TITLES.medalPackage,
        COMMERCE_SELECTABLE_OPTION_TITLES.additionalInsignia,
        COMMERCE_SELECTABLE_OPTION_TITLES.rushTailoring,
      ].includes(title),
      multi: title === COMMERCE_SELECTABLE_OPTION_TITLES.additionalInsignia,
      values: values.map((value) => ({
        id: `uid-${slugify(title)}-${slugify(value)}`,
        title: value,
      })),
    })),
    inputOptions: contract.enteredOptions.map((title) => ({
      id: `entered-${slugify(title)}`,
      title,
      required: false,
      type: title === COMMERCE_ENTERED_OPTION_TITLES.notes ? 'area' : 'field',
    })),
  };
}

test('buildCommerceContractIndex maps option titles and entered option titles to UIDs', async () => {
  const data = await loadDataset();
  const index = buildCommerceContractIndex(buildMockContractProduct(data));

  const rankOption = index.selectable.get(
    normalizeCommerceKey(COMMERCE_SELECTABLE_OPTION_TITLES.rank),
  );
  const captainValue = rankOption.values.get(normalizeCommerceKey('Captain'));
  const notesOption = index.entered.get(
    normalizeCommerceKey(COMMERCE_ENTERED_OPTION_TITLES.notes),
  );

  assert.equal(rankOption.title, 'Rank');
  assert.equal(captainValue.uid, 'uid-rank-captain');
  assert.equal(notesOption.id, 'entered-special-instructions');
});

test('validateCommerceProductContract catches missing option values from the Commerce contract', async () => {
  const data = await loadDataset();
  const product = buildMockContractProduct(data);

  product.options = product.options.filter((option) => option.title !== 'Cover Frame Size');

  const validation = validateCommerceProductContract(data, product);

  assert.equal(validation.valid, false);
  assert.equal(
    validation.missing.some((issue) => issue.title === 'Cover Frame Size'),
    true,
  );
});

test('createUniformCommerceCartItem maps entered options and selectable UIDs', async () => {
  const data = await loadDataset();
  const contractIndex = buildCommerceContractIndex(buildMockContractProduct(data));
  const state = createInitialState(data);

  Object.assign(state.selections, {
    coatLength: 'regular',
    coatSize: '40',
    trouserWaist: '34',
    trouserInseam: '32',
    shirtNeck: '16',
    shirtSleeve: '34',
    collarStrip: '16',
    rank: 'capt',
    shoeSize: '10',
    shoeWidth: 'W',
    notes: 'Ceremony date in six weeks.',
  });
  state.measurements.chest = '41.5';
  state.measurements.height = '70';

  const cartItem = createUniformCommerceCartItem({
    sku: 'USMC-OFFICER-BLUES-PACKAGE',
    data,
    state,
    contractIndex,
  });

  assert.deepEqual(cartItem.optionsUIDs, [
    'uid-coat-length-regular',
    'uid-coat-size-40',
    'uid-trouser-waist-34',
    'uid-trouser-inseam-32',
    'uid-shirt-neck-16',
    'uid-shirt-sleeve-34',
    'uid-collar-strip-16',
    'uid-rank-captain',
    'uid-oxford-dress-shoes-size-10',
    'uid-oxford-dress-shoes-width-wide-w',
  ]);
  assert.deepEqual(cartItem.enteredOptions, [
    {
      uid: 'entered-measurement-chest',
      value: '41.5',
    },
    {
      uid: 'entered-measurement-height',
      value: '70',
    },
    {
      uid: 'entered-special-instructions',
      value: 'Ceremony date in six weeks.',
    },
  ]);
});

test('dependency omission rules exclude child Commerce options when parent selections are absent', async () => {
  const data = await loadDataset();
  const contractIndex = buildCommerceContractIndex(buildMockContractProduct(data));
  const state = createInitialState(data);

  Object.assign(state.selections, {
    coatLength: 'regular',
    coatSize: '40',
    trouserWaist: '34',
    trouserInseam: '32',
    shirtNeck: '16',
    shirtSleeve: '34',
    collarStrip: '16',
    rank: 'capt',
    shoeWidth: 'W',
    buckleStyle: 'sword',
    frameSize: 'XL',
  });

  const cartItem = createUniformCommerceCartItem({
    sku: 'USMC-OFFICER-BLUES-PACKAGE',
    data,
    state,
    contractIndex,
  });
  const lineItems = buildLineItems(data, state);
  const shoeWidthUid = contractIndex.selectable
    .get(normalizeCommerceKey(COMMERCE_SELECTABLE_OPTION_TITLES.shoeWidth))
    .values
    .get(normalizeCommerceKey('Wide (W)'))
    .uid;
  const buckleStyleUid = contractIndex.selectable
    .get(normalizeCommerceKey(COMMERCE_SELECTABLE_OPTION_TITLES.buckleStyle))
    .values
    .get(normalizeCommerceKey('Sword'))
    .uid;
  const frameSizeUid = contractIndex.selectable
    .get(normalizeCommerceKey(COMMERCE_SELECTABLE_OPTION_TITLES.frameSize))
    .values
    .get(normalizeCommerceKey('X-Large (7⅛–7¼)'))
    .uid;

  assert.equal(cartItem.optionsUIDs.includes(shoeWidthUid), false);
  assert.equal(cartItem.optionsUIDs.includes(buckleStyleUid), false);
  assert.equal(cartItem.optionsUIDs.includes(frameSizeUid), false);
  assert.equal(lineItems.some((item) => item.id === 'frame'), false);
});

test('price parity holds for base package only and a mixed package scenario', async () => {
  const data = await loadDataset();
  const baseState = createInitialState(data);

  Object.assign(baseState.selections, {
    coatLength: 'regular',
    coatSize: '40',
    trouserWaist: '34',
    trouserInseam: '32',
    shirtNeck: '16',
    shirtSleeve: '34',
    collarStrip: '16',
  });

  const mixedState = createInitialState(data);
  Object.assign(mixedState.selections, {
    coatLength: 'regular',
    coatSize: '40',
    trouserWaist: '34',
    trouserInseam: '32',
    shirtNeck: '16',
    shirtSleeve: '34',
    collarStrip: '16',
    shoeSize: '10',
    shoeWidth: 'W',
    beltSize: '36',
    buckleStyle: 'sword',
    coverSize: '7¼',
    frameSize: 'XL',
    rank: 'capt',
    medalPackage: 'basic',
    rushTailoring: true,
  });
  mixedState.selections.extras['marksmanship-badge'] = true;
  mixedState.selections.extras['naval-aviator-wings'] = true;

  assert.equal(computeTotal(buildLineItems(data, baseState)), 678);
  assert.equal(computeTotal(buildLineItems(data, mixedState)), 1126);
});

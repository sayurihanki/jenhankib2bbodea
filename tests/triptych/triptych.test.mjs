/* eslint-env node */
/* global globalThis */
/* eslint-disable max-classes-per-file, class-methods-use-this, no-use-before-define */
import test from 'node:test';
import assert from 'node:assert/strict';

class FakeEventTarget {
  constructor() {
    this._listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this._listeners.get(type) || [];
    listeners.push(listener);
    this._listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this._listeners.get(type) || [];
    this._listeners.set(type, listeners.filter((entry) => entry !== listener));
  }

  dispatchEvent(event) {
    const evt = event;
    evt.target ??= this;
    (this._listeners.get(evt.type) || []).forEach((listener) => listener(evt));
  }
}

class FakeTextNode {
  constructor(text) {
    this.textContent = text;
    this.parentNode = null;
  }
}

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  setProperty(name, value) {
    this.values.set(name, value);
    this[name] = value;
  }
}

class FakeClassList {
  constructor(element) {
    this.element = element;
  }

  add(...tokens) {
    const classes = new Set(this.element.className.split(/\s+/).filter(Boolean));
    tokens.forEach((token) => classes.add(token));
    this.element.className = [...classes].join(' ');
  }

  remove(...tokens) {
    const classes = new Set(this.element.className.split(/\s+/).filter(Boolean));
    tokens.forEach((token) => classes.delete(token));
    this.element.className = [...classes].join(' ');
  }

  contains(token) {
    return this.element.className.split(/\s+/).filter(Boolean).includes(token);
  }
}

function matchesSimpleSelector(element, selector) {
  const normalized = selector.trim();

  if (!normalized) return false;
  if (normalized.startsWith('.')) {
    return element.classList.contains(normalized.slice(1));
  }

  if (/^[a-z]+\[[a-z-]+\]$/i.test(normalized)) {
    const [tagName, attrPart] = normalized.split('[');
    const attr = attrPart.replace(']', '');
    return element.tagName === tagName.toUpperCase() && element.getAttribute(attr) !== null;
  }

  return element.tagName === normalized.toUpperCase();
}

function matchesSelectorChain(element, selector) {
  const parts = selector.split(/\s+/).filter(Boolean);

  const matchFrom = (node, index) => {
    if (!(node instanceof FakeElement)) return false;
    if (!matchesSimpleSelector(node, parts[index])) return false;
    if (index === 0) return true;

    let ancestor = node.parentNode;
    while (ancestor) {
      if (matchFrom(ancestor, index - 1)) return true;
      ancestor = ancestor.parentNode;
    }

    return false;
  };

  return matchFrom(element, parts.length - 1);
}

class FakeElement extends FakeEventTarget {
  constructor(tagName, ownerDocument) {
    super();
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.attributes = new Map();
    this.style = new FakeStyle();
    this.classList = new FakeClassList(this);
    this._children = [];
    this._textContent = '';
    this._innerHTML = '';
    this.rectTop = 120;
  }

  get children() {
    return this._children.filter((child) => child instanceof FakeElement);
  }

  get childNodes() {
    return [...this._children];
  }

  get textContent() {
    if (this._children.length) {
      return this._children.map((child) => child.textContent || '').join('');
    }

    return this._textContent;
  }

  set textContent(value) {
    this._children = [];
    this._innerHTML = '';
    this._textContent = value;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value) {
    this._children = [];
    this._textContent = '';
    this._innerHTML = value;
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    this._children.push(node);
    node.parentNode = this;
    return node;
  }

  removeChild(node) {
    const index = this._children.indexOf(node);
    if (index >= 0) {
      this._children.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }

  remove() {
    this.parentNode?.removeChild(this);
  }

  replaceChildren(...nodes) {
    this._children = [];
    nodes.forEach((node) => this.appendChild(node));
  }

  setAttribute(name, value) {
    const stringValue = String(value);
    this.attributes.set(name, stringValue);
    if (name === 'class') this.className = stringValue;
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[key] = stringValue;
    }
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const selectors = selector.split(',').map((entry) => entry.trim()).filter(Boolean);
    const matches = [];

    const walk = (node) => {
      node.children.forEach((child) => {
        if (selectors.some((entry) => matchesSelectorChain(child, entry))) {
          matches.push(child);
        }
        walk(child);
      });
    };

    walk(this);
    return matches;
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (selector.startsWith('.') && current.classList.contains(selector.slice(1))) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  getBoundingClientRect() {
    return {
      top: this.rectTop,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
    };
  }
}

class FakeDocument extends FakeEventTarget {
  constructor() {
    super();
    this.head = new FakeElement('head', this);
    this.body = new FakeElement('body', this);
    this.defaultView = null;
    this.currentScript = null;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  createTextNode(text) {
    return new FakeTextNode(text);
  }

  querySelector(selector) {
    if (selector.startsWith('script[')) return null;
    return this.body.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }
}

class FakeIntersectionObserver {
  static instances = [];

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    this.unobserved = [];
    this.disconnected = false;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target) {
    this.observed.push(target);
  }

  unobserve(target) {
    this.unobserved.push(target);
  }

  disconnect() {
    this.disconnected = true;
  }
}

class FakeWindow extends FakeEventTarget {
  constructor({ innerWidth = 1280, reducedMotion = false } = {}) {
    super();
    this.document = null;
    this.innerWidth = innerWidth;
    this.reducedMotion = reducedMotion;
    this.hlx = {};
    this.location = {
      href: 'https://example.com/page?rum=off',
      search: '?rum=off',
      origin: 'https://example.com',
    };
    this.origin = 'https://example.com';
    this.performance = globalThis.performance;
    this.IntersectionObserver = FakeIntersectionObserver;
    this.addedEvents = [];
    this.removedEvents = [];
    this._rafId = 0;
  }

  addEventListener(type, listener, options) {
    this.addedEvents.push({ type, listener, options });
    super.addEventListener(type, listener);
  }

  removeEventListener(type, listener) {
    this.removedEvents.push({ type, listener });
    super.removeEventListener(type, listener);
  }

  matchMedia(query) {
    return {
      media: query,
      matches: this.reducedMotion,
      addEventListener() {},
      removeEventListener() {},
    };
  }

  requestAnimationFrame(callback) {
    this._rafId += 1;
    callback();
    return this._rafId;
  }

  cancelAnimationFrame() {}
}

function createRow(doc, content) {
  const row = doc.createElement('div');
  const appendCellContent = (cell, value) => {
    if (typeof value === 'string') {
      cell.append(doc.createTextNode(value));
    } else if (value?.type === 'image') {
      const image = doc.createElement('img');
      image.setAttribute('src', value.src);
      image.setAttribute('alt', value.alt || '');
      cell.append(image);
    }
  };

  if (content && typeof content === 'object' && 'key' in content) {
    const labelCell = doc.createElement('div');
    const valueCell = doc.createElement('div');
    appendCellContent(labelCell, content.key);
    appendCellContent(valueCell, content.value);
    row.append(labelCell, valueCell);
    return row;
  }

  const cell = doc.createElement('div');
  appendCellContent(cell, content);
  row.append(cell);
  return row;
}

function createFixture(rows, options = {}) {
  const doc = new FakeDocument();
  const win = new FakeWindow(options);
  doc.defaultView = win;
  win.document = doc;

  const section = doc.createElement('div');
  section.className = 'section';
  if (options.tone) section.dataset.triptychTone = options.tone;
  if (options.motion) section.dataset.triptychMotion = options.motion;

  const block = doc.createElement('div');
  block.className = 'triptych';
  block.rectTop = options.rectTop ?? 120;

  rows.forEach((row) => {
    block.append(createRow(doc, row));
  });

  section.append(block);
  doc.body.append(section);

  return {
    doc,
    win,
    section,
    block,
  };
}

function createKeyValueRowsWithMedia() {
  return [
    { key: 'line1', value: 'When' },
    { key: 'line2', value: 'nature' },
    { key: 'line3', value: 'perfects' },
    { key: 'line4', value: 'something,' },
    { key: 'line5', value: "we don't" },
    { key: 'line6', value: 'alter it, we' },
    { key: 'line7', value: 'reveal it.' },
    { key: 'media1', value: { type: 'image', src: '/icons/heart.svg', alt: 'Heart' } },
    { key: 'caption1', value: 'Caption 1' },
    { key: 'media2', value: { type: 'image', src: '/icons/search.svg', alt: 'Search' } },
    { key: 'caption2', value: 'Caption 2' },
    { key: 'media3', value: { type: 'image', src: '/favicon.ico', alt: 'Favicon' } },
    { key: 'caption3', value: 'Caption 3' },
  ];
}

function installGlobals(doc, win) {
  globalThis.window = win;
  globalThis.document = doc;
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };

  if (!globalThis.navigator) {
    globalThis.navigator = { sendBeacon: () => true };
  }
}

const importFixture = createFixture(new Array(13).fill(''));
installGlobals(importFixture.doc, importFixture.win);

const triptychModule = await import('../../blocks/triptych/triptych.js');
const {
  default: decorate,
  collectTriptychLines,
  readTriptychConfig,
} = triptychModule;

function withGlobals(fixture, callback) {
  installGlobals(fixture.doc, fixture.win);
  return callback();
}

test('decorate maps authored rows into the expected triptych structure', () => {
  FakeIntersectionObserver.instances = [];
  const fixture = createFixture([
    'When',
    'nature',
    'perfects',
    'something,',
    "we don't",
    'alter it, we',
    'reveal it.',
    { type: 'image', src: '/icons/heart.svg', alt: 'Heart' },
    'Purity is not created. It is preserved.',
    { type: 'image', src: '/icons/search.svg', alt: 'Search' },
    'Aupale exists not to reinvent, but to respect.',
    { type: 'image', src: '/favicon.ico', alt: 'Favicon' },
    'We let time, patience, and precision guide every step.',
  ]);

  withGlobals(fixture, () => decorate(fixture.block));

  assert.ok(fixture.block.querySelector('.triptych-scene'));
  assert.ok(fixture.block.querySelector('.triptych-oval'));
  assert.equal(fixture.block.querySelectorAll('.triptych-line-inner').length, 7);
  assert.equal(fixture.block.querySelectorAll('.triptych-media').length, 3);
  assert.equal(
    fixture.block.querySelector('.triptych-caption-inner').textContent,
    'Purity is not created. It is preserved.',
  );
});

test('decorate accepts 2-column key-value authored rows', () => {
  FakeIntersectionObserver.instances = [];
  const fixture = createFixture([
    { key: 'line1', value: 'When' },
    { key: 'line2', value: 'nature' },
    { key: 'line3', value: 'perfects' },
    { key: 'line4', value: 'something,' },
    { key: 'line5', value: "we don't" },
    { key: 'line6', value: 'alter it, we' },
    { key: 'line7', value: 'reveal it.' },
    { key: 'media1', value: { type: 'image', src: '/icons/heart.svg', alt: 'Heart' } },
    { key: 'caption1', value: 'Purity is not created. It is preserved.' },
    { key: 'media2', value: { type: 'image', src: '/icons/search.svg', alt: 'Search' } },
    { key: 'caption2', value: 'Aupale exists not to reinvent, but to respect.' },
    { key: 'media3', value: { type: 'image', src: '/favicon.ico', alt: 'Favicon' } },
    { key: 'caption3', value: 'We let time, patience, and precision guide every step.' },
  ]);

  withGlobals(fixture, () => decorate(fixture.block));

  assert.equal(fixture.block.querySelectorAll('.triptych-line-inner').length, 7);
  assert.equal(fixture.block.querySelectorAll('.triptych-media').length, 3);
  assert.equal(
    fixture.block.querySelector('.triptych-caption-inner').textContent,
    'Purity is not created. It is preserved.',
  );
});

test('blank lines are omitted from the rendered copy when some lines are provided', () => {
  FakeIntersectionObserver.instances = [];
  const fixture = createFixture([
    'When',
    '',
    'nature',
    '',
    '',
    '',
    '',
    { type: 'image', src: '/icons/heart.svg', alt: 'Heart' },
    'Caption 1',
    { type: 'image', src: '/icons/search.svg', alt: 'Search' },
    'Caption 2',
    { type: 'image', src: '/favicon.ico', alt: 'Favicon' },
    'Caption 3',
  ]);

  const lines = collectTriptychLines(fixture.block);
  withGlobals(fixture, () => decorate(fixture.block));

  assert.deepEqual(lines, ['When', 'nature']);
  assert.equal(fixture.block.querySelectorAll('.triptych-line-inner').length, 2);
});

test('section metadata normalizes tone and motion configuration', () => {
  const fixture = createFixture(new Array(13).fill(''), {
    tone: 'STONE',
    motion: 'off',
    innerWidth: 1440,
  });

  const config = readTriptychConfig(fixture.block, fixture.win);

  assert.equal(config.tone, 'stone');
  assert.equal(config.motion, 'off');
  assert.equal(config.motionEnabled, false);
  assert.equal(config.parallaxEnabled, false);
});

test('missing media rows render placeholders and do not break the layout', () => {
  FakeIntersectionObserver.instances = [];
  const fixture = createFixture([
    'When',
    'nature',
    'perfects',
    'something,',
    "we don't",
    'alter it, we',
    'reveal it.',
    'Replace with image 1',
    'Caption 1',
    { type: 'image', src: '/icons/search.svg', alt: 'Search' },
    'Caption 2',
    { type: 'image', src: '/favicon.ico', alt: 'Favicon' },
    'Caption 3',
  ]);

  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(message);

  try {
    withGlobals(fixture, () => decorate(fixture.block));
  } finally {
    console.warn = originalWarn;
  }

  assert.ok(fixture.block.querySelector('.triptych-media--1').classList.contains('is-placeholder'));
  assert.ok(fixture.block.querySelector('.triptych-media-placeholder'));
  assert.equal(warnings.length, 1);
});

test('motion-off and reduced-motion paths skip parallax and observer setup', () => {
  FakeIntersectionObserver.instances = [];
  const offFixture = createFixture(createKeyValueRowsWithMedia(), {
    motion: 'off',
    innerWidth: 1440,
  });

  withGlobals(offFixture, () => decorate(offFixture.block));

  assert.equal(offFixture.win.addedEvents.filter((entry) => entry.type === 'scroll').length, 0);
  assert.equal(FakeIntersectionObserver.instances.length, 0);
  assert.ok(offFixture.block.querySelector('.triptych-oval').classList.contains('is-visible'));

  FakeIntersectionObserver.instances = [];
  const reducedFixture = createFixture(createKeyValueRowsWithMedia(), {
    innerWidth: 1440,
    reducedMotion: true,
  });

  withGlobals(reducedFixture, () => decorate(reducedFixture.block));

  assert.equal(reducedFixture.win.addedEvents.filter((entry) => entry.type === 'scroll').length, 0);
  assert.equal(FakeIntersectionObserver.instances.length, 0);
  assert.equal(reducedFixture.block.dataset.motion, 'reduced');
});

test('redecorating the block cleans up prior observers and scroll listeners', () => {
  const fixture = createFixture([
    'When',
    'nature',
    'perfects',
    'something,',
    "we don't",
    'alter it, we',
    'reveal it.',
    { type: 'image', src: '/icons/heart.svg', alt: 'Heart' },
    'Caption 1',
    { type: 'image', src: '/icons/search.svg', alt: 'Search' },
    'Caption 2',
    { type: 'image', src: '/favicon.ico', alt: 'Favicon' },
    'Caption 3',
  ], {
    innerWidth: 1440,
  });

  FakeIntersectionObserver.instances = [];
  withGlobals(fixture, () => decorate(fixture.block));

  const firstObserver = FakeIntersectionObserver.instances[0];
  const firstScrollAdds = fixture.win.addedEvents.filter((entry) => entry.type === 'scroll').length;

  withGlobals(fixture, () => decorate(fixture.block));

  assert.equal(firstObserver.disconnected, true);
  assert.equal(firstScrollAdds, 1);
  assert.equal(fixture.win.removedEvents.filter((entry) => entry.type === 'scroll').length, 1);
  assert.equal(FakeIntersectionObserver.instances.length, 2);
});

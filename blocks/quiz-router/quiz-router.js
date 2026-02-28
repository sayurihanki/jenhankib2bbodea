/*
 * Quiz Router Block
 * Guided "find your perfect product" wizard that routes to PLP/PDP/fragment.
 */

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const NEXT_STEP = '#next';
const THEMES = new Set(['default', 'compact', 'card']);
const RESULT_MODES = new Set(['navigate', 'fragment']);
const SAFE_TEXT_TAGS = new Set([
  'p',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'span',
  'ul',
  'ol',
  'li',
  'br',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'small',
  'sup',
  'sub',
]);
const SAFE_MEDIA_TAGS = new Set(['picture', 'img']);

function sanitizeUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';

  if (raw.toLowerCase() === NEXT_STEP) return NEXT_STEP;
  if (raw.startsWith('//')) return '';
  if (raw.toLowerCase().startsWith('javascript:')) return '';

  if (['#', '/', './', '../', '?'].some((token) => raw.startsWith(token))) {
    return raw;
  }

  try {
    const parsed = new URL(raw, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    if (parsed.origin !== window.location.origin) return '';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '';
  }
}

function readLabelCell(cell) {
  const anchor = cell?.querySelector('a[href]');
  if (anchor) {
    const rawHref = (anchor.getAttribute('href') || '').trim();
    return {
      label: anchor.textContent.trim(),
      href: sanitizeUrl(rawHref),
      hasHref: !!rawHref,
      rawHref,
    };
  }

  const text = (cell?.textContent || '').trim();
  const pipeIdx = text.indexOf('|');
  if (pipeIdx >= 0) {
    const rawHref = text.slice(pipeIdx + 1).trim();
    return {
      label: text.slice(0, pipeIdx).trim(),
      href: sanitizeUrl(rawHref),
      hasHref: !!rawHref,
      rawHref,
    };
  }

  return {
    label: text,
    href: '',
    hasHref: false,
    rawHref: '',
  };
}

function readUrlCell(cell) {
  const anchor = cell?.querySelector('a[href]');
  if (anchor) {
    const rawValue = (anchor.getAttribute('href') || '').trim();
    return {
      href: sanitizeUrl(rawValue),
      hasValue: !!rawValue,
      rawValue,
    };
  }

  const text = (cell?.textContent || '').trim();
  if (!text) {
    return {
      href: '',
      hasValue: false,
      rawValue: '',
    };
  }

  const pipeIdx = text.indexOf('|');
  const rawValue = pipeIdx >= 0 ? text.slice(pipeIdx + 1).trim() : text;
  return {
    href: sanitizeUrl(rawValue),
    hasValue: !!rawValue,
    rawValue,
  };
}

function isFragmentPath(href) {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  return trimmed.startsWith('/') && (trimmed.startsWith('/fragments/') || trimmed.includes('/fragments/'));
}

function resolveOptionAction(href, hasDestinationInput) {
  if (href === NEXT_STEP) return 'next';
  if (!href && !hasDestinationInput) return 'next';
  if (!href) return 'disabled';
  if (isFragmentPath(href)) return 'fragment';
  return 'navigate';
}

function sanitizeCellContent(cell, options = {}) {
  const { preserveImages = false } = options;
  const fragment = document.createDocumentFragment();
  if (!cell) return fragment;

  const allowedTags = preserveImages
    ? new Set([...SAFE_TEXT_TAGS, ...SAFE_MEDIA_TAGS])
    : SAFE_TEXT_TAGS;

  const clone = cell.cloneNode(true);
  clone.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form,input,textarea,select,button').forEach((unsafe) => {
    unsafe.remove();
  });

  clone.querySelectorAll('a').forEach((anchor) => {
    const span = document.createElement('span');
    span.textContent = anchor.textContent.trim();
    anchor.replaceWith(span);
  });

  if (!preserveImages) {
    clone.querySelectorAll('picture,img,source,video,audio').forEach((media) => media.remove());
  }

  const allNodes = [...clone.querySelectorAll('*')];
  for (let i = allNodes.length - 1; i >= 0; i -= 1) {
    const el = allNodes[i];
    const tag = el.tagName.toLowerCase();

    if (!allowedTags.has(tag)) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
      }
      el.remove();
      continue;
    }

    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'style' || name === 'srcdoc' || name === 'id' || name === 'class') {
        el.removeAttribute(attr.name);
      }
    });

    if (tag === 'img') {
      const rawSrc = (el.getAttribute('src') || '').trim();
      const safeSrc = sanitizeUrl(rawSrc);
      const invalidImageSrc = !safeSrc || safeSrc === NEXT_STEP || safeSrc.startsWith('#') || safeSrc.startsWith('?');
      if (invalidImageSrc) {
        el.remove();
        continue;
      }

      el.setAttribute('src', safeSrc);
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (!['src', 'alt', 'loading', 'width', 'height'].includes(name)) {
          el.removeAttribute(attr.name);
        }
      });
    } else if (tag === 'picture') {
      [...el.attributes].forEach((attr) => {
        el.removeAttribute(attr.name);
      });
      el.querySelectorAll('source').forEach((source) => source.remove());
    } else {
      [...el.attributes].forEach((attr) => el.removeAttribute(attr.name));
    }
  }

  while (clone.firstChild) {
    fragment.append(clone.firstChild);
  }
  return fragment;
}

function parseTypedRows(rows) {
  const steps = [];
  let currentQuestion = null;

  rows.forEach((row, index) => {
    const cells = [...row.children];
    const type = (cells[0]?.textContent || '').trim().toLowerCase();
    const rowNum = index + 1;

    if (!type) {
      console.warn(`quiz-router: row ${rowNum} missing row type. Expected "question" or "option".`);
      return;
    }

    if (type === 'question') {
      const labelCell = cells[1];
      const questionText = (labelCell?.textContent || '').trim();
      if (!questionText) {
        console.warn(`quiz-router: row ${rowNum} question has no text.`);
        return;
      }
      currentQuestion = {
        rowNum,
        text: questionText,
        questionCell: labelCell?.cloneNode(true) || null,
        mediaCell: cells[2]?.cloneNode(true) || null,
        options: [],
      };
      steps.push(currentQuestion);
      return;
    }

    if (type === 'option') {
      if (!currentQuestion) {
        console.warn(`quiz-router: row ${rowNum} option has no preceding question.`);
        return;
      }
      const labelCell = cells[1];
      const urlCell = cells[2];
      const labelData = readLabelCell(labelCell);
      const urlData = readUrlCell(urlCell);
      const label = labelData.label || (labelCell?.textContent || '').trim();
      const href = labelData.href || urlData.href || '';
      const destinationInput = labelData.hasHref || urlData.hasValue;
      const action = resolveOptionAction(href, destinationInput);

      if (!label) {
        console.warn(`quiz-router: row ${rowNum} option has no label.`);
        return;
      }

      if (action === 'disabled') {
        const invalidTarget = labelData.rawHref || urlData.rawValue || '(empty)';
        console.warn(`quiz-router: row ${rowNum} option "${label}" has blocked destination "${invalidTarget}". Rendering disabled option.`);
      }

      currentQuestion.options.push({
        label,
        href,
        action,
        rowNum,
      });
      return;
    }

    console.warn(`quiz-router: row ${rowNum} has unsupported type "${type}".`);
  });

  return steps.filter((step) => {
    if (step.options.length > 0) return true;
    console.warn(`quiz-router: row ${step.rowNum} question "${step.text}" has no options and will be skipped.`);
    return false;
  });
}

function getConfig(block) {
  const section = block.closest('.section');
  const sectionData = section?.dataset || {};

  const get = (key, fallback) => {
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const sectionVal = sectionData[camelKey];
    if (sectionVal !== undefined && sectionVal !== '') return sectionVal;
    const pageVal = getMetadata(key);
    if (pageVal !== undefined && pageVal !== '') return pageVal;
    return fallback;
  };

  const progressRaw = get('quizrouter-progress', 'true');
  const progress = String(progressRaw).trim().toLowerCase() !== 'false';

  const themeRaw = get('quizrouter-theme', 'default');
  const theme = String(themeRaw).trim().toLowerCase();

  const resultModeRaw = get('quizrouter-result-mode', 'navigate');
  const resultMode = String(resultModeRaw).trim().toLowerCase();

  return {
    progress,
    theme: THEMES.has(theme) ? theme : 'default',
    resultMode: RESULT_MODES.has(resultMode) ? resultMode : 'navigate',
  };
}

function createOptionElement(option, isBusy, onSelect) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'quiz-router-option';
  el.textContent = option.label;
  el.setAttribute('aria-label', option.label);
  el.dataset.action = option.action;

  if (option.action === 'disabled') {
    el.disabled = true;
    el.classList.add('quiz-router-option--disabled');
    el.setAttribute('aria-disabled', 'true');
  }

  if (isBusy) {
    el.disabled = true;
    el.classList.add('is-loading');
  }

  el.addEventListener('click', () => {
    if (el.disabled || isBusy) return;
    onSelect(option);
  });

  return el;
}

function renderStep(container, steps, stepIndex, config, state, onStepChange, onNavigate) {
  const step = steps[stepIndex];
  const totalSteps = steps.length;
  container.replaceChildren();

  if (config.progress && totalSteps > 1) {
    const progressEl = document.createElement('div');
    progressEl.className = 'quiz-router-progress';
    progressEl.setAttribute('role', 'status');
    progressEl.setAttribute('aria-live', 'polite');
    progressEl.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
    container.append(progressEl);
  }

  const questionEl = document.createElement('div');
  questionEl.className = 'quiz-router-question';
  questionEl.append(sanitizeCellContent(step.questionCell));
  if (!questionEl.textContent.trim()) {
    questionEl.textContent = step.text;
  }
  container.append(questionEl);

  const mediaContent = sanitizeCellContent(step.mediaCell, { preserveImages: true });
  if (mediaContent.childNodes.length) {
    const mediaEl = document.createElement('div');
    mediaEl.className = 'quiz-router-media';
    mediaEl.append(mediaContent);
    container.append(mediaEl);
  }

  const optionsEl = document.createElement('div');
  optionsEl.className = 'quiz-router-options';

  step.options.forEach((option) => {
    const optionEl = createOptionElement(option, state.isBusy, async (opt) => {
      if (opt.action === 'next') {
        const nextIndex = stepIndex + 1;
        if (nextIndex < totalSteps) {
          onStepChange(nextIndex);
        } else {
          console.warn(`quiz-router: row ${opt.rowNum} uses "${NEXT_STEP}" on final step. No further question to display.`);
        }
        return;
      }

      if (opt.action === 'disabled') {
        return;
      }

      state.isBusy = true;
      onStepChange(stepIndex);

      const shouldLoadFragment = opt.action === 'fragment' && config.resultMode === 'fragment';
      const didLeaveView = await onNavigate(opt.href, shouldLoadFragment);
      if (!didLeaveView) {
        state.isBusy = false;
        onStepChange(stepIndex);
      }
    });
    optionsEl.append(optionEl);
  });

  container.append(optionsEl);
}

export default async function decorate(block) {
  const rows = [...block.children].filter((row) => row.tagName === 'DIV');
  const steps = parseTypedRows(rows);

  if (steps.length === 0) {
    block.innerHTML = '';
    const msg = document.createElement('p');
    msg.className = 'quiz-router-empty';
    msg.textContent = 'Configure quiz-router with question and option rows.';
    block.append(msg);
    return;
  }

  const config = getConfig(block);
  block.classList.add(`quiz-router--${config.theme}`);

  const wrapper = document.createElement('div');
  wrapper.className = 'quiz-router-wrapper';

  const content = document.createElement('div');
  content.className = 'quiz-router-content';
  const state = {
    currentStep: 0,
    isBusy: false,
  };

  const handleNavigate = async (href, isFragment) => {
    if (isFragment) {
      try {
        const fragment = await loadFragment(href);
        if (fragment) {
          const fragmentSection = fragment.querySelector(':scope .section');
          if (fragmentSection) {
            const section = block.closest('.section');
            if (section) {
              section.classList.add(...fragmentSection.classList);
            }
          }
          block.replaceWith(...fragment.childNodes);
          return true;
        }
      } catch (error) {
        console.warn(`quiz-router: fragment load failed for "${href}". Falling back to navigation.`, error);
      }

      console.warn(`quiz-router: fragment "${href}" unavailable. Falling back to navigation.`);
      window.location.href = href;
      return true;
    }

    window.location.href = href;
    return !href.startsWith('#');
  };

  const renderCurrentStep = (nextStep = state.currentStep) => {
    state.currentStep = nextStep;
    wrapper.classList.toggle('is-loading', state.isBusy);
    content.setAttribute('aria-busy', state.isBusy ? 'true' : 'false');
    renderStep(content, steps, state.currentStep, config, state, renderCurrentStep, handleNavigate);
  };

  renderCurrentStep(0);

  wrapper.append(content);
  block.replaceChildren(wrapper);
}

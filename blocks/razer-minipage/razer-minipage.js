import CONTENT from './razer-minipage-content.js';

const DEFAULT_PRODUCT_URL = CONTENT.product.url;
const FONT_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Titillium+Web:wght@300;400;600;700&display=swap';
const TRUTHY_VALUES = new Set(['1', 'on', 'true', 'yes']);
const FALSY_VALUES = new Set(['0', 'off', 'false', 'no']);
const SAFE_LENGTH = /^(?:0|(?:\d+(?:\.\d+)?)(?:px|em|rem|vh)|var\(--[\w-]+(?:,\s*[^)]+)?\)|calc\([^;{}]+\))$/;

let instanceCount = 0;

function escapeHTML(value = '') {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(value).replace(/[&<>"']/g, (character) => replacements[character]);
}

function formatMessage(pattern = '', values = {}) {
  return String(pattern).replace(/\{(\w+)\}/g, (match, key) => (
    Object.hasOwn(values, key) ? values[key] : match
  ));
}

export function normalizeKey(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function getCellValue(cell) {
  if (!cell) return '';
  const link = cell.querySelector('a[href]');
  return (link?.href || cell.textContent || '').trim();
}

export function sanitizeProductUrl(value = '') {
  const url = value.trim();
  if (/^(?:https?:\/\/|\/(?!\/)|\.{1,2}\/|#)/i.test(url)) return url;
  return DEFAULT_PRODUCT_URL;
}

export function readConfig(block) {
  const authored = new Map();
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    const key = normalizeKey(keyCell?.textContent || '');
    if (key) authored.set(key, getCellValue(valueCell));
  });

  const readBoolean = (key, fallback) => {
    const rawValue = authored.get(key);
    if (rawValue === undefined || rawValue === '') return fallback;
    const value = rawValue.toLowerCase();
    if (TRUTHY_VALUES.has(value)) return true;
    if (FALSY_VALUES.has(value)) return false;
    return fallback;
  };

  const authoredStickyOffset = authored.get('sticky-offset');
  const stickyOffset = authoredStickyOffset || 'var(--nav-height, 64px)';

  return {
    preset: authored.get('preset') || CONTENT.id,
    navigation: readBoolean('navigation', true),
    footer: readBoolean('footer', true),
    motion: readBoolean('motion', true),
    scrollProgress: readBoolean('scroll-progress', true),
    productUrl: sanitizeProductUrl(authored.get('product-url') || DEFAULT_PRODUCT_URL),
    automaticStickyOffset: !authoredStickyOffset,
    stickyOffset: SAFE_LENGTH.test(stickyOffset)
      ? stickyOffset
      : 'var(--nav-height, 64px)',
  };
}

function loadFonts() {
  if (document.head.querySelector('[data-razer-minipage-fonts]')) return;

  [
    ['preconnect', 'https://fonts.googleapis.com'],
    ['preconnect', 'https://fonts.gstatic.com'],
    ['preconnect', 'https://assets2.razerzone.com'],
    ['preconnect', 'https://assets3.razerzone.com'],
    ['preconnect', 'https://medias-p1.phoenix.razer.com'],
  ].forEach(([rel, href]) => {
    if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (href === 'https://fonts.gstatic.com') link.crossOrigin = '';
    link.dataset.razerMinipageFonts = '';
    document.head.append(link);
  });

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = FONT_STYLESHEET;
  stylesheet.dataset.razerMinipageFonts = '';
  document.head.append(stylesheet);
}

function renderImage(image, options = {}) {
  const {
    className = '',
    eager = false,
    decorative = false,
    id = '',
  } = options;
  const classAttribute = className ? ` class="${escapeHTML(className)}"` : '';
  const idAttribute = id ? ` id="${escapeHTML(id)}"` : '';
  const alt = decorative ? '' : image.alt;
  const priority = eager ? ' fetchpriority="high"' : '';
  const loading = eager ? 'eager' : 'lazy';

  return `<img${idAttribute}${classAttribute}
    src="${escapeHTML(image.src)}"
    alt="${escapeHTML(alt)}"
    width="${image.width}"
    height="${image.height}"
    loading="${loading}"
    decoding="async"${priority}>`;
}

function renderGallery(product, ids, ui) {
  const slides = product.gallery.map((image, index) => {
    const hidden = index === 0 ? '' : ' hidden';
    return `<figure
      class="rm-gallery-slide"
      id="${ids.slide}-${index + 1}"
      role="tabpanel"
      aria-labelledby="${ids.thumbnail}-${index + 1}"
      data-gallery-slide="${index}"${hidden}>
      ${renderImage(image, { eager: index === 0 })}
    </figure>`;
  }).join('');

  const thumbnails = product.gallery.map((image, index) => `
    <button
      class="rm-gallery-thumbnail"
      id="${ids.thumbnail}-${index + 1}"
      type="button"
      role="tab"
      aria-controls="${ids.slide}-${index + 1}"
      aria-selected="${index === 0}"
      aria-label="${escapeHTML(formatMessage(ui.showImagePattern, { alt: image.alt }))}"
      tabindex="${index === 0 ? 0 : -1}"
      data-gallery-thumbnail="${index}">
      ${renderImage(image, {
    className: 'rm-gallery-thumbnail-image',
    eager: true,
    decorative: true,
  })}
    </button>`).join('');

  return `
    <div class="rm-gallery">
      <div class="rm-gallery-stage" aria-live="polite" aria-atomic="true">
        ${slides}
        <button
          class="rm-gallery-nav rm-gallery-nav--previous"
          type="button"
          aria-label="${escapeHTML(ui.previousLabel)}"
          data-gallery-previous>${escapeHTML(ui.previousSymbol)}</button>
        <button
          class="rm-gallery-nav rm-gallery-nav--next"
          type="button"
          aria-label="${escapeHTML(ui.nextLabel)}"
          data-gallery-next>${escapeHTML(ui.nextSymbol)}</button>
        <span
          class="rm-gallery-counter"
          aria-hidden="true"
          data-counter-pattern="${escapeHTML(ui.counterPattern)}"
          data-gallery-counter>
          ${escapeHTML(formatMessage(ui.counterPattern, {
    current: 1,
    total: product.gallery.length,
  }))}
        </span>
      </div>
      <div
        class="rm-gallery-thumbnails"
        role="tablist"
        aria-label="${escapeHTML(ui.imagesLabel)}">
        ${thumbnails}
      </div>
    </div>`;
}

function renderOptionGroup(group, groupIndex, instanceId, selectionPattern) {
  const selectedIndex = Math.max(0, group.options.findIndex((option) => option.selected));
  const options = group.options.map((option, optionIndex) => {
    const selected = optionIndex === selectedIndex;
    return `<li class="rm-option-item${selected ? ' is-selected' : ''}">
      <button
        class="rm-option-button"
        type="button"
        role="radio"
        aria-checked="${selected}"
        tabindex="${selected ? 0 : -1}"
        data-option-index="${optionIndex}">
        <span>${escapeHTML(option.label)}</span>
        ${option.price ? `<small>${escapeHTML(option.price)}</small>` : ''}
      </button>
    </li>`;
  }).join('');

  return `<fieldset
    class="rm-option-group"
    data-option-group="${groupIndex}"
    data-selection-pattern="${escapeHTML(selectionPattern)}">
    <legend>${escapeHTML(group.label)}</legend>
    <ul
      class="rm-options"
      id="${instanceId}-option-group-${groupIndex + 1}"
      role="radiogroup"
      aria-label="${escapeHTML(group.label)}">
      ${options}
    </ul>
    <span class="rm-visually-hidden" aria-live="polite" data-option-status></span>
  </fieldset>`;
}

function renderBuyBox(product, instanceId, ui) {
  const options = product.optionGroups
    .map((group, index) => (
      renderOptionGroup(group, index, instanceId, ui.optionSelectionPattern)
    ))
    .join('');
  const delivery = product.delivery.map((item) => `
    <p><span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong></p>
  `).join('');
  const trust = product.trust.map((item) => `<li>${escapeHTML(item)}</li>`).join('');

  return `<div class="rm-buybox">
    <p class="rm-sku">${escapeHTML(product.sku)} · ${escapeHTML(product.color)}</p>
    <h1
      class="rm-product-title"
      id="${instanceId}-overview-title">${escapeHTML(product.title)}</h1>
    <p class="rm-product-subtitle">${escapeHTML(product.subtitle)}</p>
    <p class="rm-product-price">
      <strong>${escapeHTML(product.price)}</strong>
      <del>${escapeHTML(product.originalPrice)}</del>
      <mark>${escapeHTML(product.discount)}</mark>
    </p>
    ${options}
    <div class="rm-delivery">
      <h2>${escapeHTML(ui.deliveryHeading)}</h2>
      ${delivery}
      <h2>${escapeHTML(ui.pickupHeading)}</h2>
      <p>${escapeHTML(product.pickup)}</p>
    </div>
    <ul class="rm-trust-badges">${trust}</ul>
    <a class="rm-product-cta" href="${escapeHTML(product.url)}" data-product-link>
      ${escapeHTML(ui.addToCartLabel)}
    </a>
  </div>`;
}

function renderHero(product, ids, ui) {
  return `<section
    class="rm-section rm-hero-section"
    id="${ids.overview}"
    data-rm-section="overview"
    aria-labelledby="${ids.overview}-title">
    <div class="rm-hero">
      ${renderGallery(product, ids, ui.gallery)}
      ${renderBuyBox(product, ids.instance, ui.hero)}
    </div>
  </section>`;
}

function renderHighlights(highlights, ui) {
  const items = highlights.map((highlight, index) => `
    <li style="--rm-item-index: ${index}">
      <span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <strong>${escapeHTML(highlight)}</strong>
    </li>
  `).join('');

  return `<section
    class="rm-section rm-highlights-section"
    aria-label="${escapeHTML(ui.highlightsLabel)}">
    <ol class="rm-highlights">${items}</ol>
  </section>`;
}

function renderFeatureMedia(media) {
  return media.map((image) => renderImage(image)).join('');
}

function renderFeatureBullets(bullets = [], separator = ' — ') {
  if (!bullets.length) return '';
  const items = bullets.map((bullet) => {
    const lead = bullet.lead ? `<strong>${escapeHTML(bullet.lead)}</strong>` : '';
    const visibleSeparator = bullet.lead && bullet.text ? escapeHTML(separator) : '';
    return `<li>${lead}${visibleSeparator}${escapeHTML(bullet.text)}</li>`;
  }).join('');
  return `<ul>${items}</ul>`;
}

function renderFeatureDetails(detailGroups = []) {
  return detailGroups.map((detail) => `
    <div class="rm-feature-detail">
      <h3>${escapeHTML(detail.title)}</h3>
      <p>
        <strong>${escapeHTML(detail.lead)}</strong>
        ${escapeHTML(detail.text)}
      </p>
    </div>
  `).join('');
}

function renderFeature(feature, index, ids, ui) {
  const titleId = `${ids.instance}-feature-title-${index + 1}`;
  const paragraphs = (feature.paragraphs || [])
    .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
    .join('');
  const eyebrow = feature.eyebrow
    ? `<p class="rm-feature-eyebrow">${escapeHTML(feature.eyebrow)}</p>`
    : '';
  const subtitle = feature.subtitle
    ? `<h3>${escapeHTML(feature.subtitle)}</h3>`
    : '';
  const note = feature.note
    ? `<p class="rm-feature-note"><small>${escapeHTML(feature.note)}</small></p>`
    : '';
  const link = feature.link
    ? `<p><a class="rm-feature-link" href="${escapeHTML(feature.link.href)}">
        ${escapeHTML(feature.link.label)}
      </a></p>`
    : '';
  const featureId = index === 0 ? ` id="${ids.features}"` : '';

  return `<section
    class="rm-section rm-feature rm-feature--${feature.side}"
    data-rm-section="feature"${featureId}
    aria-labelledby="${titleId}">
    <div class="rm-feature-inner">
      <div class="rm-feature-media">${renderFeatureMedia(feature.media)}</div>
      <div class="rm-feature-copy">
        ${eyebrow}
        <h2 id="${titleId}">${escapeHTML(feature.title)}</h2>
        ${subtitle}
        ${paragraphs}
        ${renderFeatureBullets(feature.bullets, ui.bulletSeparator)}
        ${renderFeatureDetails(feature.detailGroups)}
        ${note}
        ${link}
      </div>
    </div>
  </section>`;
}

function renderSpecificationValue(value) {
  if (!Array.isArray(value)) return escapeHTML(value);
  return `<ul>${value.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
}

function renderSpecifications(specifications, ids, ui) {
  const rows = specifications.map((specification, index) => `
    <tr style="--rm-item-index: ${index % 8}">
      <th scope="row">${escapeHTML(specification.label)}</th>
      <td>${renderSpecificationValue(specification.value)}</td>
    </tr>
  `).join('');

  return `<section
    class="rm-section rm-specifications-section"
    id="${ids.specifications}"
    data-rm-section="specifications"
    aria-labelledby="${ids.specifications}-title">
    <div class="rm-section-heading">
      <span>${escapeHTML(ui.eyebrow)}</span>
      <h2 id="${ids.specifications}-title">${escapeHTML(ui.title)}</h2>
    </div>
    <div class="rm-spec-table-shell">
      <table class="rm-spec-table">
        <caption class="rm-visually-hidden">
          ${escapeHTML(ui.caption)}
        </caption>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}

function renderRelatedCard(product, index, count, ui) {
  return `<article
    class="rm-product-card"
    role="group"
    aria-label="${escapeHTML(formatMessage(ui.cardPositionPattern, {
    current: index + 1,
    total: count,
  }))}"
    style="--rm-item-index: ${index}">
    <div class="rm-product-card-media">${renderImage(product.image)}</div>
    <div class="rm-product-card-copy">
      <h3>${escapeHTML(product.title)}</h3>
      <p class="rm-product-card-price">
        <strong>${escapeHTML(product.price)}</strong>
        ${product.originalPrice ? `<del>${escapeHTML(product.originalPrice)}</del>` : ''}
        ${product.discount ? `<mark>${escapeHTML(product.discount)}</mark>` : ''}
      </p>
      <a href="${escapeHTML(product.url)}">
        ${escapeHTML(product.linkLabel || ui.viewDetailsLabel)}
      </a>
    </div>
  </article>`;
}

function renderRelatedProducts(products, ids, ui) {
  const cards = products
    .map((product, index) => renderRelatedCard(product, index, products.length, ui))
    .join('');

  return `<section
    class="rm-section rm-related-section"
    id="${ids.related}"
    data-rm-section="related"
    aria-labelledby="${ids.related}-title">
    <div class="rm-section-heading">
      <span>${escapeHTML(ui.eyebrow)}</span>
      <h2 id="${ids.related}-title">${escapeHTML(ui.title)}</h2>
    </div>
    <div class="rm-carousel">
      <div class="rm-carousel-controls">
        <button
          class="rm-carousel-button"
          type="button"
          aria-label="${escapeHTML(ui.previousLabel)}"
          aria-controls="${ids.track}"
          data-carousel-previous>${escapeHTML(ui.previousSymbol)}</button>
        <button
          class="rm-carousel-button"
          type="button"
          aria-label="${escapeHTML(ui.nextLabel)}"
          aria-controls="${ids.track}"
          data-carousel-next>${escapeHTML(ui.nextSymbol)}</button>
      </div>
      <div
        class="rm-carousel-track"
        id="${ids.track}"
        role="region"
        aria-label="${escapeHTML(ui.regionLabel)}"
        tabindex="0"
        data-carousel-track>
        ${cards}
      </div>
    </div>
  </section>`;
}

function renderNavigation(ids, ui, productUrl, content, config) {
  const sectionLinks = [
    config.showFeatures && content.features.length
      ? `<a href="#${ids.features}" data-nav-key="feature">
          ${escapeHTML(ui.featuresLabel)}
        </a>`
      : '',
    config.showSpecifications
      ? `<a href="#${ids.specifications}" data-nav-key="specifications">
          ${escapeHTML(ui.specificationsLabel)}
        </a>`
      : '',
    config.showRelatedProducts
      ? `<a href="#${ids.related}" data-nav-key="related">
          ${escapeHTML(ui.relatedLabel)}
        </a>`
      : '',
  ].join('');
  const progress = '<span class="rm-scroll-progress" aria-hidden="true" data-scroll-progress></span>';

  return `<header class="rm-product-nav" data-rm-navigation>
    <div class="rm-product-nav-inner">
      <a
        class="rm-brand"
        href="#${ids.overview}"
        aria-label="${escapeHTML(ui.brandAriaLabel)}">
        ${renderImage(ui.logo, { eager: true })}
      </a>
      <nav aria-label="${escapeHTML(ui.ariaLabel)}">
        <a href="#${ids.overview}" data-nav-key="overview">
          ${escapeHTML(ui.overviewLabel)}
        </a>
        ${sectionLinks}
      </nav>
      <a class="rm-buy-now" href="${escapeHTML(productUrl)}" data-product-link>
        ${escapeHTML(ui.buyNowLabel)}
      </a>
    </div>
    ${config.scrollProgress ? progress : ''}
  </header>`;
}

function renderFooter(ui) {
  return `<footer class="rm-footer">
    <div>
      <strong>${escapeHTML(ui.tagline)}</strong>
      <span>${escapeHTML(ui.descriptor)}</span>
    </div>
  </footer>`;
}

function renderExperience(config, ids, content) {
  const { ui } = content;
  const navigation = config.navigation
    ? renderNavigation(ids, ui.navigation, content.product.url, content, config)
    : '';
  const footer = config.footer ? renderFooter(ui.footer) : '';
  const highlights = config.showHighlights
    ? renderHighlights(content.highlights, ui)
    : '';
  const features = config.showFeatures
    ? content.features.map((feature, index) => (
      renderFeature(feature, index, ids, ui.feature)
    )).join('')
    : '';
  const specifications = config.showSpecifications
    ? renderSpecifications(content.specifications, ids, ui.specifications)
    : '';
  const relatedProducts = config.showRelatedProducts
    ? renderRelatedProducts(content.relatedProducts, ids, ui.related)
    : '';

  return `
    <a class="rm-skip-link" href="#${ids.overview}">
      ${escapeHTML(ui.skipNavigationLabel)}
    </a>
    ${navigation}
    <div class="rm-content">
      ${renderHero(content.product, ids, ui)}
      ${highlights}
      ${features}
      ${specifications}
      ${relatedProducts}
    </div>
    ${footer}`;
}

function createIds(prefix = 'razer-minipage') {
  instanceCount += 1;
  const safePrefix = normalizeKey(prefix).replace(/[^a-z0-9-]/g, '') || 'razer-minipage';
  const instance = `${safePrefix}-${instanceCount}`;
  return {
    instance,
    overview: `${instance}-overview`,
    features: `${instance}-features`,
    specifications: `${instance}-specifications`,
    related: `${instance}-related-products`,
    track: `${instance}-related-products-track`,
    slide: `${instance}-gallery-slide`,
    thumbnail: `${instance}-gallery-thumbnail`,
  };
}

function setupGallery(block, reducedMotion) {
  const slides = [...block.querySelectorAll('[data-gallery-slide]')];
  const thumbnails = [...block.querySelectorAll('[data-gallery-thumbnail]')];
  const counter = block.querySelector('[data-gallery-counter]');
  const previous = block.querySelector('[data-gallery-previous]');
  const next = block.querySelector('[data-gallery-next]');
  const stage = block.querySelector('.rm-gallery-stage');
  if (!slides.length || slides.length !== thumbnails.length || !stage) return;

  let activeIndex = 0;
  const showSlide = (requestedIndex, focusThumbnail = false) => {
    activeIndex = (requestedIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.hidden = index !== activeIndex;
    });
    thumbnails.forEach((thumbnail, index) => {
      const selected = index === activeIndex;
      thumbnail.setAttribute('aria-selected', String(selected));
      thumbnail.tabIndex = selected ? 0 : -1;
    });
    if (counter) {
      counter.textContent = formatMessage(counter.dataset.counterPattern, {
        current: activeIndex + 1,
        total: slides.length,
      });
    }
    if (focusThumbnail) thumbnails[activeIndex].focus();

    const activeSlide = slides[activeIndex];
    if (!reducedMotion && activeSlide.animate) {
      activeSlide.animate(
        [
          { opacity: 0, transform: 'scale(0.985)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        {
          duration: 420,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      );
    }
  };

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => showSlide(index));
    thumbnail.addEventListener('keydown', (event) => {
      const supportedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (!supportedKeys.includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') showSlide(0, true);
      else if (event.key === 'End') showSlide(slides.length - 1, true);
      else {
        const forward = ['ArrowRight', 'ArrowDown'].includes(event.key);
        showSlide(index + (forward ? 1 : -1), true);
      }
    });
  });

  previous?.addEventListener('click', () => showSlide(activeIndex - 1));
  next?.addEventListener('click', () => showSlide(activeIndex + 1));

  if (!reducedMotion && window.matchMedia?.('(pointer: fine)').matches) {
    let bounds;
    let frame;
    let pointerX = 0;
    let pointerY = 0;
    const renderPointer = () => {
      stage.style.setProperty('--rm-pointer-x', pointerX.toFixed(3));
      stage.style.setProperty('--rm-pointer-y', pointerY.toFixed(3));
      frame = null;
    };

    stage.addEventListener('pointerenter', () => {
      bounds = stage.getBoundingClientRect();
    });
    stage.addEventListener('pointermove', (event) => {
      if (!bounds) return;
      pointerX = ((event.clientX - bounds.left) / bounds.width) - 0.5;
      pointerY = ((event.clientY - bounds.top) / bounds.height) - 0.5;
      if (!frame) frame = requestAnimationFrame(renderPointer);
    });
    stage.addEventListener('pointerleave', () => {
      bounds = null;
      pointerX = 0;
      pointerY = 0;
      if (!frame) frame = requestAnimationFrame(renderPointer);
    });
  }

  showSlide(0);
}

function setupOptions(block) {
  block.querySelectorAll('[data-option-group]').forEach((group) => {
    const buttons = [...group.querySelectorAll('.rm-option-button')];
    const status = group.querySelector('[data-option-status]');
    if (!buttons.length) return;

    const selectOption = (index, focusButton = false) => {
      buttons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
        button.closest('.rm-option-item')?.classList.toggle('is-selected', selected);
      });
      const selectedLabel = buttons[index].querySelector('span')?.textContent.trim();
      if (status && selectedLabel) {
        status.textContent = formatMessage(group.dataset.selectionPattern, {
          label: selectedLabel,
        });
      }
      if (focusButton) buttons[index].focus();
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => selectOption(index));
      button.addEventListener('keydown', (event) => {
        const supportedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (!supportedKeys.includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = buttons.length - 1;
        else if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
          nextIndex = (index + 1) % buttons.length;
        } else {
          nextIndex = (index - 1 + buttons.length) % buttons.length;
        }
        selectOption(nextIndex, true);
      });
    });
  });
}

function setupCarousel(block, reducedMotion) {
  const track = block.querySelector('[data-carousel-track]');
  const previous = block.querySelector('[data-carousel-previous]');
  const next = block.querySelector('[data-carousel-next]');
  if (!track || !previous || !next) return;

  const updateControls = () => {
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };

  const scrollByCard = (direction) => {
    const card = track.querySelector('.rm-product-card');
    if (!card) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  previous.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));
  track.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    scrollByCard(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls, { passive: true });
  requestAnimationFrame(updateControls);
}

function setupNavigation(block) {
  const navigation = block.querySelector('[data-rm-navigation]');
  if (!navigation) return;
  const links = [...navigation.querySelectorAll('nav a[data-nav-key]')];
  const sections = [...block.querySelectorAll('[data-rm-section]')];
  if (!links.length || !sections.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
      window.history.replaceState(null, '', `#${id}`);
    });
  });

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const key = visible.target.dataset.rmSection;
    links.forEach((link) => {
      if (link.dataset.navKey === key) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, {
    rootMargin: '-25% 0px -60% 0px',
    threshold: [0, 0.2, 0.5],
  });
  sections.forEach((section) => observer.observe(section));
}

function setupScrollProgress(block) {
  const progress = block.querySelector('[data-scroll-progress]');
  if (!progress) return;
  let frame;

  const update = () => {
    const blockTop = window.scrollY + block.getBoundingClientRect().top;
    const distance = Math.max(1, block.offsetHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, (window.scrollY - blockTop) / distance));
    progress.style.transform = `scaleX(${ratio})`;
    frame = null;
  };

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function setupMotion(block, enabled, reducedMotion) {
  if (!enabled || reducedMotion) {
    block.classList.add('rm-motion-disabled');
    return;
  }

  const sections = [...block.querySelectorAll('.rm-section')];
  block.classList.add('rm-motion-ready');
  sections.forEach((section) => section.classList.add('rm-motion-section'));
  sections[0]?.classList.add('is-visible');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08,
    });
    sections.slice(1).forEach((section) => observer.observe(section));
  } else {
    sections.forEach((section) => section.classList.add('is-visible'));
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => block.classList.add('rm-motion-started'));
  });
}

function updateProductLinks(block, productUrl) {
  block.querySelectorAll('[data-product-link]').forEach((link) => {
    link.href = productUrl;
  });
}

function showPresetError(block, preset) {
  block.classList.add('rm-error');
  block.innerHTML = `<div role="alert">
    <strong>Razer minipage could not load.</strong>
    <span>Unsupported preset: ${escapeHTML(preset)}</span>
  </div>`;
}

/**
 * Renders and wires the shared Razer minipage experience.
 * @param {Element} block The EDS block element.
 * @param {object} options Runtime content and behavior.
 * @returns {object|null} The generated instance IDs, or null when already ready.
 */
export function decorateRazerExperience(block, {
  content = CONTENT,
  config = {},
  instancePrefix = 'razer-minipage',
} = {}) {
  if (block.dataset.razerMinipageReady === 'true') return null;

  const runtimeConfig = {
    navigation: true,
    footer: true,
    motion: true,
    scrollProgress: true,
    showHighlights: true,
    showFeatures: true,
    showSpecifications: true,
    showRelatedProducts: true,
    productUrl: content.product.url,
    automaticStickyOffset: true,
    stickyOffset: 'var(--nav-height, 64px)',
    ...config,
  };

  block.dataset.razerMinipageReady = 'true';
  block.dataset.preset = content.id || 'authored';
  block.setAttribute('aria-label', content.ui.regionLabel || content.metadata.title);
  block.setAttribute('role', 'region');
  block.classList.add('razer-minipage');
  block.classList.toggle('rm-auto-sticky-offset', runtimeConfig.automaticStickyOffset);
  block.style.setProperty('--rm-sticky-offset', runtimeConfig.stickyOffset);
  loadFonts();

  const ids = createIds(instancePrefix);
  block.innerHTML = renderExperience(runtimeConfig, ids, content);
  updateProductLinks(block, runtimeConfig.productUrl);

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  setupGallery(block, reducedMotion);
  setupOptions(block);
  setupCarousel(block, reducedMotion);
  setupNavigation(block);
  setupScrollProgress(block);
  setupMotion(block, runtimeConfig.motion, reducedMotion);
  return ids;
}

/**
 * Decorates a DA.live `razer-minipage` key-value block.
 * @param {Element} block The already-created EDS block element.
 */
export default function decorate(block) {
  const config = readConfig(block);
  if (config.preset !== CONTENT.id) {
    showPresetError(block, config.preset);
    return;
  }

  decorateRazerExperience(block, { content: CONTENT, config });
}

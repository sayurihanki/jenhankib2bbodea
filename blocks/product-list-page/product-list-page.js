// Product Discovery Dropins
import SearchResults from '@dropins/storefront-product-discovery/containers/SearchResults.js';
import Facets from '@dropins/storefront-product-discovery/containers/Facets.js';
import SortBy from '@dropins/storefront-product-discovery/containers/SortBy.js';
import Pagination from '@dropins/storefront-product-discovery/containers/Pagination.js';
import { render as provider } from '@dropins/storefront-product-discovery/render.js';
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';
import { search } from '@dropins/storefront-product-discovery/api.js';
// Wishlist Dropin
import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';
import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';
// Cart Dropin
import * as cartApi from '@dropins/storefront-cart/api.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
// Event Bus
import { events } from '@dropins/tools/event-bus.js';
// AEM
import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPlaceholders, getProductLink } from '../../scripts/commerce.js';
import {
  deriveQuickChips,
  hasFilter,
  serializeFiltersToParam,
  stripSystemFilters,
  toggleFilter,
} from '../../scripts/search/chips.js';
import { getPersonalizationReason, withSearchContext } from '../../scripts/search/context.js';
import {
  recordSearchAddToCart,
  recordSearchProductClick,
  resetSearchProfile,
} from '../../scripts/search/profile.js';
import {
  isPersonalizationTreatment,
  loadSearchSettings,
  resetSearchSettings,
  setPersonalizationEnabled,
  withP13nParam,
} from '../../scripts/search/settings.js';
import { emitSearchTelemetry } from '../../scripts/search/telemetry.js';

// Initializers
import '../../scripts/initializers/search.js';
import '../../scripts/initializers/wishlist.js';

function getSafeAemAlias(product) {
  const rawAlias = product?.urlKey || product?.sku || 'product-image';
  return encodeURIComponent(rawAlias);
}

function getSystemFilters(filters = []) {
  return filters.filter((filter) => {
    const attribute = String(filter?.attribute || '').toLowerCase();
    return attribute === 'visibility' || attribute === 'categorypath';
  });
}

function normalizeHref(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch (e) {
    return value;
  }
}

async function executeSearchRequest(baseRequest, searchSettings, source = 'unknown') {
  const { request, personalization } = withSearchContext(baseRequest, searchSettings);

  emitSearchTelemetry('search-request-context', {
    surface: 'search-page',
    source,
    phrase: request?.phrase || '',
    hasContext: Boolean(personalization.context),
    personalizationEnabled: searchSettings.personalizationEnabled,
    treatment: isPersonalizationTreatment(searchSettings),
    holdoutBucket: searchSettings.holdoutBucket,
  });

  await search(request).catch(() => {
    // eslint-disable-next-line no-console
    console.error('Error searching for products');
  });
}

export default async function decorate(block) {
  const labels = await fetchPlaceholders();
  const config = readBlockConfig(block);
  let searchSettings = loadSearchSettings();

  const fragment = document.createRange()
    .createContextualFragment(`
    <div class="search__wrapper">
      <div class="search__result-info"></div>
      <div class="search__personalization-controls"></div>
      <div class="search__why-results"></div>
      <div class="search__suggested-filters"></div>
      <div class="search__view-facets"></div>
      <div class="search__facets"></div>
      <div class="search__product-sort"></div>
      <div class="search__product-list"></div>
      <div class="search__pagination"></div>
    </div>
  `);

  const $resultInfo = fragment.querySelector('.search__result-info');
  const $personalizationControls = fragment.querySelector('.search__personalization-controls');
  const $whyResults = fragment.querySelector('.search__why-results');
  const $suggestedFilters = fragment.querySelector('.search__suggested-filters');
  const $viewFacets = fragment.querySelector('.search__view-facets');
  const $facets = fragment.querySelector('.search__facets');
  const $productSort = fragment.querySelector('.search__product-sort');
  const $productList = fragment.querySelector('.search__product-list');
  const $pagination = fragment.querySelector('.search__pagination');

  block.innerHTML = '';
  block.appendChild(fragment);

  // Add category url path to block for enrichment
  if (config.urlpath) {
    block.dataset.category = config.urlpath;
  }

  // Get variables from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const {
    q,
    page,
    sort,
    filter,
  } = Object.fromEntries(urlParams.entries());

  let latestPayload;
  let activeSuggestedFilters = [];
  let latestSuggestedChips = [];
  let latestResultSkuByHref = new Map();

  const renderWhyResults = (context) => {
    const reason = searchSettings.personalizationEnabled ? getPersonalizationReason(context) : null;
    if (!reason) {
      $whyResults.hidden = true;
      $whyResults.textContent = '';
      return;
    }

    $whyResults.textContent = `Why these results: ${reason}.`;
    $whyResults.hidden = false;
  };

  const renderPersonalizationControls = () => {
    $personalizationControls.innerHTML = '';

    const controlsInner = document.createElement('div');
    controlsInner.className = 'search__personalization-inner';

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'search__personalization-toggle';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = Boolean(searchSettings.personalizationEnabled);

    const toggleText = document.createElement('span');
    toggleText.textContent = labels.Global?.SearchPersonalized || 'Personalized results';

    toggleLabel.append(toggle, toggleText);

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'search__personalization-reset';
    resetButton.textContent = labels.Global?.SearchResetPreferences || 'Reset search preferences';

    toggle.addEventListener('change', async () => {
      searchSettings = setPersonalizationEnabled(toggle.checked);
      emitSearchTelemetry('search-personalization-toggle', {
        surface: 'search-page',
        enabled: searchSettings.personalizationEnabled,
      });

      if (!latestPayload?.request) return;
      await executeSearchRequest({
        ...latestPayload.request,
        currentPage: 1,
      }, searchSettings, 'p13n-toggle');
    });

    resetButton.addEventListener('click', async () => {
      resetSearchProfile();
      searchSettings = resetSearchSettings();
      emitSearchTelemetry('search-personalization-reset', {
        surface: 'search-page',
      });

      if (!latestPayload?.request) return;
      await executeSearchRequest({
        ...latestPayload.request,
        currentPage: 1,
      }, searchSettings, 'p13n-reset');
    });

    controlsInner.append(toggleLabel, resetButton);
    $personalizationControls.append(controlsInner);
  };

  const renderSuggestedFilters = () => {
    $suggestedFilters.innerHTML = '';

    if (!latestPayload?.result?.facets) {
      $suggestedFilters.hidden = true;
      return;
    }

    latestSuggestedChips = deriveQuickChips(latestPayload.result.facets, { maxChips: 4 });
    activeSuggestedFilters = stripSystemFilters(latestPayload.request?.filter || []);

    if (latestSuggestedChips.length === 0) {
      $suggestedFilters.hidden = true;
      return;
    }

    const label = document.createElement('p');
    label.className = 'search__suggested-filters-label';
    label.textContent = labels.Global?.SearchSuggestedFilters || 'Suggested filters';
    $suggestedFilters.append(label);

    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'search__suggested-filters-list';

    latestSuggestedChips.forEach((chip) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search__suggested-filter-chip';
      const selected = hasFilter(activeSuggestedFilters, chip.filter);
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      button.textContent = chip.label;
      button.addEventListener('click', async () => {
        const wasSelected = hasFilter(activeSuggestedFilters, chip.filter);
        activeSuggestedFilters = toggleFilter(activeSuggestedFilters, chip.filter);

        emitSearchTelemetry(wasSelected ? 'search-chip-removed' : 'search-chip-applied', {
          surface: 'search-page',
          chip: chip.label,
          attribute: chip.attribute,
        });

        if (!latestPayload?.request) return;

        await executeSearchRequest({
          ...latestPayload.request,
          filter: [
            ...getSystemFilters(latestPayload.request.filter || []),
            ...activeSuggestedFilters,
          ],
          currentPage: 1,
        }, searchSettings, 'suggested-chip');
      });
      chipsContainer.append(button);
    });

    $suggestedFilters.append(chipsContainer);
    $suggestedFilters.hidden = false;
  };

  await performInitialSearch(config, {
    q,
    page,
    sort,
    filter,
  }, searchSettings);

  const getAddToCartButton = (product) => {
    if (product.typename === 'ComplexProductView') {
      const button = document.createElement('div');
      UI.render(Button, {
        children: labels.Global?.AddProductToCart,
        icon: Icon({ source: 'Cart' }),
        href: getProductLink(product.urlKey, product.sku),
        variant: 'primary',
      })(button);
      return button;
    }

    const button = document.createElement('div');
    UI.render(Button, {
      children: labels.Global?.AddProductToCart,
      icon: Icon({ source: 'Cart' }),
      onClick: () => {
        recordSearchAddToCart(product.sku, { surface: 'search-page' });
        emitSearchTelemetry('search-add-to-cart', {
          surface: 'search-page',
          sku: product.sku,
        });
        cartApi.addProductsToCart([{
          sku: product.sku,
          quantity: 1,
        }]);
      },
      variant: 'primary',
    })(button);
    return button;
  };

  await Promise.all([
    // Sort By
    provider.render(SortBy, {})($productSort),

    // Pagination
    provider.render(Pagination, {
      onPageChange: () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
    })($pagination),

    // View Facets Button
    UI.render(Button, {
      children: labels.Global?.Filters,
      icon: Icon({ source: 'Burger' }),
      variant: 'secondary',
      onClick: () => {
        $facets.classList.toggle('search__facets--visible');
      },
    })($viewFacets),

    // Facets
    provider.render(Facets, {})($facets),

    // Product List
    provider.render(SearchResults, {
      routeProduct: (product) => getProductLink(product.urlKey, product.sku),
      slots: {
        ProductImage: (ctx) => {
          const {
            product,
            defaultImageProps,
          } = ctx;
          const anchorWrapper = document.createElement('a');
          anchorWrapper.href = getProductLink(product.urlKey, product.sku);

          if (!defaultImageProps?.src) {
            ctx.replaceWith(anchorWrapper);
            return;
          }

          tryRenderAemAssetsImage(ctx, {
            alias: getSafeAemAlias(product),
            imageProps: defaultImageProps,
            wrapper: anchorWrapper,
            params: {
              width: defaultImageProps.width,
              height: defaultImageProps.height,
            },
          });
        },
        ProductActions: async (ctx) => {
          const actionsWrapper = document.createElement('div');
          actionsWrapper.className = 'product-discovery-product-actions';

          // Add to Cart Button
          const addToCartBtn = getAddToCartButton(ctx.product);
          addToCartBtn.className = 'product-discovery-product-actions__add-to-cart';

          // Wishlist Button
          const $wishlistToggle = document.createElement('div');
          $wishlistToggle.classList.add('product-discovery-product-actions__wishlist-toggle');
          wishlistRender.render(WishlistToggle, {
            product: ctx.product,
            variant: 'tertiary',
          })($wishlistToggle);
          actionsWrapper.appendChild(addToCartBtn);
          actionsWrapper.appendChild($wishlistToggle);

          // Conditionally load and render Requisition List Button
          try {
            const { initializeRequisitionList } = await import('./requisition-list.js');

            const $reqListContainer = await initializeRequisitionList({
              product: ctx.product,
              labels,
            });

            actionsWrapper.appendChild($reqListContainer);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Requisition list module not available:', error);
          }

          ctx.replaceWith(actionsWrapper);
        },
      },
    })($productList),
  ]);

  $productList.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const sku = latestResultSkuByHref.get(normalizeHref(anchor.href));
    if (!sku) return;

    recordSearchProductClick(sku, { surface: 'search-page' });
  });

  renderPersonalizationControls();

  // Listen for search results (event is fired before the block is rendered; eager: true)
  events.on('search/result', (payload) => {
    latestPayload = payload;

    const totalCount = payload.result?.totalCount || 0;

    block.classList.toggle('product-list-page--empty', totalCount === 0);

    $resultInfo.innerHTML = payload.request?.phrase
      ? `${totalCount} results found for <strong>"${payload.request.phrase}"</strong>.`
      : `${totalCount} results found.`;

    if (payload.request.filter.length > 0) {
      $viewFacets.querySelector('button')
        .setAttribute('data-count', payload.request.filter.length);
    } else {
      $viewFacets.querySelector('button')
        .removeAttribute('data-count');
    }

    latestResultSkuByHref = new Map((payload.result?.items || []).map((item) => [
      normalizeHref(getProductLink(item.urlKey, item.sku)),
      item.sku,
    ]));

    renderWhyResults(payload.request?.context);
    renderSuggestedFilters();
  }, { eager: true });

  // Listen for search results (event is fired after the block is rendered; eager: false)
  events.on('search/result', (payload) => {
    const url = new URL(window.location.href);

    if (payload.request?.phrase) {
      url.searchParams.set('q', payload.request.phrase);
    }

    if (payload.request?.currentPage) {
      url.searchParams.set('page', payload.request.currentPage);
    }

    if (payload.request?.sort) {
      url.searchParams.set('sort', getParamsFromSort(payload.request.sort));
    }

    if (payload.request?.filter) {
      url.searchParams.set('filter', getParamsFromFilter(payload.request.filter));
    }

    const relativeUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.pushState({}, '', withP13nParam(relativeUrl, searchSettings));
  }, { eager: false });
}

async function performInitialSearch(config, urlParams, searchSettings) {
  const {
    q,
    page,
    sort,
    filter,
  } = urlParams;

  if (config.urlpath) {
    await executeSearchRequest({
      phrase: '',
      currentPage: page ? Number(page) : 1,
      pageSize: 8,
      sort: sort ? getSortFromParams(sort) : [{
        attribute: 'position',
        direction: 'DESC',
      }],
      filter: [
        {
          attribute: 'categoryPath',
          eq: config.urlpath,
        },
        {
          attribute: 'visibility',
          in: ['Search', 'Catalog, Search'],
        },
        ...getFilterFromParams(filter),
      ],
    }, searchSettings, 'initial-category');
    return;
  }

  await executeSearchRequest({
    phrase: q || '',
    currentPage: page ? Number(page) : 1,
    pageSize: 8,
    sort: getSortFromParams(sort),
    filter: [
      {
        attribute: 'visibility',
        in: ['Search', 'Catalog, Search'],
      },
      ...getFilterFromParams(filter),
    ],
  }, searchSettings, 'initial-search');
}

function getSortFromParams(sortParam) {
  if (!sortParam) return [];
  return sortParam.split(',')
    .map((item) => {
      const [attribute, direction] = item.split('_');
      return {
        attribute,
        direction,
      };
    });
}

function getParamsFromSort(sort) {
  return sort.map((item) => `${item.attribute}_${item.direction}`)
    .join(',');
}

function getFilterFromParams(filterParam) {
  if (!filterParam) return [];

  const decodedParam = decodeURIComponent(filterParam);
  const results = [];
  const filters = decodedParam.split('|');

  filters.forEach((filter) => {
    if (filter.includes(':')) {
      const [attribute, value] = filter.split(':');
      const commaRegex = /,(?!\s)/;

      if (commaRegex.test(value)) {
        results.push({
          attribute,
          in: value.split(commaRegex),
        });
      } else if (value.includes('-')) {
        const [from, to] = value.split('-');
        results.push({
          attribute,
          range: {
            from: Number(from),
            to: Number(to),
          },
        });
      } else {
        results.push({
          attribute,
          in: [value],
        });
      }
    }
  });

  return results;
}

function getParamsFromFilter(filter) {
  if (!filter || filter.length === 0) return '';

  const searchableFilter = filter
    .filter((item) => item?.attribute)
    .map(({ attribute, in: inValues, range }) => {
      if (inValues) {
        return `${attribute}:${inValues.join(',')}`;
      }

      if (range) {
        return `${attribute}:${range.from}-${range.to}`;
      }

      return null;
    })
    .filter(Boolean);

  return searchableFilter.length > 0
    ? searchableFilter.join('|')
    : serializeFiltersToParam(stripSystemFilters(filter));
}

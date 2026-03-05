/** ******************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 ****************************************************************** */
import { CompanyCredit } from '@dropins/storefront-company-management/containers/CompanyCredit.js';
import { render as companyRenderer } from '@dropins/storefront-company-management/render.js';
import { fetchGraphQl } from '@dropins/storefront-company-management/api.js';
import { events } from '@dropins/tools/event-bus.js';
import {
  CORE_FETCH_GRAPHQL,
  CUSTOMER_LOGIN_PATH,
  checkIsAuthenticated,
  rootLink,
} from '../../scripts/commerce.js';
import { readBlockConfig } from '../../scripts/aem.js';

// Initialize
import '../../scripts/initializers/company.js';
import '../../scripts/initializers/company-switcher.js';

const COMPANY_CONTEXT_SESSION_KEY = 'DROPIN__COMPANYSWITCHER__COMPANY__CONTEXT';

const GET_ACTIVE_COMPANY_CONTEXT = `
  query GET_ACTIVE_COMPANY_CONTEXT {
    company {
      id
    }
    customer {
      companies(input: {}) {
        items {
          id
        }
      }
    }
  }
`;

async function ensureCompanyContext() {
  let companyContext = sessionStorage.getItem(COMPANY_CONTEXT_SESSION_KEY);

  try {
    const response = await fetchGraphQl(GET_ACTIVE_COMPANY_CONTEXT, { method: 'GET', cache: 'no-cache' });
    const detectedCompanyContext = response?.data?.company?.id
      || response?.data?.customer?.companies?.items?.[0]?.id
      || null;

    if (detectedCompanyContext && detectedCompanyContext !== companyContext) {
      companyContext = detectedCompanyContext;
      sessionStorage.setItem(COMPANY_CONTEXT_SESSION_KEY, companyContext);
    }
  } catch {
    // Ignore probe failures and fall back to current drop-in behavior.
  }

  if (companyContext) {
    CORE_FETCH_GRAPHQL.setFetchGraphQlHeader('X-Adobe-Company', companyContext);
    events.emit('companyContext/changed', companyContext);
  }
}

export default async function decorate(block) {
  if (!checkIsAuthenticated()) {
    window.location.href = rootLink(CUSTOMER_LOGIN_PATH);
    return;
  }

  await ensureCompanyContext();

  // Render company credit container. Let the drop-in handle empty/disabled states.
  const { 'show-history': showHistory = 'true' } = readBlockConfig(block);
  const shouldShowHistory = showHistory === 'true';

  await companyRenderer.render(CompanyCredit, {
    showCreditHistory: shouldShowHistory,
    creditHistoryParams: shouldShowHistory ? {
      pageSize: 10,
      currentPage: 1,
    } : undefined,
  })(block);

  // Ensure credit data is refreshed with the active company context after mount.
  const companyContext = sessionStorage.getItem(COMPANY_CONTEXT_SESSION_KEY);
  if (companyContext) {
    CORE_FETCH_GRAPHQL.setFetchGraphQlHeader('X-Adobe-Company', companyContext);
    events.emit('companyContext/changed', companyContext);
  }
}

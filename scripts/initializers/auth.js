import { initializers } from '@dropins/tools/initializer.js';
import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';
import { initialize, setEndpoint } from '@dropins/storefront-auth/api.js';
import { initializeDropin } from './index.js';
import { CORE_FETCH_GRAPHQL, fetchPlaceholders } from '../commerce.js';
import {
  annotateAuthMutationResponse,
  AUTH_DIAGNOSTICS_SESSION_KEY,
  buildAuthFailureSnapshot,
} from '../auth-diagnostics.js';

let authDiagnosticsInstalled = false;

function installAuthDiagnostics() {
  if (authDiagnosticsInstalled) {
    return;
  }

  CORE_FETCH_GRAPHQL.addAfterHook(async (request, response) => {
    const nextResponse = annotateAuthMutationResponse(request, response);
    const snapshot = buildAuthFailureSnapshot(request, nextResponse);

    try {
      if (snapshot) {
        sessionStorage.setItem(AUTH_DIAGNOSTICS_SESSION_KEY, JSON.stringify(snapshot));
      } else {
        sessionStorage.removeItem(AUTH_DIAGNOSTICS_SESSION_KEY);
      }
    } catch {
      // Ignore storage failures and keep the auth flow moving.
    }

    if (snapshot?.requestId && snapshot?.category !== 'graphql-authentication') {
      console.error('Commerce sign-in failed', snapshot);
    }

    return nextResponse;
  });

  authDiagnosticsInstalled = true;
}

await initializeDropin(async () => {
  // Set Fetch GraphQL (Core)
  setEndpoint(CORE_FETCH_GRAPHQL);
  installAuthDiagnostics();

  // Fetch placeholders
  const labels = await fetchPlaceholders('placeholders/auth.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // Initialize auth
  const customerPermissionRoles = getConfigValue('commerce-b2b-enabled') === true;
  return initializers.mountImmediately(initialize, { langDefinitions, customerPermissionRoles });
})();

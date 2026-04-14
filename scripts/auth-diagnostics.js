export const AUTH_DIAGNOSTICS_SESSION_KEY = 'DROPINS_AUTH_LAST_ERROR';
export const AUTH_SYSTEM_ERROR_MESSAGE = 'An error occurred on the server. Please try to authenticate again later.';

function parseRequestBody(request) {
  if (!request?.body || typeof request.body !== 'string') {
    return null;
  }

  try {
    return JSON.parse(request.body);
  } catch {
    return null;
  }
}

export function isAuthTokenMutation(request) {
  const parsedBody = parseRequestBody(request);
  const query = parsedBody?.query;

  return typeof query === 'string' && query.includes('generateCustomerToken');
}

export function getGraphQlRequestId(response) {
  return response?.extensions?.['request-id'] || response?.extensions?.requestId || null;
}

export function annotateAuthMutationResponse(request, response) {
  if (!isAuthTokenMutation(request) || !Array.isArray(response?.errors) || response.errors.length === 0) {
    return response;
  }

  const requestId = getGraphQlRequestId(response);
  if (!requestId) {
    return response;
  }

  let mutated = false;
  const errors = response.errors.map((error) => {
    if (error?.message !== AUTH_SYSTEM_ERROR_MESSAGE || error.message.includes('Reference ID:')) {
      return error;
    }

    mutated = true;
    return {
      ...error,
      message: `${error.message} Reference ID: ${requestId}.`,
    };
  });

  if (!mutated) {
    return response;
  }

  return {
    ...response,
    errors,
  };
}

export function buildAuthFailureSnapshot(request, response) {
  if (!isAuthTokenMutation(request) || !Array.isArray(response?.errors) || response.errors.length === 0) {
    return null;
  }

  const parsedBody = parseRequestBody(request);
  const firstError = response.errors[0];

  return {
    email: parsedBody?.variables?.email || null,
    message: firstError?.message || null,
    path: Array.isArray(firstError?.path) ? firstError.path.join('.') : null,
    code: firstError?.extensions?.code || null,
    category: firstError?.extensions?.category || null,
    requestId: getGraphQlRequestId(response),
    timestamp: new Date().toISOString(),
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  annotateAuthMutationResponse,
  AUTH_SYSTEM_ERROR_MESSAGE,
  buildAuthFailureSnapshot,
  getGraphQlRequestId,
  isAuthTokenMutation,
} from '../../scripts/auth-diagnostics.js';

const authMutationRequest = {
  body: JSON.stringify({
    query: 'mutation GET_CUSTOMER_TOKEN($email: String!, $password: String!) { generateCustomerToken(email: $email, password: $password) { token } }',
    variables: {
      email: 'student@example.edu',
      password: 'secret',
    },
  }),
};

test('isAuthTokenMutation detects the sign-in mutation', () => {
  assert.equal(isAuthTokenMutation(authMutationRequest), true);
  assert.equal(isAuthTokenMutation({ body: JSON.stringify({ query: '{ customer { email } }' }) }), false);
});

test('getGraphQlRequestId reads the Commerce request id', () => {
  assert.equal(getGraphQlRequestId({ extensions: { 'request-id': 'abc-123' } }), 'abc-123');
  assert.equal(getGraphQlRequestId({ extensions: { requestId: 'xyz-789' } }), 'xyz-789');
  assert.equal(getGraphQlRequestId({}), null);
});

test('annotateAuthMutationResponse appends a request id to generic auth system errors', () => {
  const response = {
    errors: [
      {
        message: AUTH_SYSTEM_ERROR_MESSAGE,
        extensions: {
          category: 'internal',
        },
      },
    ],
    extensions: {
      'request-id': 'req-42',
    },
  };

  const annotated = annotateAuthMutationResponse(authMutationRequest, response);

  assert.equal(
    annotated.errors[0].message,
    `${AUTH_SYSTEM_ERROR_MESSAGE} Reference ID: req-42.`,
  );
});

test('buildAuthFailureSnapshot extracts the request id and error metadata', () => {
  const response = {
    errors: [
      {
        message: AUTH_SYSTEM_ERROR_MESSAGE,
        path: ['generateCustomerToken'],
        extensions: {
          category: 'internal',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
    ],
    extensions: {
      'request-id': 'req-99',
    },
  };

  const snapshot = buildAuthFailureSnapshot(authMutationRequest, response);

  assert.equal(snapshot.email, 'student@example.edu');
  assert.equal(snapshot.path, 'generateCustomerToken');
  assert.equal(snapshot.code, 'INTERNAL_SERVER_ERROR');
  assert.equal(snapshot.category, 'internal');
  assert.equal(snapshot.requestId, 'req-99');
  assert.match(snapshot.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

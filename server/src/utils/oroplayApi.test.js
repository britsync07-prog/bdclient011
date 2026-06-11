const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');

// Save original fetch
const originalFetch = global.fetch;

describe('oroplayApi - createToken error handling', () => {
  let oroplayApi;
  let originalClientId;
  let originalClientSecret;

  before(() => {
    originalClientId = process.env.OROPLAY_CLIENT_ID;
    originalClientSecret = process.env.OROPLAY_CLIENT_SECRET;

    process.env.OROPLAY_CLIENT_ID = 'test_id';
    process.env.OROPLAY_CLIENT_SECRET = 'test_secret';
    process.env.OROPLAY_BASE_URL = 'http://localhost:9999';

    // Require the module AFTER setting env vars
    oroplayApi = require('./oroplayApi');
  });

  after(() => {
    global.fetch = originalFetch;
    process.env.OROPLAY_CLIENT_ID = originalClientId;
    process.env.OROPLAY_CLIENT_SECRET = originalClientSecret;
  });

  test('should throw error when CLIENT_ID is missing', async () => {
    // To test this we need to reload the module without env vars
    const cid = process.env.OROPLAY_CLIENT_ID;
    delete process.env.OROPLAY_CLIENT_ID;

    // Clear cache and re-require
    delete require.cache[require.resolve('./oroplayApi')];
    const localOroplayApi = require('./oroplayApi');

    try {
      await assert.rejects(
        localOroplayApi.getBearerToken(),
        {
          message: 'Missing OROPLAY_CLIENT_ID or OROPLAY_CLIENT_SECRET in environment.'
        }
      );
    } finally {
      process.env.OROPLAY_CLIENT_ID = cid;
      // Restore the main one for other tests if needed
      delete require.cache[require.resolve('./oroplayApi')];
    }
  });

  test('should throw error when HTTP status is not ok (e.g., 401)', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    await assert.rejects(
      oroplayApi.getBearerToken(),
      {
        message: 'CreateToken failed with HTTP 401'
      }
    );
  });

  test('should throw error when HTTP status is not ok (e.g., 500)', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await assert.rejects(
      oroplayApi.getBearerToken(),
      {
        message: 'CreateToken failed with HTTP 500'
      }
    );
  });

  test('should throw error when response JSON is invalid (missing token)', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Something went wrong' })
    });

    await assert.rejects(
      oroplayApi.getBearerToken(),
      {
        message: /CreateToken returned invalid payload/
      }
    );
  });

  test('should throw error when response JSON is invalid (missing expiration)', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ token: 'some_token' })
    });

    await assert.rejects(
      oroplayApi.getBearerToken(),
      {
        message: /CreateToken returned invalid payload/
      }
    );
  });
});

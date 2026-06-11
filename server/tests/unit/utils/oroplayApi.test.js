const originalEnv = { ...process.env };

describe('oroplayApi', () => {
  let oroplayApi;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createToken via getBearerToken', () => {
    it('should throw error if OROPLAY_CLIENT_ID is missing', async () => {
      delete process.env.OROPLAY_CLIENT_ID;
      process.env.OROPLAY_CLIENT_SECRET = 'secret';

      oroplayApi = require('../../../src/utils/oroplayApi');

      await expect(oroplayApi.getBearerToken()).rejects.toThrow(
        'Missing OROPLAY_CLIENT_ID or OROPLAY_CLIENT_SECRET in environment.'
      );
    });

    it('should throw error if OROPLAY_CLIENT_SECRET is missing', async () => {
      process.env.OROPLAY_CLIENT_ID = 'id';
      delete process.env.OROPLAY_CLIENT_SECRET;

      oroplayApi = require('../../../src/utils/oroplayApi');

      await expect(oroplayApi.getBearerToken()).rejects.toThrow(
        'Missing OROPLAY_CLIENT_ID or OROPLAY_CLIENT_SECRET in environment.'
      );
    });

    it('should fetch and cache token when credentials are provided', async () => {
      process.env.OROPLAY_CLIENT_ID = 'test-id';
      process.env.OROPLAY_CLIENT_SECRET = 'test-secret';

      const mockToken = 'mock-token';
      const mockExpiration = Math.floor(Date.now() / 1000) + 3600;

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: mockToken, expiration: mockExpiration }),
        })
      );

      oroplayApi = require('../../../src/utils/oroplayApi');

      const token = await oroplayApi.getBearerToken();

      expect(token).toBe(mockToken);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/createtoken'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ clientId: 'test-id', clientSecret: 'test-secret' }),
        })
      );
    });

    it('should throw error if API returns non-ok status', async () => {
      process.env.OROPLAY_CLIENT_ID = 'id';
      process.env.OROPLAY_CLIENT_SECRET = 'secret';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );

      oroplayApi = require('../../../src/utils/oroplayApi');

      await expect(oroplayApi.getBearerToken()).rejects.toThrow(
        'CreateToken failed with HTTP 500'
      );
    });

    it('should throw error if API returns invalid payload', async () => {
      process.env.OROPLAY_CLIENT_ID = 'id';
      process.env.OROPLAY_CLIENT_SECRET = 'secret';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ something: 'else' }),
        })
      );

      oroplayApi = require('../../../src/utils/oroplayApi');

      await expect(oroplayApi.getBearerToken()).rejects.toThrow(
        /CreateToken returned invalid payload/
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getVendors', () => {
    it('should call vendors list endpoint with bearer token', async () => {
      process.env.OROPLAY_CLIENT_ID = 'id';
      process.env.OROPLAY_CLIENT_SECRET = 'secret';

      const mockToken = 'cached-token';
      const mockExpiration = Math.floor(Date.now() / 1000) + 3600;

      global.fetch = jest.fn()
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: mockToken, expiration: mockExpiration }),
        }))
        .mockImplementationOnce(() => Promise.resolve({
          status: 200,
          json: () => Promise.resolve([{ code: 'vendor1' }]),
        }));

      oroplayApi = require('../../../src/utils/oroplayApi');

      const result = await oroplayApi.getVendors();

      expect(result.status).toBe(200);
      expect(result.data).toEqual([{ code: 'vendor1' }]);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/vendors/list'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer ' + mockToken
          }),
        })
      );
    });
  });
});

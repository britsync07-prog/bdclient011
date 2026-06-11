const walletAuthMiddleware = require('./walletAuthMiddleware');

// Mock the database config to avoid connection issues during tests
jest.mock('../config/db', () => ({}));

describe('walletAuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    process.env.OROPLAY_CLIENT_ID = 'test_id';
    process.env.OROPLAY_CLIENT_SECRET = 'test_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', () => {
    walletAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Missing or invalid Authorization header')
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header does not start with Basic', () => {
    req.headers.authorization = 'Bearer token';
    walletAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if credentials are valid', () => {
    const credentials = Buffer.from('test_id:test_secret').toString('base64');
    req.headers.authorization = 'Basic ' + credentials;

    walletAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if clientId is incorrect', () => {
    const credentials = Buffer.from('wrong_id:test_secret').toString('base64');
    req.headers.authorization = 'Basic ' + credentials;

    walletAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Unauthorized: Invalid credentials',
      errorCode: 1
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if clientSecret is incorrect', () => {
    const credentials = Buffer.from('test_id:wrong_secret').toString('base64');
    req.headers.authorization = 'Basic ' + credentials;

    walletAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Unauthorized: Invalid credentials'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if both clientId and clientSecret are incorrect', () => {
    const credentials = Buffer.from('wrong_id:wrong_secret').toString('base64');
    req.headers.authorization = 'Basic ' + credentials;

    walletAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

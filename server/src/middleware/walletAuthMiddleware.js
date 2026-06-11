
/**
 * Middleware to verify OroPlay Basic Auth
 */
const walletAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid Authorization header',
      errorCode: 1 // General error
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [clientId, clientSecret] = credentials.split(':');

  const expectedClientId = process.env.OROPLAY_CLIENT_ID;
  const expectedClientSecret = process.env.OROPLAY_CLIENT_SECRET;

  if (clientId !== expectedClientId || clientSecret !== expectedClientSecret) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid credentials',
      errorCode: 1
    });
  }

  next();
};

module.exports = walletAuthMiddleware;

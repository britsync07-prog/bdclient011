
// Mask sensitive fields
const maskSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  let copy;
  try {
    copy = JSON.parse(JSON.stringify(obj));
  } catch (e) {
    copy = { ...obj };
  }

  const sensitiveKeys = ['password', 'clientSecret', 'token', 'jwt', 'secret'];
  for (const key of Object.keys(copy)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      copy[key] = '********';
    } else if (typeof copy[key] === 'object' && copy[key] !== null) {
      copy[key] = maskSensitive(copy[key]);
    }
  }
  return copy;
};

module.exports = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, query, body } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Ensure body and query are safe objects
    const maskedBody = (body && typeof body === 'object') ? (maskSensitive(body) || {}) : {};
    const safeQuery = (query && typeof query === 'object') ? query : {};
    
    const bodyStr = Object.keys(maskedBody).length ? ` | Body: ${JSON.stringify(maskedBody)}` : '';
    const queryStr = Object.keys(safeQuery).length ? ` | Query: ${JSON.stringify(safeQuery)}` : '';
    
    const username = req.user ? req.user.username : 'GUEST';
    
    console.log(`[HTTP] [${new Date().toISOString()}] ${method} ${originalUrl} | Status: ${status} | User: ${username} | Time: ${duration}ms${queryStr}${bodyStr}`);
  });

  next();
};

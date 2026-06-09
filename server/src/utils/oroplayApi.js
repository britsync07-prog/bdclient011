const API_BASE_URL = process.env.OROPLAY_BASE_URL || 'https://bs.sxvwlkohlv.com/api/v2';
const CLIENT_ID = process.env.OROPLAY_CLIENT_ID;
const CLIENT_SECRET = process.env.OROPLAY_CLIENT_SECRET;

let tokenCache = null;

async function createToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing OROPLAY_CLIENT_ID or OROPLAY_CLIENT_SECRET in environment.');
  }

  const response = await fetch(`${API_BASE_URL}/auth/createtoken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });

  if (!response.ok) {
    throw new Error(`CreateToken failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data?.token || !data?.expiration) {
    throw new Error('CreateToken returned invalid payload.');
  }

  tokenCache = {
    token: String(data.token),
    expiresAtUnix: Number(data.expiration),
  };

  return tokenCache.token;
}

async function getBearerToken() {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAtUnix - 30 > now) {
    return tokenCache.token;
  }
  return createToken();
}

/**
 * Fetch list of vendors
 * @returns {Promise<{status: number, data: any}>}
 */
exports.getVendors = async () => {
  const token = await getBearerToken();
  const response = await fetch(`${API_BASE_URL}/vendors/list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  const data = await response.json();
  return { status: response.status, data };
};

/**
 * Fetch list of games for a vendor
 * @param {string} vendorCode 
 * @param {string} language 
 * @returns {Promise<{status: number, data: any}>}
 */
exports.getGames = async (vendorCode, language = 'en') => {
  const token = await getBearerToken();
  const response = await fetch(`${API_BASE_URL}/games/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ vendorCode, language }),
  });

  const data = await response.json();
  return { status: response.status, data };
};

/**
 * Get launch URL for a game
 * @param {Object} payload - { vendorCode, gameCode, userCode, language, lobbyUrl, theme }
 * @returns {Promise<{status: number, data: any}>}
 */
exports.getLaunchUrl = async (payload) => {
  const token = await getBearerToken();
  const response = await fetch(`${API_BASE_URL}/game/launch-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return { status: response.status, data };
};

/**
 * Sets RTP for a specific user
 * @param {string} vendorCode
 * @param {string} userCode 
 * @param {number} rtp - RTP value (30-99)
 */
exports.setUserRTP = async (vendorCode, userCode, rtp) => {
  const token = await getBearerToken();
  const response = await fetch(`${API_BASE_URL}/game/user/set-rtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ vendorCode, userCode, rtp }),
  });

  const data = await response.json();
  return { status: response.status, data };
};

exports.getBearerToken = getBearerToken;

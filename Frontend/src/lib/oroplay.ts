const API_BASE_URL = process.env.OROPLAY_BASE_URL ?? "https://bs.sxvwlkohlv.com/api/v2";
const CLIENT_ID = process.env.OROPLAY_CLIENT_ID;
const CLIENT_SECRET = process.env.OROPLAY_CLIENT_SECRET;

interface TokenCache {
  token: string;
  expiresAtUnix: number;
}

let tokenCache: TokenCache | null = null;

function assertConfig() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing OROPLAY_CLIENT_ID or OROPLAY_CLIENT_SECRET in environment.");
  }
}

async function createToken(): Promise<string> {
  assertConfig();
  const response = await fetch(`${API_BASE_URL}/auth/createtoken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CreateToken failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data?.token || !data?.expiration) {
    throw new Error("CreateToken returned invalid payload.");
  }

  tokenCache = {
    token: String(data.token),
    expiresAtUnix: Number(data.expiration),
  };

  return tokenCache.token;
}

export async function getBearerToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAtUnix - 30 > now) {
    return tokenCache.token;
  }
  return createToken();
}

export const INTEGRATION_ENDPOINTS = {
  status: { method: "GET", path: "/status", auth: false },
  vendorsList: { method: "GET", path: "/vendors/list", auth: true },
  gamesList: { method: "POST", path: "/games/list", auth: true },
  gameDetail: { method: "POST", path: "/game/detail", auth: true },
  gameLaunchUrl: { method: "POST", path: "/game/launch-url", auth: true },
  bettingHistoryById: { method: "POST", path: "/betting/history/by-id", auth: true },
  transactionHistoryById: { method: "POST", path: "/transaction/history/by-id", auth: true },
  agentBalance: { method: "GET", path: "/agent/balance", auth: true },
  userCreate: { method: "POST", path: "/user/create", auth: true },
  userBalance: { method: "POST", path: "/user/balance", auth: true },
  userDeposit: { method: "POST", path: "/user/deposit", auth: true },
  userWithdraw: { method: "POST", path: "/user/withdraw", auth: true },
  userWithdrawAll: { method: "POST", path: "/user/withdraw-all", auth: true },
  userBalanceHistory: { method: "POST", path: "/user/balance-history", auth: true },
  setUserRtp: { method: "POST", path: "/game/user/set-rtp", auth: true },
  getUserRtp: { method: "POST", path: "/game/user/get-rtp", auth: true },
  resetUsersRtp: { method: "POST", path: "/game/users/reset-rtp", auth: true },
  bettingHistoryByDateV2: { method: "POST", path: "/betting/history/by-date-v2", auth: true },
  bettingHistoryDetailPage: { method: "POST", path: "/betting/history/detail", auth: true },
  batchUsersRtp: { method: "POST", path: "/game/users/batch-rtp", auth: true },
} as const;

export type EndpointKey = keyof typeof INTEGRATION_ENDPOINTS;

export async function callIntegrationApi(endpointKey: EndpointKey, payload?: unknown) {
  const endpoint = INTEGRATION_ENDPOINTS[endpointKey];
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (endpoint.auth) {
    const token = await getBearerToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
    method: endpoint.method,
    headers,
    body: endpoint.method === "POST" ? JSON.stringify(payload ?? {}) : undefined,
    cache: "no-store",
  });

  const raw = await response.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  return { status: response.status, data };
}

function parseBasicAuth(authHeader: string | null): { id: string; secret: string } | null {
  if (!authHeader || !authHeader.startsWith("Basic ")) return null;
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const index = decoded.indexOf(":");
  if (index <= 0) return null;
  return { id: decoded.slice(0, index), secret: decoded.slice(index + 1) };
}

export function validateSeamlessAuth(authHeader: string | null) {
  const creds = parseBasicAuth(authHeader);
  return !!creds && creds.id === CLIENT_ID && creds.secret === CLIENT_SECRET;
}

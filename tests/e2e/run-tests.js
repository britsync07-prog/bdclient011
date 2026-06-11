const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');
const bcrypt = require('bcryptjs');
const dns = require('dns');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}


// Set default DATABASE_URL for SQLite local environment
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:' + path.resolve(__dirname, '../../server/prisma/dev.db');

let PrismaClient;
try {
  PrismaClient = require(path.resolve(__dirname, '../../server/node_modules/@prisma/client')).PrismaClient;
} catch (e) {
  try {
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch (err) {
    console.error("Failed to load PrismaClient:", err);
    process.exit(1);
  }
}

const prisma = new PrismaClient();

// Config
const BACKEND_PORT = 5003;
const MOCK_PORT = 5002;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const MOCK_URL = `http://localhost:${MOCK_PORT}`;

let backendProcess = null;
let mockProcess = null;

// Helper: Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: HTTP requests
async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  return {
    status: res.status,
    ok: res.ok,
    data: isJson ? await res.json() : await res.text()
  };
}

async function get(url, headers = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers }
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  return {
    status: res.status,
    ok: res.ok,
    data: isJson ? await res.json() : await res.text()
  };
}

async function patch(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  return {
    status: res.status,
    ok: res.ok,
    data: isJson ? await res.json() : await res.text()
  };
}

async function put(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  return {
    status: res.status,
    ok: res.ok,
    data: isJson ? await res.json() : await res.text()
  };
}

// Database isolation: clear tables and seed default admin
async function resetDatabaseState() {
  console.log('\n--- Resetting Database & Mock Server State ---');
  
  // Clean tables using database-agnostic deleteMany()
  try {
    await prisma.transaction.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.siteSetting.deleteMany();
  } catch (e) {
    console.log(`Warning: Failed to clean database tables: ${e.message}`);
  }

  // Seed default admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      balance: 999999.00,
      referralCode: 'SYSTEM_ADMIN'
    }
  });

  // Seed Default Site Settings
  const defaultSettings = [
    { key: 'about_us', value: 'Welcome to PBBET, the premier destination for live casino and slots.' },
    { key: 'social_facebook', value: 'https://facebook.com/pbbet' },
    { key: 'social_twitter', value: 'https://twitter.com/pbbet' },
    { key: 'social_instagram', value: 'https://instagram.com/pbbet' },
    { key: 'contact_email', value: 'support@pbbet.com' }
  ];
  for (const setting of defaultSettings) {
    await prisma.siteSetting.create({ data: setting });
  }

  // Seed default Banner
  await prisma.banner.create({
    data: {
      title: 'Welcome to PBBET!',
      imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop',
      linkUrl: '/games',
      isActive: true,
      order: 1
    }
  });

  console.log('Database seeded with admin, site settings, and banner.');

  // Reset Mock OroPlay Server State
  try {
    await post(`${MOCK_URL}/sim/clear`, {});
    console.log('Mock OroPlay Server state cleared.');
  } catch (e) {
    console.log('Warning: Could not clear mock server state:', e.message);
  }
}

// Start processes
async function startServers() {
  console.log('Starting Mock OroPlay Server and PBBET Backend Server...');

  const commonEnv = {
    ...process.env,
    OROPLAY_BASE_URL: `${MOCK_URL}/api/v2`,
    OROPLAY_CLIENT_ID: 'RSU2',
    OROPLAY_CLIENT_SECRET: 'UoHxygREc2f238EbEBYxEjMR3xoZJP55',
    JWT_SECRET: 'pbbet_super_secret_jwt_2026',
    OPERATOR_BASE_URL: BACKEND_URL,
  };

  // Spawn Mock OroPlay Server
  mockProcess = spawn('node', [path.join(__dirname, 'mockOroPlayServer.js')], {
    env: { ...commonEnv, PORT: String(MOCK_PORT) },
    stdio: 'pipe'
  });

  mockProcess.stdout.on('data', (data) => {
    console.log(`[MOCK] ${data.toString().trim()}`);
  });
  mockProcess.stderr.on('data', (data) => {
    console.error(`[MOCK ERROR] ${data.toString().trim()}`);
  });

  mockProcess.on('error', (err) => {
    console.error('Failed to start mock process:', err);
  });
  mockProcess.on('exit', (code, signal) => {
    console.log(`Mock process exited with code ${code} and signal ${signal}`);
  });

  // Spawn PBBET Backend Server
  backendProcess = spawn('node', [path.resolve(__dirname, '../../server/src/server.js')], {
    env: { ...commonEnv, PORT: String(BACKEND_PORT) },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[BACKEND] ${data.toString().trim()}`);
  });
  backendProcess.stderr.on('data', (data) => {
    console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend process:', err);
  });
  backendProcess.on('exit', (code, signal) => {
    console.log(`Backend process exited with code ${code} and signal ${signal}`);
  });

  // Wait for servers to be online
  console.log('Waiting for servers to boot...');
  let attempts = 0;
  while (attempts < 50) {
    try {
      const mockRes = await get(`${MOCK_URL}/api/v2/status`);
      const backendRes = await get(`${BACKEND_URL}/health`);
      if (mockRes.status === 200 && backendRes.status === 200) {
        console.log('Both servers are online and healthy!');
        return;
      }
    } catch (e) {
      console.log('Boot check attempt failed with error:', e.message || e);
    }
    await sleep(200);
    attempts++;
  }
  throw new Error('Failed to start servers or they did not respond in time.');
}

// Shut down processes
function stopServers() {
  console.log('\nShutting down servers...');
  if (backendProcess) {
    backendProcess.kill();
    console.log('Backend server process killed.');
  }
  if (mockProcess) {
    mockProcess.kill();
    console.log('Mock server process killed.');
  }
}

// Test Runner
async function runAllTiers() {
  let failedTests = 0;
  const assertTest = (condition, msg) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      failedTests++;
    }
  };

  // ----------------------------------------------------
  // TIER 1: Feature Coverage (Happy Paths)
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log('TIER 1: Feature Coverage (Happy Path Tests)');
  console.log('==================================================');
  await resetDatabaseState();

  let adminToken = '';
  let userToken = '';
  let userId = null;
  let oroToken = '';

  // 1. Auth: Admin Login
  const loginRes = await post(`${BACKEND_URL}/api/auth/login`, { username: 'admin', password: 'admin123' });
  assertTest(loginRes.status === 200 && loginRes.data?.token, 'Admin login successfully returns JWT token');
  adminToken = loginRes.data?.token;

  // Get OroPlay Bearer Token
  const oroRes = await post(`${MOCK_URL}/api/v2/auth/createtoken`, {
    clientId: 'RSU2',
    clientSecret: 'UoHxygREc2f238EbEBYxEjMR3xoZJP55'
  });
  oroToken = oroRes.data?.token;

  // 2. CMS Settings retrieval
  const getSettingsRes = await get(`${BACKEND_URL}/api/user/settings`);
  assertTest(getSettingsRes.status === 200 && getSettingsRes.data?.success && getSettingsRes.data?.data?.about_us, 'Public Settings endpoint returns details');

  // 3. CMS Banners retrieval
  const getBannersRes = await get(`${BACKEND_URL}/api/user/banners`);
  assertTest(getBannersRes.status === 200 && getBannersRes.data?.success && Array.isArray(getBannersRes.data?.data), 'Public Banners endpoint returns banners array');

  // 4. Admin update CMS settings
  const updateSettingsRes = await put(`${BACKEND_URL}/api/admin/settings`, { about_us: 'Updated via Tier 1 Test' }, { 'Authorization': `Bearer ${adminToken}` });
  assertTest(updateSettingsRes.status === 200 && updateSettingsRes.data?.success, 'Admin can update CMS settings');

  // 5. Fetch Games List (integration call through backend to mock OroPlay)
  const getGamesRes = await get(`${BACKEND_URL}/api/user/games`);
  assertTest(getGamesRes.status === 200 && Array.isArray(getGamesRes.data?.games) && getGamesRes.data.games.length > 0, 'Fetch Games successfully pulls from mock OroPlay');

  // 6. Launch Game (integration call)
  const launchRes = await post(`${BACKEND_URL}/api/user/launch`, { vendorCode: 'slot-pragmatic', gameCode: 'vs20olympgate' }, { 'Authorization': `Bearer ${adminToken}` });
  assertTest(launchRes.status === 200 && launchRes.data?.launchUrl, 'Launching game returns game launch URL');

  // Register a normal user for wallet callbacks
  const registerRes = await post(`${BACKEND_URL}/api/auth/register`, { username: 'testuser', password: 'Password123!' });
  assertTest(registerRes.status === 201 && registerRes.data?.token, 'Normal user register successfully returns JWT');
  userToken = registerRes.data?.token;
  userId = registerRes.data?.user?.id;

  // 7. Balance Fetching Callback (from mock server to operator backend)
  const simBalanceRes = await post(`${MOCK_URL}/sim/play`, { userCode: String(userId) });
  assertTest(simBalanceRes.status === 200 && simBalanceRes.data?.success, 'Seamless Wallet callback GET /api/balance returns balance');

  // 8. Deposit / Single Bet & Win Transactions
  const simPlayRes = await post(`${MOCK_URL}/sim/play`, {
    userCode: String(userId),
    betAmount: 100,
    winAmount: 250,
    gameCode: 'vs20olympgate',
    vendorCode: 'slot-pragmatic'
  });
  assertTest(simPlayRes.status === 200 && simPlayRes.data?.success, 'Seamless single bet (-100) and win (+250) returns success');

  // Verify balance has increased from 10000 to 10150
  const profileRes = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${userToken}` });
  assertTest(profileRes.status === 200 && Number(profileRes.data?.balance) === 10150, `User profile balance is correctly updated to 10150 (got: ${profileRes.data?.balance})`);


  // ----------------------------------------------------
  // TIER 2: Boundary & Corner Cases
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log('TIER 2: Boundary & Corner Cases');
  console.log('==================================================');
  await resetDatabaseState();

  // Create a user with 0 balance
  const zeroUserRegister = await post(`${BACKEND_URL}/api/auth/register`, { username: 'zerouser', password: 'Password123!' });
  const zeroUserId = zeroUserRegister.data?.user?.id;
  // Update balance to 0 in database directly via prisma
  await prisma.user.update({
    where: { id: zeroUserId },
    data: { balance: 0.00 }
  });

  // 1. Handling Zero/Negative balances (insufficient balance callback check)
  const simZeroBet = await post(`${MOCK_URL}/sim/play`, {
    userCode: String(zeroUserId),
    betAmount: 10.00
  });
  // Should fail because balance is 0 and bet is 10.
  assertTest(
    simZeroBet.status === 200 && 
    simZeroBet.data?.success === false && 
    simZeroBet.data?.trace?.some(t => t.response?.errorCode === 4), 
    'Zero balance user betting returns INSUFFICIENT_USER_BALANCE (errorCode 4)'
  );

  // 2. Invalid User Code (callback for non-existent user)
  const simInvalidUser = await post(`${MOCK_URL}/sim/play`, {
    userCode: '999999',
    betAmount: 10.00
  });
  assertTest(
    simInvalidUser.status === 200 && 
    simInvalidUser.data?.success === false && 
    simInvalidUser.data?.trace?.some(t => t.response?.errorCode === 2), 
    'Invalid userCode returns USER_DOES_NOT_EXIST (errorCode 2)'
  );

  // 3. Overflow Amounts (extremely high bet exceeding balance)
  const overflowUser = await post(`${BACKEND_URL}/api/auth/register`, { username: 'overflowuser', password: 'Password123!' });
  const overflowUserId = overflowUser.data?.user?.id;
  const simOverflow = await post(`${MOCK_URL}/sim/play`, {
    userCode: String(overflowUserId),
    betAmount: 99999999999.00
  });
  assertTest(
    simOverflow.status === 200 && 
    simOverflow.data?.success === false && 
    simOverflow.data?.trace?.some(t => t.response?.errorCode === 4), 
    'Excessive bet amount returns INSUFFICIENT_USER_BALANCE'
  );

  // 4. Basic Auth Failure
  const simAuthFail = await post(`${MOCK_URL}/sim/play`, {
    userCode: String(overflowUserId),
    betAmount: 10.00,
    invalidAuth: true
  });
  assertTest(
    simAuthFail.status === 200 && 
    simAuthFail.data?.success === false && 
    simAuthFail.data?.trace?.some(t => t.status === 401), 
    'Basic Auth failure triggers 401 Unauthorized callback response'
  );

  // 5. Token Expiration / Invalid Token on OroPlay Endpoints
  const mockVendorsInvalidToken = await get(`${MOCK_URL}/api/v2/vendors/list`, { 'Authorization': 'Bearer invalidtoken_string' });
  assertTest(mockVendorsInvalidToken.status === 401, 'Mock OroPlay integration endpoint rejects invalid Bearer token with 401');

  // 6. Invalid Payloads (RTP boundaries check)
  const rtpResTooLow = await post(`${MOCK_URL}/api/v2/game/user/set-rtp`, { vendorCode: 'slot-pragmatic', userCode: 'testuser', rtp: 15 }, { 'Authorization': `Bearer ${oroToken}` });
  assertTest(rtpResTooLow.status === 200 && rtpResTooLow.data?.success === false && rtpResTooLow.data?.errorCode === 1, 'Mock OroPlay setUserRtp rejects RTP < 30');

  const rtpResTooHigh = await post(`${MOCK_URL}/api/v2/game/user/set-rtp`, { vendorCode: 'slot-pragmatic', userCode: 'testuser', rtp: 120 }, { 'Authorization': `Bearer ${oroToken}` });
  assertTest(rtpResTooHigh.status === 200 && rtpResTooHigh.data?.success === false && rtpResTooHigh.data?.errorCode === 1, 'Mock OroPlay setUserRtp rejects RTP > 99');
  // 7. Invalid KYC Status (Validation check)
  const loginKYC = await post(`${BACKEND_URL}/api/auth/login`, { username: 'admin', password: 'admin123' });
  const resKYC = await fetch(`${BACKEND_URL}/api/admin/users/${overflowUserId}/kyc`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${loginKYC.data?.token}` },
    body: JSON.stringify({ kycStatus: 'INVALID' })
  });
  const dataKYC = await resKYC.json();
  assertTest(resKYC.status === 400, 'Admin updating KYC with invalid enum value returns 400 status');




  // ----------------------------------------------------
  // TIER 3: Cross-Feature Combinations
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log('TIER 3: Cross-Feature Combinations');
  console.log('==================================================');
  await resetDatabaseState();

  const crossUser = await post(`${BACKEND_URL}/api/auth/register`, { username: 'crossuser', password: 'Password123!' });
  const crossUserId = crossUser.data?.user?.id;
  const crossUserToken = crossUser.data?.token;

  // 1. Multiple Bets (sequential deductions)
  // Balance starts at 10000. Play 3 bets of 50.00.
  const play1 = await post(`${MOCK_URL}/sim/play`, { userCode: String(crossUserId), betAmount: 50.00 });
  const play2 = await post(`${MOCK_URL}/sim/play`, { userCode: String(crossUserId), betAmount: 50.00 });
  const play3 = await post(`${MOCK_URL}/sim/play`, { userCode: String(crossUserId), betAmount: 50.00 });
  assertTest(play1.data?.success && play2.data?.success && play3.data?.success, 'Three sequential bets succeed');

  let profile = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${crossUserToken}` });
  assertTest(Number(profile.data?.balance) === 9850, `Balance decremented correctly to 9850 (got: ${profile.data?.balance})`);

  // 2. Bets followed by Wins
  // Play a bet of 200, then win of 800 in the same flow.
  const playBetWin = await post(`${MOCK_URL}/sim/play`, { userCode: String(crossUserId), betAmount: 200, winAmount: 800 });
  assertTest(playBetWin.data?.success, 'Bet followed by win round succeeds');
  profile = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${crossUserToken}` });
  assertTest(Number(profile.data?.balance) === 10450, `Balance updated correctly to 10450 after bet & win (got: ${profile.data?.balance})`);

  // 3. Deposit followed by Bet (via mock OroPlay transfer wallet mode, then play)
  // Deposit 500 to the mock OroPlay server wallet itself
  const depMockRes = await post(`${MOCK_URL}/api/v2/user/deposit`, { userCode: 'mockplayer1', balance: 500, orderNo: 'dep_mock_1', vendorCode: 'slot-pragmatic' }, { 'Authorization': `Bearer ${oroToken}` });
  assertTest(depMockRes.status === 200 && depMockRes.data?.success, 'Mock OroPlay Transfer Wallet deposit succeeds');

  // 4. Sequential Batch-Transactions (and Idempotency)
  // Send a batch transaction callback
  const txCode1 = 'tx_batch_combo_1';
  const txCode2 = 'tx_batch_combo_2';
  const batchRes1 = await post(`${MOCK_URL}/sim/play`, {
    userCode: String(crossUserId),
    transactions: [
      { transactionCode: txCode1, amount: -150.00 },
      { transactionCode: txCode2, amount: 400.00 }
    ]
  });
  assertTest(batchRes1.status === 200 && batchRes1.data?.success, 'Batch transaction containing bet (-150) and win (+400) callback succeeds');
  profile = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${crossUserToken}` });
  assertTest(Number(profile.data?.balance) === 10700, `Balance is 10700 after batch (+250 net) (got: ${profile.data?.balance})`);

  // Send the same batch again to verify idempotency
  const batchRes2 = await post(`${MOCK_URL}/sim/play`, {
    userCode: String(crossUserId),
    transactions: [
      { transactionCode: txCode1, amount: -150.00 },
      { transactionCode: txCode2, amount: 400.00 }
    ]
  });
  assertTest(batchRes2.status === 200 && batchRes2.data?.success, 'Resending the duplicate batch callback returns success (skipping duplicate transactions)');
  profile = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${crossUserToken}` });
  assertTest(Number(profile.data?.balance) === 10700, `Balance remains at 10700 (idempotency maintained)`);


  // ----------------------------------------------------
  // TIER 4: Real-World Workloads
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log('TIER 4: Real-World Application Workloads');
  console.log('==================================================');
  await resetDatabaseState();

  // Re-login to get a fresh admin token after database reset
  const loginRes4 = await post(`${BACKEND_URL}/api/auth/login`, { username: 'admin', password: 'admin123' });
  adminToken = loginRes4.data?.token;

  // 1. User Signup
  const signupRes = await post(`${BACKEND_URL}/api/auth/register`, { username: 'realuser', password: 'Password123!' });
  assertTest(signupRes.status === 201 && signupRes.data?.token, 'Real-world signup succeeds');
  const realUserToken = signupRes.data?.token;
  const realUserId = signupRes.data?.user?.id;

  // 2. KYC Status Update
  // Admin updates kycStatus to APPROVED
  const kycRes = await patch(`${BACKEND_URL}/api/admin/users/${realUserId}/kyc`, { kycStatus: 'APPROVED' }, { 'Authorization': `Bearer ${adminToken}` });
  assertTest(kycRes.status === 200 && kycRes.data?.user?.kycStatus === 'APPROVED', 'Admin approves KYC status for realuser');

  // 3. Manual Deposit & Approval
  // Insert a PENDING deposit transaction in DB
  const manualTx = await prisma.transaction.create({
    data: {
      userId: realUserId,
      amount: 5000.00,
      type: 'DEPOSIT',
      status: 'PENDING',
      transactionCode: 'manual_dep_98765'
    }
  });
  assertTest(manualTx.id && manualTx.status === 'PENDING', 'Pending deposit transaction inserted into DB');

  // Admin gets financial requests
  const financialRequests = await get(`${BACKEND_URL}/api/admin/financial-requests`, { 'Authorization': `Bearer ${adminToken}` });
  const requestsList = Array.isArray(financialRequests.data) ? financialRequests.data : (financialRequests.data?.requests || []);
  assertTest(financialRequests.status === 200 && requestsList.some(r => r.id === manualTx.id), 'Admin lists pending requests and finds the deposit');

  // Admin approves financial request
  const approveRes = await post(`${BACKEND_URL}/api/admin/financial-requests/${manualTx.id}/approve`, {}, { 'Authorization': `Bearer ${adminToken}` });
  assertTest(approveRes.status === 200 && approveRes.data?.message?.includes('approved successfully'), 'Admin approves deposit request');

  // Re-approve the same financial request (should fail)
  const reApproveRes = await post(`${BACKEND_URL}/api/admin/financial-requests/${manualTx.id}/approve`, {}, { "Authorization": `Bearer ${adminToken}` });
  assertTest(reApproveRes.status === 400 && reApproveRes.data?.message === "Invalid or already processed transaction", "Re-approving an already SUCCESS transaction fails with 400");

  // Approve a non-existent financial request (should fail)
  const nonExistentId = 999999;
  const failApproveRes = await post(`${BACKEND_URL}/api/admin/financial-requests/${nonExistentId}/approve`, {}, { "Authorization": `Bearer ${adminToken}` });
  assertTest(failApproveRes.status === 400 && failApproveRes.data?.message === "Invalid or already processed transaction", "Approving a non-existent transaction ID fails with 400");

  // Check balance after manual deposit approval (Starts at 10000 + 5000 = 15000)
  profile = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${realUserToken}` });
  assertTest(Number(profile.data?.balance) === 15000, `Realuser balance is 15000 after deposit approval (got: ${profile.data?.balance})`);

  // 4. Multiple Game Plays
  // Play 1: Bet 50, Win 20 (net -30)
  const gp1 = await post(`${MOCK_URL}/sim/play`, { userCode: String(realUserId), betAmount: 50, winAmount: 20 });
  // Play 2: Bet 100, Win 300 (net +200)
  const gp2 = await post(`${MOCK_URL}/sim/play`, { userCode: String(realUserId), betAmount: 100, winAmount: 300 });
  // Play 3: Bet 250, Win 0 (net -250)
  const gp3 = await post(`${MOCK_URL}/sim/play`, { userCode: String(realUserId), betAmount: 250, winAmount: 0 });
  assertTest(gp1.data?.success && gp2.data?.success && gp3.data?.success, 'Realuser performs three game plays');

  // Net changes: 15000 - 30 + 200 - 250 = 14920.
  // 5. Final Balance Retrieval & verification
  profile = await get(`${BACKEND_URL}/api/user/profile`, { 'Authorization': `Bearer ${realUserToken}` });
  assertTest(Number(profile.data?.balance) === 14920, `Final realuser balance is exactly 14920 (got: ${profile.data?.balance})`);

  const operatorBalanceDirect = await post(`${BACKEND_URL}/api/balance`, { userCode: String(realUserId) }, {
    'Authorization': 'Basic ' + Buffer.from('RSU2:UoHxygREc2f238EbEBYxEjMR3xoZJP55').toString('base64')
  });
  assertTest(operatorBalanceDirect.status === 200 && operatorBalanceDirect.data?.message === '14920', `Operator callback directly returns "14920" (got: ${operatorBalanceDirect.data?.message})`);

  // 6. Set user game RTP
  const rtpRes = await post(`${BACKEND_URL}/api/admin/game/set-rtp`, { vendorCode: 'slot-pragmatic', username: 'realuser', rtp: 92 }, { 'Authorization': `Bearer ${adminToken}` });
  assertTest(rtpRes.status === 200 && rtpRes.data?.message?.includes('RTP set successfully'), 'Admin updates game RTP for realuser to 92');

  // Verify the mock server saved the RTP setting
  const getRtpMock = await post(`${MOCK_URL}/api/v2/game/user/get-rtp`, { vendorCode: 'slot-pragmatic', userCode: 'realuser' }, { 'Authorization': `Bearer ${oroToken}` });
  assertTest(getRtpMock.status === 200 && getRtpMock.data?.message === 92, 'Mock OroPlay verifies realuser RTP is indeed 92');

  // 7. Error handling for RTP update failure from OroPlay
  const rtpErrorRes = await post(`${BACKEND_URL}/api/admin/game/set-rtp`, { vendorCode: 'slot-pragmatic', username: 'rtp_error_user', rtp: 92 }, { 'Authorization': `Bearer ${adminToken}` });
  assertTest(rtpErrorRes.status === 500 && rtpErrorRes.data?.message?.includes('Failed to set RTP via OroPlay'), 'Admin RTP update fails gracefully when OroPlay returns 500');


  // ----------------------------------------------------
  // SUMMARY OF ALL RUNS
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log('E2E Verification Summary');
  console.log('==================================================');
  if (failedTests === 0) {
    console.log('🎉 ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  } else {
    console.error(`💥 TEST SUITE FAILED with ${failedTests} failures. 💥`);
  }

  return failedTests === 0;
}

// Main execution
async function main() {
  let success = false;
  try {
    await startServers();
    success = await runAllTiers();
  } catch (error) {
    console.error('Fatal test runner error:', error);
  } finally {
    stopServers();
    await prisma.$disconnect();
    process.exit(success ? 0 : 1);
  }
}

main();

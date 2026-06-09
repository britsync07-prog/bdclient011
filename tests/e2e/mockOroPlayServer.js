const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.OROPLAY_PORT || process.env.PORT || 5002;
const JWT_SECRET = 'mock_oroplay_secret_key_2026';

// In-Memory state for simulation
const userBalances = {};
const userRtps = {};
const bettingHistoryStore = {};
const transactionHistoryStore = {};
const balanceHistories = {};

// 0. Token creation
app.post('/api/v2/auth/createtoken', (req, res) => {
  const { clientId, clientSecret } = req.body;
  const expectedClientId = process.env.OROPLAY_CLIENT_ID || 'RSU2';
  const expectedClientSecret = process.env.OROPLAY_CLIENT_SECRET || 'UoHxygREc2f238EbEBYxEjMR3xoZJP55';

  if (!clientId || !clientSecret || clientId !== expectedClientId || clientSecret !== expectedClientSecret) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid client credentials',
      errorCode: 401
    });
  }

  const expiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiration
  const token = jwt.sign({ clientId, exp: expiration }, JWT_SECRET);

  return res.json({
    token,
    expiration
  });
});

// Bearer Token Validation Middleware
const bearerTokenValidator = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid Bearer token',
      errorCode: 401
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.clientId = decoded.clientId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Token is invalid or expired',
      errorCode: 401
    });
  }
};

// 1. status (No Auth required)
app.get('/api/v2/status', (req, res) => {
  res.json({
    success: true,
    message: 'success',
    errorCode: 0
  });
});

// Apply Bearer validation to all other /api/v2 endpoints
app.use('/api/v2', bearerTokenValidator);

// 2. vendorsList
app.get('/api/v2/vendors/list', (req, res) => {
  res.json({
    success: true,
    message: [
      {
        vendorCode: 'slot-pragmatic',
        type: 2,
        name: 'Pragmatic Slot',
        url: 'http://localhost:5002/vendors/pragmatic'
      },
      {
        vendorCode: 'casino-evolution',
        type: 1,
        name: 'Evolution Gaming',
        url: 'http://localhost:5002/vendors/evolution'
      }
    ],
    errorCode: 0
  });
});

// 3. gamesList
app.post('/api/v2/games/list', (req, res) => {
  const { vendorCode } = req.body;
  let games = [];

  if (vendorCode === 'slot-pragmatic') {
    const slotNames = ["Gates of Olympus", "The Dog House", "Sweet Bonanza", "Sugar Rush", "Starlight Princess", "Big Bass Bonanza", "Fruit Party", "Cleopatra", "Wild West Gold", "Book of Tut"];
    
    for (let i = 1; i <= 350; i++) {
      const baseName = slotNames[i % slotNames.length];
      const name = `${baseName} ${Math.floor(i / slotNames.length) + 1}`;
      const img = `https://picsum.photos/400/300?random=${i}`;
      games.push({
        provider: 'Pragmatic Play',
        vendorCode: 'slot-pragmatic',
        gameId: `pragmatic_${i}`,
        gameCode: `pragmatic_${i}`,
        gameName: name,
        slug: `pragmatic-game-${i}`,
        thumbnail: img,
        updatedAt: new Date().toISOString(),
        isNew: i % 15 === 0,
        underMaintenance: false
      });
    }
  } else if (vendorCode === 'casino-evolution') {
    const liveNames = ["MONOPOLY Big Baller", "Crazy Time", "Lightning Roulette", "Live Blackjack", "Dream Catcher", "Mega Ball", "Deal or No Deal", "Super Sic Bo"];
    
    for (let i = 1; i <= 150; i++) {
      const baseName = liveNames[i % liveNames.length];
      const name = `${baseName} ${Math.floor(i / liveNames.length) + 1}`;
      const img = `https://picsum.photos/400/300?random=${i + 350}`;
      games.push({
        provider: 'Evolution',
        vendorCode: 'casino-evolution',
        gameId: `evolution_${i}`,
        gameCode: `evolution_${i}`,
        gameName: name,
        slug: `evolution-game-${i}`,
        thumbnail: img,
        updatedAt: new Date().toISOString(),
        isNew: i % 10 === 0,
        underMaintenance: false
      });
    }
  }

  res.json({
    success: true,
    message: games,
    errorCode: 0
  });
});

// 4. gameDetail
app.post('/api/v2/game/detail', (req, res) => {
  const { vendorCode, gameCode } = req.body;
  res.json({
    success: true,
    message: {
      provider: vendorCode === 'slot-pragmatic' ? 'Pragmatic Play' : 'Evolution',
      vendorCode,
      gameId: gameCode,
      gameCode,
      gameName: gameCode === 'vs20olympgate' ? 'Gates of Olympus' : 'Mock Game Detail',
      slug: `${vendorCode}-${gameCode}`,
      thumbnail: 'https://mock-thumbnail.jpg',
      updatedAt: '2026-05-20T13:25:40.224Z',
      isNew: false,
      underMaintenance: false
    },
    errorCode: 0
  });
});

// 5. gameLaunchUrl
app.post('/api/v2/game/launch-url', (req, res) => {
  const { vendorCode, gameCode, userCode, language, lobbyUrl, theme } = req.body;
  res.json({
    success: true,
    message: `http://localhost:5002/play/game?vendorCode=${vendorCode}&gameCode=${gameCode}&userCode=${userCode}&lang=${language || 'en'}`,
    errorCode: 0
  });
});

// 6. bettingHistoryById
app.post('/api/v2/betting/history/by-id', (req, res) => {
  const { id } = req.body;
  const history = bettingHistoryStore[id] || {
    id: Number(id),
    userCode: 'testuser',
    roundId: 'round_mock_id',
    gameCode: 'vs20olympgate',
    vendorCode: 'slot-pragmatic',
    betAmount: 10.00,
    winAmount: 0.00,
    beforeBalance: 100.00,
    afterBalance: 90.00,
    detail: '',
    status: 1,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000)
  };

  res.json({
    success: true,
    errorCode: 0,
    message: history
  });
});

// 7. transactionHistoryById
app.post('/api/v2/transaction/history/by-id', (req, res) => {
  const { id } = req.body;
  const history = transactionHistoryStore[id] || [
    {
      id: Number(id),
      userCode: 'testuser',
      roundId: 'round_mock_id',
      wagerId: 'wager_mock_id',
      gameCode: 'vs20olympgate',
      vendorCode: 'slot-pragmatic',
      amount: -10.00,
      status: 0,
      isFinished: false,
      isCanceled: false,
      beforeBalance: 100.00,
      gameType: 2,
      transactionCode: `tx_mock_${id}`,
      detail: '',
      createdAt: '2026-06-07 14:00:00'
    }
  ];

  res.json({
    success: true,
    errorCode: 0,
    message: history
  });
});

// 8. agentBalance
app.get('/api/v2/agent/balance', (req, res) => {
  res.json({
    success: true,
    message: 100000.00,
    errorCode: 0
  });
});

// 9. userCreate
app.post('/api/v2/user/create', (req, res) => {
  const { userCode } = req.body;
  if (!userCode) {
    return res.json({ success: false, errorCode: 1, message: 'Missing userCode' });
  }
  userBalances[userCode] = userBalances[userCode] || 0.00;
  res.json({
    success: true,
    errorCode: 0
  });
});

// 10. userBalance
app.post('/api/v2/user/balance', (req, res) => {
  const { userCode } = req.body;
  res.json({
    success: true,
    message: userBalances[userCode] !== undefined ? userBalances[userCode] : 1000.00,
    errorCode: 0
  });
});

// 11. userDeposit
app.post('/api/v2/user/deposit', (req, res) => {
  const { userCode, balance, orderNo, vendorCode } = req.body;
  const depositAmount = parseFloat(balance);
  const current = userBalances[userCode] !== undefined ? userBalances[userCode] : 1000.00;
  const nextBalance = current + depositAmount;
  userBalances[userCode] = nextBalance;

  balanceHistories[orderNo] = {
    userCode,
    amount: depositAmount,
    agentBeforeBalance: 100000.00,
    userBeforeBalance: current,
    type: 1,
    createdAt: Math.floor(Date.now() / 1000)
  };

  res.json({
    success: true,
    message: nextBalance,
    errorCode: 0
  });
});

// 12. userWithdraw
app.post('/api/v2/user/withdraw', (req, res) => {
  const { userCode, balance, orderNo, vendorCode } = req.body;
  const withdrawAmount = parseFloat(balance);
  const current = userBalances[userCode] !== undefined ? userBalances[userCode] : 1000.00;
  
  if (current < withdrawAmount) {
    return res.json({
      success: false,
      message: 'Insufficient balance',
      errorCode: 4
    });
  }

  const nextBalance = current - withdrawAmount;
  userBalances[userCode] = nextBalance;

  balanceHistories[orderNo] = {
    userCode,
    amount: withdrawAmount,
    agentBeforeBalance: 100000.00,
    userBeforeBalance: current,
    type: 2,
    createdAt: Math.floor(Date.now() / 1000)
  };

  res.json({
    success: true,
    message: nextBalance,
    errorCode: 0
  });
});

// 13. userWithdrawAll
app.post('/api/v2/user/withdraw-all', (req, res) => {
  const { userCode, vendorCode } = req.body;
  const current = userBalances[userCode] !== undefined ? userBalances[userCode] : 1000.00;
  userBalances[userCode] = 0.00;

  res.json({
    success: true,
    message: current,
    errorCode: 0
  });
});

// 14. userBalanceHistory
app.post('/api/v2/user/balance-history', (req, res) => {
  const { orderNo } = req.body;
  const history = balanceHistories[orderNo] || {
    userCode: 'testuser1',
    amount: 1000.00,
    agentBeforeBalance: 100000.00,
    userBeforeBalance: 2000.00,
    type: 1,
    createdAt: Math.floor(Date.now() / 1000)
  };

  res.json({
    success: true,
    errorCode: 0,
    message: history
  });
});

// 15. setUserRtp
app.post('/api/v2/game/user/set-rtp', (req, res) => {
  const { vendorCode, userCode, rtp } = req.body;
  const rtpInt = parseInt(rtp);
  if (isNaN(rtpInt) || rtpInt < 30 || rtpInt > 99) {
    return res.json({
      success: false,
      message: 'rtp must be an integer between 30 and 99',
      errorCode: 1
    });
  }
  userRtps[`${vendorCode}:${userCode}`] = rtpInt;
  res.json({
    success: true,
    errorCode: 0
  });
});

// 16. getUserRtp
app.post('/api/v2/game/user/get-rtp', (req, res) => {
  const { vendorCode, userCode } = req.body;
  res.json({
    success: true,
    message: userRtps[`${vendorCode}:${userCode}`] !== undefined ? userRtps[`${vendorCode}:${userCode}`] : 85,
    errorCode: 0
  });
});

// 17. resetUsersRtp
app.post('/api/v2/game/users/reset-rtp', (req, res) => {
  const { vendorCode, rtp } = req.body;
  const rtpInt = parseInt(rtp);
  res.json({
    success: true,
    message: rtpInt,
    errorCode: 0
  });
});

// 18. bettingHistoryByDateV2
app.post('/api/v2/betting/history/by-date-v2', (req, res) => {
  const { startDate, limit } = req.body;
  res.json({
    success: true,
    errorCode: 0,
    message: {
      limit: limit || 5000,
      nextStartDate: new Date().toISOString().split('.')[0],
      histories: Object.values(bettingHistoryStore)
    }
  });
});

// 19. bettingHistoryDetailPage
app.post('/api/v2/betting/history/detail', (req, res) => {
  const { id, language } = req.body;
  res.json({
    success: true,
    message: `http://localhost:5002/betting/history/detail?id=${id}&lang=${language || 'en'}`,
    errorCode: 0
  });
});

// 20. batchUsersRtp
app.post('/api/v2/game/users/batch-rtp', (req, res) => {
  const { vendorCode, data } = req.body;
  if (data && Array.isArray(data)) {
    data.forEach(item => {
      userRtps[`${vendorCode}:${item.userCode}`] = parseInt(item.rtp);
    });
  }
  res.json({
    success: true,
    errorCode: 0
  });
});


// SIMULATOR ENDPOINT: /sim/play
// Triggers Basic Auth authenticated seamless callbacks to the PBBET operator Express backend
app.post('/sim/play', async (req, res) => {
  const {
    userCode,
    betAmount,
    winAmount,
    gameCode,
    vendorCode,
    transactions,
    customTransaction,
    invalidAuth,
    useWrongUserCode
  } = req.body;

  const operatorBaseUrl = process.env.OPERATOR_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const clientId = process.env.OROPLAY_CLIENT_ID || 'RSU2';
  const clientSecret = process.env.OROPLAY_CLIENT_SECRET || 'UoHxygREc2f238EbEBYxEjMR3xoZJP55';

  const authHeader = invalidAuth 
    ? 'Basic invalid_credentials_base64'
    : 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const trace = [];

  const callOperator = async (path, payload) => {
    try {
      const response = await fetch(`${operatorBaseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      });
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
      trace.push({ path, status: response.status, request: payload, response: data });
      return { status: response.status, data };
    } catch (err) {
      trace.push({ path, error: err.message, request: payload });
      return { status: 500, error: err.message };
    }
  };

  const finalUserCode = useWrongUserCode || userCode;

  // Scenario 1: Batch Transactions
  if (transactions && Array.isArray(transactions)) {
    const result = await callOperator('/api/batch-transactions', {
      userCode: finalUserCode,
      transactions
    });
    return res.json({ success: result.status === 200 && result.data?.success, trace });
  }

  // Scenario 2: Custom direct transaction payload
  if (customTransaction) {
    const result = await callOperator('/api/transaction', customTransaction);
    return res.json({ success: result.status === 200 && result.data?.success, trace });
  }

  // Scenario 3: Standard Bet/Win Flow
  // Step A: Check Balance
  const balanceResult = await callOperator('/api/balance', { userCode: finalUserCode });
  if (balanceResult.status !== 200 || !balanceResult.data?.success) {
    return res.json({ success: false, message: 'Balance check failed', trace });
  }

  let finalSuccess = true;

  // Step B: Send Bet Transaction if present
  if (betAmount !== undefined && parseFloat(betAmount) > 0) {
    const betPayload = {
      userCode: finalUserCode,
      vendorCode: vendorCode || 'slot-pragmatic',
      gameCode: gameCode || 'vs20olympgate',
      historyId: Math.floor(Math.random() * 1000000) + 1,
      roundId: 'round_' + Date.now(),
      gameType: 2,
      transactionCode: 'tx_bet_' + Math.random().toString(36).substring(2, 11),
      isFinished: false,
      isCanceled: false,
      amount: -parseFloat(betAmount),
      detail: '{}',
      createdAt: new Date().toISOString()
    };
    const betResult = await callOperator('/api/transaction', betPayload);
    if (betResult.status !== 200 || !betResult.data?.success) {
      finalSuccess = false;
    }
  }

  // Step C: Send Win Transaction if present
  if (winAmount !== undefined && parseFloat(winAmount) > 0) {
    const winPayload = {
      userCode: finalUserCode,
      vendorCode: vendorCode || 'slot-pragmatic',
      gameCode: gameCode || 'vs20olympgate',
      historyId: Math.floor(Math.random() * 1000000) + 1,
      roundId: 'round_' + Date.now(),
      gameType: 2,
      transactionCode: 'tx_win_' + Math.random().toString(36).substring(2, 11),
      isFinished: true,
      isCanceled: false,
      amount: parseFloat(winAmount),
      detail: '{}',
      createdAt: new Date().toISOString()
    };
    const winResult = await callOperator('/api/transaction', winPayload);
    if (winResult.status !== 200 || !winResult.data?.success) {
      finalSuccess = false;
    }
  }

  return res.json({ success: finalSuccess, trace });
});

app.post('/sim/clear', (req, res) => {
  app.clearState();
  res.json({ success: true });
});


// Exposed in-process state getter for testing or assertion purposes if imported
app.getUserBalance = (userCode) => userBalances[userCode];
app.setUserBalance = (userCode, balance) => { userBalances[userCode] = balance; };
app.getUserRtp = (vendorCode, userCode) => userRtps[`${vendorCode}:${userCode}`];
app.clearState = () => {
  for (const k in userBalances) delete userBalances[k];
  for (const k in userRtps) delete userRtps[k];
  for (const k in bettingHistoryStore) delete bettingHistoryStore[k];
  for (const k in transactionHistoryStore) delete transactionHistoryStore[k];
  for (const k in balanceHistories) delete balanceHistories[k];
};

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mock OroPlay Server running on port ${PORT}`);
  });
}

module.exports = app;

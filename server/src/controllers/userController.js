const oroplayApi = require('../utils/oroplayApi');
const SettingService = require('../services/SettingService');

exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await SettingService.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

exports.getPublicBanners = async (req, res, next) => {
  try {
    const banners = await SettingService.getActiveBanners();
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};
exports.getProfile = async (req, res) => {
  res.json(req.user);
};

let cachedGames = null;
let lastCacheFetchTime = 0;
let cacheFetching = false;

const CACHE_TTL = 1000 * 60 * 60; // 1 hour TTL
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateGamesCache() {
  if (cacheFetching) return;
  cacheFetching = true;
  console.log('Background update of games cache started...');
  try {
    const vendorsResult = await oroplayApi.getVendors();
    if (vendorsResult.status === 200 && vendorsResult.data?.success) {
      const vendors = vendorsResult.data.message;
      let allGames = [];

      for (const vendor of vendors) {
        // Delay 10.5 seconds between requests to respect the 1 request per 10s rate limit
        await sleep(10500);
        console.log(`Background fetching games for vendor: ${vendor.vendorCode}...`);
        const result = await oroplayApi.getGames(vendor.vendorCode, 'en');
        if (result.status === 200 && result.data?.success) {
          const games = result.data.message.map(game => ({
            gameCode: game.gameCode,
            gameName: game.gameName,
            provider: vendor.name || vendor.vendorCode,
            thumbnail: game.thumbnail,
            vendorCode: vendor.vendorCode
          }));
          allGames = allGames.concat(games);
        } else {
          console.error(`Background fetch failed for vendor ${vendor.vendorCode}:`, result.data);
        }
      }

      if (allGames.length > 0) {
        cachedGames = allGames;
        lastCacheFetchTime = Date.now();
        console.log(`Background games cache updated successfully with ${allGames.length} games.`);
      }
    } else {
      console.error('Background fetch vendors failed:', vendorsResult.data);
    }
  } catch (err) {
    console.error('Background update of games cache failed with error:', err);
  } finally {
    cacheFetching = false;
  }
}

// Start cache pull shortly after boot
setTimeout(updateGamesCache, 2000);

/**
 * Fetch all games from all vendors (via cache)
 */
exports.getGames = async (req, res, next) => {
  try {
    const now = Date.now();
    
    // If cache is missing or stale, trigger background update (non-blocking)
    if (!cachedGames || (now - lastCacheFetchTime > CACHE_TTL)) {
      updateGamesCache();
    }

    // Return cached games if available
    if (cachedGames && cachedGames.length > 0) {
      return res.json({ games: cachedGames });
    }

    // Wait up to 2 seconds for initial background fetch
    let waitAttempts = 0;
    while (!cachedGames && waitAttempts < 4) {
      await sleep(500);
      waitAttempts++;
    }

    if (cachedGames && cachedGames.length > 0) {
      return res.json({ games: cachedGames });
    }

    // Fallback games with beautiful placeholders so the lobby is never empty
    const fallbackGames = [
      { gameCode: "vs20olympgate", gameName: "Gates of Olympus", provider: "Pragmatic Play", thumbnail: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80", vendorCode: "slot-pragmatic" },
      { gameCode: "vs20doghouse", gameName: "The Dog House", provider: "Pragmatic Play", thumbnail: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80", vendorCode: "slot-pragmatic" },
      { gameCode: "vs20sweetbonanza", gameName: "Sweet Bonanza", provider: "Pragmatic Play", thumbnail: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80", vendorCode: "slot-pragmatic" },
      { gameCode: "vs20sugarrush", gameName: "Sugar Rush", provider: "Pragmatic Play", thumbnail: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80", vendorCode: "slot-pragmatic" },
      { gameCode: "vs20starprincess", gameName: "Starlight Princess", provider: "Pragmatic Play", thumbnail: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80", vendorCode: "slot-pragmatic" },
      { gameCode: "vs10bbbonanza", gameName: "Big Bass Bonanza", provider: "Pragmatic Play", thumbnail: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80", vendorCode: "slot-pragmatic" },
      { gameCode: "MonBigBaller0001", gameName: "MONOPOLY Big Baller", provider: "Evolution Gaming", thumbnail: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80", vendorCode: "casino-evolution" },
      { gameCode: "CrazyTime00001", gameName: "Crazy Time", provider: "Evolution Gaming", thumbnail: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80", vendorCode: "casino-evolution" },
      { gameCode: "LightningRoulette01", gameName: "Lightning Roulette", provider: "Evolution Gaming", thumbnail: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80", vendorCode: "casino-evolution" },
      { gameCode: "LiveBlackjack01", gameName: "Live Blackjack", provider: "Evolution Gaming", thumbnail: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80", vendorCode: "casino-evolution" }
    ];

    res.json({ games: fallbackGames });
  } catch (error) {
    next(error);
  }
};

/**
 * Get launch URL for a game
 */
exports.launchGame = async (req, res, next) => {
  try {
    const { vendorCode, gameCode, language = 'en', lobbyUrl, theme = 1 } = req.body;
    
    if (!vendorCode || !gameCode) {
      return res.status(400).json({ message: 'vendorCode and gameCode are required' });
    }

    // Per instruction: userCode MUST be the username of the logged-in user
    const payload = {
      vendorCode,
      gameCode,
      userCode: req.user.username,
      language,
      lobbyUrl,
      theme
    };

    const result = await oroplayApi.getLaunchUrl(payload);

    if (result.status !== 200 || !result.data.success) {
      return res.status(result.status || 500).json({ 
        message: 'Failed to get launch URL from OroPlay', 
        details: result.data 
      });
    }

    res.json({ launchUrl: result.data.message });
  } catch (error) {
    next(error);
  }
};

const crypto = require('crypto');
const prisma = require('../config/db');

exports.createDepositRequest = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid deposit amount is required' });
    }

    const transactionCode = 'tx_dep_' + crypto.randomBytes(6).toString('hex');

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'PENDING',
        transactionCode
      }
    });

    res.status(201).json({ success: true, message: 'Deposit request created successfully', transaction });
  } catch (error) {
    next(error);
  }
};

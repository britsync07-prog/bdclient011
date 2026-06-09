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
let activeCachePromise = null;

const CACHE_TTL = 1000 * 60 * 60; // 1 hour TTL
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function updateGamesCache() {
  if (activeCachePromise) {
    return activeCachePromise;
  }

  activeCachePromise = (async () => {
    console.log('Update of games cache started...');
    try {
      const vendorsResult = await oroplayApi.getVendors();
      if (vendorsResult.status === 200 && vendorsResult.data?.success) {
        const vendors = vendorsResult.data.message;
        let allGames = [];

        for (const vendor of vendors) {
          // Sleep a tiny bit (50ms) to prevent absolute flooding
          await sleep(50);
          console.log(`Fetching games for vendor: ${vendor.vendorCode}...`);
          const result = await oroplayApi.getGames(vendor.vendorCode, 'en');
          if (result.status === 200 && result.data?.success) {
            const category = vendor.type === 1 ? 'live' : ((vendor.type === 3 || vendor.type === 6) ? 'table' : 'slots');
            const games = result.data.message.map(game => ({
              gameCode: game.gameCode,
              gameName: game.gameName,
              provider: vendor.name || vendor.vendorCode,
              thumbnail: game.thumbnail,
              vendorCode: vendor.vendorCode,
              category: category
            }));
            allGames = allGames.concat(games);
          } else {
            console.error(`Fetch failed for vendor ${vendor.vendorCode}:`, result.data);
          }
        }

        if (allGames.length > 0) {
          cachedGames = allGames;
          lastCacheFetchTime = Date.now();
          console.log(`Games cache updated successfully with ${allGames.length} games.`);
        }
      } else {
        console.error('Fetch vendors failed:', vendorsResult.data);
      }
    } catch (err) {
      console.error('Update of games cache failed with error:', err);
    } finally {
      activeCachePromise = null;
    }
  })();

  return activeCachePromise;
}

// Start cache pull shortly after boot
setTimeout(updateGamesCache, 2000);

/**
 * Fetch all games from all vendors (via cache)
 */
exports.getGames = async (req, res, next) => {
  try {
    const now = Date.now();
    
    // If cache is completely missing, block until we fetch it
    if (!cachedGames) {
      await updateGamesCache();
    } else if (now - lastCacheFetchTime > CACHE_TTL) {
      // If cache is expired but we have old data, trigger background update (non-blocking)
      updateGamesCache();
    }

    if (cachedGames && cachedGames.length > 0) {
      return res.json({ games: cachedGames });
    }

    // Return empty list if API is completely down/empty, never mock fallback games
    res.json({ games: [] });
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

exports.getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

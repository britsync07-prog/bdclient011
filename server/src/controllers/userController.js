const { paginationSchema } = require('../utils/validation');
const fs = require('fs');
const path = require('path');
const oroplayApi = require('../utils/oroplayApi');
const SettingService = require('../services/SettingService');
const crypto = require('crypto');
const prisma = require('../config/db');

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
const CACHE_FILE = path.join(__dirname, '../config/games-cache.json');

try {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(CACHE_FILE)) {
    const rawData = fs.readFileSync(CACHE_FILE, 'utf8');
    if (rawData) {
      cachedGames = JSON.parse(rawData);
      lastCacheFetchTime = Date.now();
      console.log(`[INFO] Loaded ${cachedGames.length} games from local cache file.`);
    }
  }
} catch (err) {
  console.error('Failed to load local games cache file on startup:', err);
}

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

        const mapLimit = async (array, limit, fn) => {
          const results = [];
          const executing = new Set();
          for (const item of array) {
            const p = Promise.resolve().then(() => fn(item));
            results.push(p);
            executing.add(p);
            const clean = () => executing.delete(p);
            p.then(clean, clean);
            if (executing.size >= limit) {
              await Promise.race(executing);
            }
          }
          return Promise.all(results);
        };

        const vendorGamesResults = await mapLimit(vendors, 5, async (vendor) => {
          try {
            const res = await oroplayApi.getGames(vendor.vendorCode, 'en');
            if (res.status === 200 && res.data?.success) {
              // Enhanced Categorization Mapping
              let category = 'slots';
              const vCode = vendor.vendorCode.toLowerCase();

              if (vendor.type === 1) category = 'casino';
              else if (vendor.type === 4) category = 'fishing';
              else if (vCode.includes('crash') || vCode.includes('spribe')) category = 'crash';
              else if (vCode.includes('sport') || vCode.includes('sbo') || vCode.includes('bti')) category = 'sports';
              else if (vCode.includes('lotto') || vCode.includes('lottery')) category = 'lottery';
              else if (vendor.type === 3 || vendor.type === 6 || vCode.includes('table')) category = 'table';
              else if (vCode.includes('arcade') || vCode.includes('jdb')) category = 'arcade';
              else if (vendor.type === 2) category = 'slots';

              return res.data.message.map(game => ({
                id: `${vendor.vendorCode}_${game.gameCode}`,
                gameCode: game.gameCode,
                name: game.gameName,
                provider: vendor.name || vendor.vendorCode,
                thumbnail: game.thumbnail,
                vendorCode: vendor.vendorCode,
                category: category,
                isPopular: Math.random() > 0.8, // Mocking some popular for variety
                rating: 4 + Math.random()
              }));
            }
            return [];
          } catch (err) {
            return [];
          }
        });

        const allGames = vendorGamesResults.flat();

        if (allGames.length > 0) {
          cachedGames = allGames;
          lastCacheFetchTime = Date.now();
          fs.writeFileSync(CACHE_FILE, JSON.stringify(allGames), 'utf8');
          console.log(`Games cache updated with ${allGames.length} games.`);
        }
      }
    } catch (err) {
      console.error('Update of games cache failed:', err);
    } finally {
      activeCachePromise = null;
    }
  })();

  return activeCachePromise;
}

setTimeout(updateGamesCache, 5000);

exports.getGames = async (req, res, next) => {
  try {
    if (!cachedGames) await updateGamesCache();
    else if (Date.now() - lastCacheFetchTime > CACHE_TTL) updateGamesCache();

    res.json({ games: cachedGames || [] });
  } catch (error) {
    next(error);
  }
};

exports.launchGame = async (req, res, next) => {
  try {
    const { vendorCode, gameCode, language = 'bn', lobbyUrl, theme = 1 } = req.body;
    
    if (!vendorCode || !gameCode) {
      return res.status(400).json({ message: 'ভেন্ডর কোড এবং গেম কোড প্রয়োজন' });
    }

    const payload = {
      vendorCode,
      gameCode,
      userCode: req.user.username,
      language,
      lobbyUrl: lobbyUrl || process.env.FRONTEND_URL || 'http://localhost:3000',
      theme
    };

    const result = await oroplayApi.getLaunchUrl(payload);

    if (result.status !== 200 || !result.data.success) {
      return res.status(result.status || 500).json({ 
        message: 'গেম লঞ্চ ইউআরএল পেতে ব্যর্থ হয়েছে',
        details: result.data 
      });
    }

    res.json({ launchUrl: result.data.message });
  } catch (error) {
    next(error);
  }
};

exports.createDepositRequest = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'সঠিক জমার পরিমাণ প্রয়োজন' });
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

    res.status(201).json({ success: true, message: 'জমার অনুরোধ সফলভাবে তৈরি হয়েছে', transaction });
  } catch (error) {
    next(error);
  }
};

exports.getUserTransactions = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { userId: req.user.id },
      }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logAction = async (req, res, next) => {
  try {
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

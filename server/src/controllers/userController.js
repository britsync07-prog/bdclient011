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
const CACHE_FILE = path.join(__dirname, '../config/games-cache-optimized.json');

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

              if (vendor.type === 1) category = 'live'; // vendor type 1 is live casino/lobby
              else if (vendor.type === 4) category = 'fishing';
              else if (vCode.includes('crash') || vCode.includes('spribe')) category = 'crash';
              else if (vCode.includes('sport') || vCode.includes('sbo') || vCode.includes('bti')) category = 'sports';
              else if (vCode.includes('lotto') || vCode.includes('lottery')) category = 'lottery';
              else if (vendor.type === 3 || vendor.type === 6 || vCode.includes('table')) category = 'table';
              else if (vCode.includes('arcade') || vCode.includes('jdb')) category = 'arcade';
              else if (vendor.type === 2) category = 'slots';

              return res.data.message.map(game => {
                let finalCategory = category;
                const gName = (game.gameName || "").toLowerCase();
                const gCode = (game.gameCode || "").toLowerCase();

                // Dynamic override based on game metadata
                if (gName.includes('fishing') || gName.includes('fish') || gName.includes('ocean') || gName.includes('hunter')) {
                  finalCategory = 'fishing';
                } else if (gName.includes('crash') || gName.includes('plinko') || gName.includes('aviator') || gName.includes('mines') || gName.includes('limbo')) {
                  finalCategory = 'crash';
                } else if (gName.includes('baccarat') || gName.includes('roulette') || gName.includes('blackjack') || gName.includes('sic bo') || gName.includes('dragon tiger') || gName.includes('live')) {
                  finalCategory = 'live';
                } else if (gName.includes('poker') || gName.includes('table') || gName.includes('card') || gName.includes('holdem') || gName.includes('texas')) {
                  finalCategory = 'table';
                } else if (gName.includes('lotto') || gName.includes('lottery') || gName.includes('keno') || gName.includes('bingo') || gName.includes('scratch') || gName.includes('dice')) {
                  finalCategory = 'lottery';
                } else if (gName.includes('arcade') || gName.includes('fruit') || gName.includes('candy') || gName.includes('jewel') || gName.includes('pop') || gName.includes('gem')) {
                  finalCategory = 'arcade';
                }

                const popularKeywords = ['bonanza', 'olympus', 'baccarat', 'roulette', 'crazy time', 'monopoly', 'mega wheel', 'sweet', 'fruit', 'lightning', 'spribe', 'plinko', 'aviator', 'dragon tiger', 'andar bahar', 'lobby'];
                const isPopular = popularKeywords.some(kw => gName.includes(kw));

                return {
                  id: `${vendor.vendorCode}_${game.gameCode}`,
                  gameCode: game.gameCode,
                  name: game.gameName,
                  provider: vendor.name || vendor.vendorCode,
                  thumbnail: game.thumbnail,
                  vendorCode: vendor.vendorCode,
                  category: finalCategory,
                  isPopular,
                  rating: Number((4.1 + Math.random() * 0.9).toFixed(2))
                };
              });
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
    const limit = parseInt(req.query.limit, 10) || 0;
    const requestedCategory = req.query.category;

    if (!cachedGames) await updateGamesCache();
    else if (Date.now() - lastCacheFetchTime > CACHE_TTL) updateGamesCache();

    // Secondary runtime classification pass to clean up any remaining mismatched slots
    let classifiedGames = (cachedGames || []).map(game => {
      const name = (game.name || '').toLowerCase();
      const code = (game.gameCode || '').toLowerCase();
      const provider = (game.provider || '').toLowerCase();
      const vendorCode = (game.vendorCode || '').toLowerCase();
      let cat = game.category || 'slots';

      // 1. Live Dealer/Casino games check first to make sure they are matched with Casino category
      if (
        name.includes('live') || name.includes('dealer') || name.includes('lobby') ||
        provider.includes('live') || provider.includes('ezugi') || provider.includes('sexy baccarat') ||
        provider.includes('evolution') || vendorCode.startsWith('casino-')
      ) {
        cat = 'live';
      }
      // Megaways Slots
      else if (name.includes('megaways') || name.includes('mega ways') || name.includes('multiways') || name.includes('multi ways')) {
        cat = 'megaways';
      }
      // Card Games (strictly card games, distinct from non-card table games like roulette/sicbo)
      else if (name.includes('poker') || name.includes('blackjack') || name.includes('baccarat') || name.includes('holdem') || name.includes('teen patti') || name.includes('andar bahar') || name.includes('card') || name.includes('bj') || name.includes('texas')) {
        cat = 'cards';
      }
      // Table games / Poker (non-card table games)
      else if (name.includes('roulette') || name.includes('sicbo') || name.includes('dragon tiger') || name.includes('table') || name.includes('dice') || name.includes('roulet') || name.includes('wheels') || name.includes('wheel') || name.includes('sic bo')) {
        cat = 'table';
      }
      // Fishing Games
      else if (name.includes('fish') || name.includes('fishing') || name.includes('hunter') || name.includes('shark') || name.includes('ocean') || name.includes('sea') || name.includes('marine') || name.includes('underwater')) {
        cat = 'fishing';
      }
      // Crash / Arcade / Mini / Mines / Fast games
      else if (name.includes('crash') || name.includes('plinko') || name.includes('aviator') || name.includes('mines') || name.includes('limbo') || name.includes('jetx') || name.includes('spaceman') || name.includes('zeppelin')) {
        cat = 'crash';
      }
      // Sports / Virtual Sports
      else if (name.includes('sport') || name.includes('football') || name.includes('soccer') || name.includes('cricket') || name.includes('tennis') || name.includes('basketball') || name.includes('race') || name.includes('racing') || name.includes('virtual') || name.includes('cup') || name.includes('league')) {
        cat = 'sports';
      }
      // Lottery / Lotto / Bingo / Keno / Scratch
      else if (name.includes('lotto') || name.includes('lottery') || name.includes('bingo') || name.includes('keno') || name.includes('scratch') || name.includes('draw') || name.includes('raffle') || name.includes('ticket') || name.includes('ball')) {
        cat = 'lottery';
      }
      // Arcade / Casual Games
      else if (name.includes('arcade') || name.includes('candy') || name.includes('fruit') || name.includes('jewel') || name.includes('pop') || name.includes('gem') || name.includes('tetris') || name.includes('pacman') || name.includes('bubble') || name.includes('shoot') || name.includes('casual')) {
        cat = 'arcade';
      }

      // Final check: if game has sports keywords or wheel features, enforce strict separation out of slots
      if (cat === 'slots') {
        if (name.includes('wheel') || name.includes('wheels')) {
          cat = 'table';
        } else if (name.includes('football') || name.includes('soccer') || name.includes('cricket') || name.includes('sports')) {
          cat = 'sports';
        }
      }

      return {
        ...game,
        category: cat,
        isPopular: game.isPopular === true
      };
    });

    // Apply filtering based on requested category
    if (requestedCategory && requestedCategory !== 'all' && requestedCategory !== 'home') {
      classifiedGames = classifiedGames.filter(g => g.category === requestedCategory);
    } else if (requestedCategory === 'all') {
      classifiedGames = classifiedGames.filter(g => g.isPopular);
    }

    // Apply limiting logic
    if (requestedCategory === 'home' && limit > 0) {
      const categoryMap = {};
      const limitedHomeGames = [];
      for (const game of classifiedGames) {
        if (!categoryMap[game.category]) categoryMap[game.category] = 0;
        if (categoryMap[game.category] < limit) {
          limitedHomeGames.push(game);
          categoryMap[game.category]++;
        }
      }
      classifiedGames = limitedHomeGames;
    } else if (limit > 0) {
      classifiedGames = classifiedGames.slice(0, limit);
    }

    res.json({ games: classifiedGames });
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

    // Ensure the user exists on the OroPlay system before attempting to launch
    try {
      await oroplayApi.createUser(req.user.username);
    } catch (createErr) {
      console.warn(`[OroPlay] Proactive user registration failed or user already exists for: ${req.user.username}`, createErr.message);
    }

    const result = await oroplayApi.getLaunchUrl(payload);
    console.log("OROPLAY LAUNCH API RESPONSE:", JSON.stringify(result));

    if (result.status !== 200 || !result.data.success) {
      const errorStatus = result.status === 200 ? 500 : (result.status || 500);
      return res.status(errorStatus).json({ 
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

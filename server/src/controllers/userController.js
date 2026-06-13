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

const gameCacheHelper = require('../utils/gameCacheHelper');

exports.getGames = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    const requestedCategory = req.query.category;

    const gamesList = await gameCacheHelper.getCachedGames();

    // Secondary runtime classification pass to clean up any remaining mismatched slots
    let classifiedGames = gamesList.map(game => {
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

// helper to save base64 to file
function saveBase64Image(base64Str, prefix) {
  if (!base64Str) return null;
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    if (base64Str.startsWith('http') || base64Str.startsWith('/uploads')) return base64Str;
    return null;
  }
  const ext = matches[1].split('/')[1] || 'png';
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}

exports.submitKYC = async (req, res, next) => {
  try {
    const { nidFront, nidBack } = req.body;
    if (!nidFront || !nidBack) {
      return res.status(400).json({ success: false, message: 'Both front and back photos of NID card are required' });
    }

    const pathFront = saveBase64Image(nidFront, `nid-front-${req.user.id}`);
    const pathBack = saveBase64Image(nidBack, `nid-back-${req.user.id}`);

    if (!pathFront || !pathBack) {
      return res.status(400).json({ success: false, message: 'Invalid image formats' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        kycStatus: 'PENDING',
        nidFront: pathFront,
        nidBack: pathBack
      }
    });

    res.json({
      success: true,
      message: 'KYC documents submitted successfully',
      kycStatus: updatedUser.kycStatus,
      nidFront: updatedUser.nidFront,
      nidBack: updatedUser.nidBack
    });
  } catch (error) {
    next(error);
  }
};

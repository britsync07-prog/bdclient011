const fs = require('fs');
const path = require('path');
const oroplayApi = require('./oroplayApi');

const CACHE_FILE = path.join(__dirname, '../config/games-cache-optimized.json');
const CACHE_TTL = 1000 * 60 * 60; // 1 hour TTL

let cachedGames = null;
let lastCacheFetchTime = 0;
let activeCachePromise = null;

// Load initial cache from file
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
              let category = 'slots';
              const vCode = vendor.vendorCode.toLowerCase();

              if (vendor.type === 1) category = 'live';
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

// Proactively trigger update after 5 seconds on boot if not loaded
setTimeout(updateGamesCache, 5000);

async function getCachedGames() {
  if (!cachedGames) {
    await updateGamesCache();
  } else if (Date.now() - lastCacheFetchTime > CACHE_TTL) {
    updateGamesCache(); // trigger background update
  }
  return cachedGames || [];
}

async function updateGame(id, updates) {
  const games = await getCachedGames();
  cachedGames = games.map(g => g.id === id ? { ...g, ...updates } : g);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedGames), 'utf8');
  return true;
}

async function deleteGame(id) {
  const games = await getCachedGames();
  cachedGames = games.filter(g => g.id !== id);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedGames), 'utf8');
  return true;
}

async function renameProvider(oldName, newName) {
  const games = await getCachedGames();
  cachedGames = games.map(g => g.provider.toLowerCase() === oldName.toLowerCase() ? { ...g, provider: newName } : g);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedGames), 'utf8');
  return true;
}

async function deleteProvider(name) {
  const games = await getCachedGames();
  cachedGames = games.filter(g => g.provider.toLowerCase() !== name.toLowerCase());
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedGames), 'utf8');
  return true;
}

module.exports = {
  getCachedGames,
  updateGame,
  deleteGame,
  renameProvider,
  deleteProvider
};

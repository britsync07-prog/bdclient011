const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '../server/src/config/games-cache.json');
const OUTPUT_FILE = path.join(__dirname, '../server/src/config/games-cache-optimized.json');

try {
  if (!fs.existsSync(CACHE_FILE)) {
    console.error(`Cache file not found at: ${CACHE_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(CACHE_FILE, 'utf8');
  const games = JSON.parse(rawData);
  console.log(`Successfully read ${games.length} games from cache.`);

  // Define keywords for popular games to set isPopular: true
  // Let's make popular games represent real classics: sweet bonanza, gate of olympus, speed baccarat, crazy time, roulette, etc.
  const popularKeywords = [
    'bonanza', 'olympus', 'baccarat', 'roulette', 'crazy time', 'monopoly', 'mega wheel', 'sweet',
    'fruit', 'lightning', 'spribe', 'plinko', 'aviator', 'dragon tiger', 'andar bahar', 'lobby'
  ];

  let slotsCount = 0;
  let liveCount = 0;
  let tableCount = 0;
  let fishingCount = 0;
  let crashCount = 0;
  let sportsCount = 0;
  let lotteryCount = 0;
  let arcadeCount = 0;
  let megawaysCount = 0;
  let cardsCount = 0;
  let popularCount = 0;

  const categorizedGames = games.map((game, index) => {
    let cat = game.category || 'slots';
    const name = (game.name || '').toLowerCase();
    const provider = (game.provider || '').toLowerCase();
    const vendorCode = (game.vendorCode || '').toLowerCase();

    // 1. Live Casino
    if (
      name.includes('live') || name.includes('dealer') || name.includes('lobby') ||
      provider.includes('live') || provider.includes('ezugi') || provider.includes('sexy baccarat') ||
      provider.includes('evolution') || vendorCode.startsWith('casino-')
    ) {
      cat = 'live';
    }
    // 2. Megaways Slots
    else if (name.includes('megaways') || name.includes('mega ways') || name.includes('multiways') || name.includes('multi ways')) {
      cat = 'megaways';
    }
    // 3. Card Games
    else if (
      name.includes('poker') || name.includes('blackjack') || name.includes('baccarat') ||
      name.includes('holdem') || name.includes('teen patti') || name.includes('andar bahar') ||
      name.includes('card') || name.includes('bj') || name.includes('texas') || name.includes('seotda')
    ) {
      cat = 'cards';
    }
    // 4. Fishing Games
    else if (
      name.includes('fish') || name.includes('fishing') || name.includes('hunter') ||
      name.includes('shark') || name.includes('ocean') || name.includes('sea') ||
      name.includes('marine') || name.includes('underwater') || vendorCode.includes('fishing')
    ) {
      cat = 'fishing';
    }
    // 5. Crash / Mines / Fast Games
    else if (
      name.includes('crash') || name.includes('plinko') || name.includes('aviator') ||
      name.includes('mines') || name.includes('limbo') || name.includes('jetx') ||
      name.includes('spaceman') || name.includes('zeppelin') || vendorCode.includes('crash') || vendorCode.includes('spribe')
    ) {
      cat = 'crash';
    }
    // 6. Sports
    else if (
      name.includes('sport') || name.includes('football') || name.includes('soccer') ||
      name.includes('cricket') || name.includes('tennis') || name.includes('basketball') ||
      name.includes('race') || name.includes('racing') || name.includes('virtual') ||
      name.includes('cup') || name.includes('league') || vendorCode.includes('sport') ||
      vendorCode.includes('sbo') || vendorCode.includes('bti')
    ) {
      cat = 'sports';
    }
    // 7. Lottery / Bingo / Scratch
    else if (
      name.includes('lotto') || name.includes('lottery') || name.includes('bingo') ||
      name.includes('keno') || name.includes('scratch') || name.includes('draw') ||
      name.includes('raffle') || name.includes('ticket') || name.includes('ball') ||
      vendorCode.includes('lotto') || vendorCode.includes('lottery')
    ) {
      cat = 'lottery';
    }
    // 8. Arcade / Casual
    else if (
      name.includes('arcade') || name.includes('candy') || name.includes('fruit') ||
      name.includes('jewel') || name.includes('pop') || name.includes('gem') ||
      name.includes('tetris') || name.includes('pacman') || name.includes('bubble') ||
      name.includes('shoot') || name.includes('casual') || vendorCode.includes('arcade') || vendorCode.includes('jdb')
    ) {
      cat = 'arcade';
    }
    // 9. Non-card Table Games
    else if (
      name.includes('roulette') || name.includes('sicbo') || name.includes('dragon tiger') ||
      name.includes('table') || name.includes('dice') || name.includes('roulet') ||
      name.includes('wheels') || name.includes('wheel') || name.includes('sic bo')
    ) {
      cat = 'table';
    }
    // 10. Default Slots
    else {
      cat = 'slots';
    }

    // Determine popularity
    let isPopular = false;
    // Set first 15% as popular dynamically, plus specific premium titles
    if (index % 7 === 0 || popularKeywords.some(kw => name.includes(kw))) {
      isPopular = true;
      popularCount++;
    }

    // Keep statistics
    if (cat === 'slots') slotsCount++;
    else if (cat === 'live') liveCount++;
    else if (cat === 'table') tableCount++;
    else if (cat === 'fishing') fishingCount++;
    else if (cat === 'crash') crashCount++;
    else if (cat === 'sports') sportsCount++;
    else if (cat === 'lottery') lotteryCount++;
    else if (cat === 'arcade') arcadeCount++;
    else if (cat === 'megaways') megawaysCount++;
    else if (cat === 'cards') cardsCount++;

    return {
      ...game,
      category: cat,
      isPopular,
      rating: Number((4.1 + Math.random() * 0.9).toFixed(2))
    };
  });

  console.log('--- Categorization Summary ---');
  console.log(`Total Games: ${categorizedGames.length}`);
  console.log(`Slots: ${slotsCount}`);
  console.log(`Live: ${liveCount}`);
  console.log(`Table: ${tableCount}`);
  console.log(`Cards: ${cardsCount}`);
  console.log(`Fishing: ${fishingCount}`);
  console.log(`Crash: ${crashCount}`);
  console.log(`Sports: ${sportsCount}`);
  console.log(`Lottery: ${lotteryCount}`);
  console.log(`Arcade: ${arcadeCount}`);
  console.log(`Megaways: ${megawaysCount}`);
  console.log(`Popular (Hot Games): ${popularCount}`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categorizedGames), 'utf8');
  console.log(`Optimized cache file written successfully to ${OUTPUT_FILE}`);
} catch (error) {
  console.error('An error occurred during parsing & optimization:', error);
}

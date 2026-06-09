const express = require('express');
const router = express.Router();
const { getProfile, getGames, launchGame, getPublicSettings, getPublicBanners, createDepositRequest } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.get('/games', getGames);
router.post('/launch', protect, launchGame);
router.post('/deposit-request', protect, createDepositRequest);
router.get('/settings', getPublicSettings);
router.get('/banners', getPublicBanners);

module.exports = router;

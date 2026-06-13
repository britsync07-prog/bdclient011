const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserKYC,
  getFinancialRequests,
  approveFinancialRequest,
  setGameRTP,
  getDashboardStats,
  getAdminGames,
  updateAdminGame,
  deleteAdminGame,
  renameAdminProvider,
  deleteAdminProvider,
} = require('../controllers/adminController');
const adminCmsController = require('../controllers/adminCmsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes are protected and admin only
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.patch('/users/:userId/kyc', updateUserKYC);
router.get('/financial-requests', getFinancialRequests);
router.get('/dashboard-stats', getDashboardStats);
router.post('/financial-requests/:transactionId/approve', approveFinancialRequest);
router.post('/game/set-rtp', setGameRTP);

router.get('/games', getAdminGames);
router.patch('/games/:id', updateAdminGame);
router.delete('/games/:id', deleteAdminGame);
router.patch('/providers', renameAdminProvider);
router.delete('/providers/:name', deleteAdminProvider);

// CMS Routes
router.get('/settings', adminCmsController.getSettings);
router.put('/settings', adminCmsController.updateSettings);
router.get('/banners', adminCmsController.getBanners);
router.post('/banners', adminCmsController.addBanner);
router.put('/banners/:id', adminCmsController.updateBanner);
router.delete('/banners/:id', adminCmsController.deleteBanner);

module.exports = router;

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const walletAuthMiddleware = require('../middleware/walletAuthMiddleware');

// All wallet callback routes require OroPlay Basic Auth
router.use(walletAuthMiddleware);

/**
 * @route POST /api/balance
 * @desc Get user balance
 */
router.post('/balance', walletController.getBalance);

/**
 * @route POST /api/transaction
 * @desc Handle single transaction (Bet/Win)
 */
router.post('/transaction', walletController.handleTransaction);

/**
 * @route POST /api/batch-transactions
 * @desc Handle multiple transactions
 */
router.post('/batch-transactions', walletController.handleBatchTransactions);

module.exports = router;

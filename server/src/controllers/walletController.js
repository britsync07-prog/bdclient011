const prisma = require('../config/db');

const findUserByCode = async (client, userCode) => {
  // If userCode is numeric, treat it as an ID
  if (/^\d+$/.test(userCode)) {
    return await client.user.findUnique({
      where: { id: parseInt(userCode, 10) }
    });
  }
  // Otherwise, treat it as a username
  return await client.user.findUnique({
    where: { username: String(userCode) }
  });
};

/**
 * OroPlay Error Codes:
 * 0: NO_ERROR
 * 2: USER_DOES_NOT_EXIST
 * 4: INSUFFICIENT_USER_BALANCE
 * 6: DUPLICATE_TRANSACTION
 */

const OROPLAY_ERROR = {
  NO_ERROR: 0,
  USER_DOES_NOT_EXIST: 2,
  INSUFFICIENT_USER_BALANCE: 4,
  DUPLICATE_TRANSACTION: 6,
  GENERAL_ERROR: 1
};

/**
 * Get user balance
 * POST /api/balance
 */
exports.getBalance = async (req, res) => {
  try {
    const { userCode } = req.body;

    if (!userCode) {
      return res.json({
        success: false,
        message: 'userCode is required',
        errorCode: OROPLAY_ERROR.GENERAL_ERROR
      });
    }

    const user = await findUserByCode(prisma, userCode);

    if (!user) {
      return res.json({
        success: false,
        message: 'User does not exist',
        errorCode: OROPLAY_ERROR.USER_DOES_NOT_EXIST
      });
    }

    return res.json({
      success: true,
      message: user.balance.toString(),
      errorCode: OROPLAY_ERROR.NO_ERROR
    });
  } catch (error) {
    console.error('getBalance error:', error);
    return res.json({
      success: false,
      message: 'Internal server error',
      errorCode: OROPLAY_ERROR.GENERAL_ERROR
    });
  }
};

/**
 * Handle single transaction (Bet/Win)
 * POST /api/transaction
 */
exports.handleTransaction = async (req, res) => {
  try {
    const { 
      userCode, 
      transactionCode, 
      amount, 
      isFinished, 
      isCanceled,
      gameCode,
      vendorCode
    } = req.body;

    // 1. Check if transaction already exists, include user to avoid redundant query
    const existingTransaction = await prisma.transaction.findUnique({
      where: { transactionCode },
      include: { user: true }
    });

    if (existingTransaction) {
      // If it exists, return current balance of the associated user
      return res.json({
        success: true,
        message: existingTransaction.user ? existingTransaction.user.balance.toString() : "0",
        errorCode: OROPLAY_ERROR.NO_ERROR
      });
    }

    // 2. Process transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await findUserByCode(tx, userCode);

      if (!user) {
        throw { code: OROPLAY_ERROR.USER_DOES_NOT_EXIST, message: 'User does not exist' };
      }

      const transAmount = parseFloat(amount);
      const newBalance = parseFloat(user.balance) + transAmount;

      if (newBalance < 0) {
        throw { code: OROPLAY_ERROR.INSUFFICIENT_USER_BALANCE, message: 'Insufficient balance' };
      }

      // Update balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: newBalance }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: transAmount,
          type: transAmount < 0 ? 'BET' : 'WIN',
          status: 'SUCCESS',
          transactionCode: transactionCode,
        }
      });

      return updatedUser.balance;
    });

    return res.json({
      success: true,
      message: result.toString(),
      errorCode: OROPLAY_ERROR.NO_ERROR
    });

  } catch (error) {
    if (error.code) {
      return res.json({
        success: false,
        message: error.message,
        errorCode: error.code
      });
    }
    console.error('handleTransaction error:', error);
    return res.json({
      success: false,
      message: 'Internal server error',
      errorCode: OROPLAY_ERROR.GENERAL_ERROR
    });
  }
};

/**
 * Handle batch transactions
 * POST /api/batch-transactions
 */
exports.handleBatchTransactions = async (req, res) => {
  try {
    const { userCode, transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.json({
        success: false,
        message: 'transactions array is required',
        errorCode: OROPLAY_ERROR.GENERAL_ERROR
      });
    }

    // Pre-fetch all existing transactions in this batch to avoid N+1 queries
    const transactionCodes = transactions.map(t => t.transactionCode);
    const existingTransactions = await prisma.transaction.findMany({
      where: { transactionCode: { in: transactionCodes } },
      select: { transactionCode: true }
    });
    const existingCodesSet = new Set(existingTransactions.map(t => t.transactionCode));

    const result = await prisma.$transaction(async (tx) => {
      const user = await findUserByCode(tx, userCode);

      if (!user) {
        throw { code: OROPLAY_ERROR.USER_DOES_NOT_EXIST, message: 'User does not exist' };
      }

      let currentBalance = parseFloat(user.balance);

      for (const trans of transactions) {
        const { transactionCode, amount } = trans;

        // Skip if duplicate (idempotency)
        if (existingCodesSet.has(transactionCode)) continue;

        const transAmount = parseFloat(amount);
        currentBalance += transAmount;

        if (currentBalance < 0) {
          throw { code: OROPLAY_ERROR.INSUFFICIENT_USER_BALANCE, message: 'Insufficient balance during batch processing' };
        }

        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: transAmount,
            type: transAmount < 0 ? 'BET' : 'WIN',
            status: 'SUCCESS',
            transactionCode: transactionCode
          }
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: currentBalance }
      });

      return updatedUser.balance;
    });

    return res.json({
      success: true,
      message: result.toString(),
      errorCode: OROPLAY_ERROR.NO_ERROR
    });

  } catch (error) {
    if (error.code) {
      return res.json({
        success: false,
        message: error.message,
        errorCode: error.code
      });
    }
    console.error('handleBatchTransactions error:', error);
    return res.json({
      success: false,
      message: 'Internal server error',
      errorCode: OROPLAY_ERROR.GENERAL_ERROR
    });
  }
};

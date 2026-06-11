const prisma = require('../config/db');

const findUserByCode = async (client, userCode) => {
  const parsedId = parseInt(userCode, 10);
  if (!isNaN(parsedId) && String(parsedId) === String(userCode)) {
    return await client.user.findUnique({
      where: { id: parsedId }
    });
  }
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

    // 1. Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { transactionCode }
    });

    if (existingTransaction) {
      // If it exists, check if it belongs to the same user and return current balance
      const user = await findUserByCode(prisma, userCode);
      return res.json({
        success: true,
        message: user ? user.balance.toString() : "0",
        errorCode: OROPLAY_ERROR.NO_ERROR // OroPlay often prefers NO_ERROR for idempotency if already processed
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
          // We could add game information to Transaction model if needed
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

    const result = await prisma.$transaction(async (tx) => {
      const user = await findUserByCode(tx, userCode);

      if (!user) {
        throw { code: OROPLAY_ERROR.USER_DOES_NOT_EXIST, message: 'User does not exist' };
      }

      const incomingCodes = transactions.map(t => t.transactionCode);
      const existingTransactions = await tx.transaction.findMany({
        where: {
          transactionCode: { in: incomingCodes }
        },
        select: { transactionCode: true }
      });

      const existingCodesSet = new Set(existingTransactions.map(t => t.transactionCode));
      const processedCodesInBatch = new Set();

      let currentBalance = parseFloat(user.balance);
      const newTransactionsData = [];

      for (const trans of transactions) {
        const { transactionCode, amount } = trans;

        // Skip if already in DB or already processed in this batch (idempotency)
        if (existingCodesSet.has(transactionCode) || processedCodesInBatch.has(transactionCode)) {
          continue;
        }

        const transAmount = parseFloat(amount);
        currentBalance += transAmount;

        if (currentBalance < 0) {
          throw { code: OROPLAY_ERROR.INSUFFICIENT_USER_BALANCE, message: 'Insufficient balance during batch processing' };
        }

        newTransactionsData.push({
          userId: user.id,
          amount: transAmount,
          type: transAmount < 0 ? 'BET' : 'WIN',
          status: 'SUCCESS',
          transactionCode: transactionCode
        });

        processedCodesInBatch.add(transactionCode);
      }

      if (newTransactionsData.length > 0) {
        await tx.transaction.createMany({
          data: newTransactionsData
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

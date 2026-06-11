const prisma = require('../config/db');
const oroplayApi = require('../utils/oroplayApi');
const { z } = require('zod');

// Validation schemas
const updateKYCSchema = z.object({
  kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

const setRTPSchema = z.object({
  vendorCode: z.string(),
  username: z.string(),
  rtp: z.number().min(30).max(99),
});

/**
 * List all users with pagination
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          role: true,
          balance: true,
          referralCode: true,
          kycStatus: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
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

/**
 * Update KYC status for a user
 */
exports.updateUserKYC = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { kycStatus } = updateKYCSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { kycStatus },
    });

    console.log(`[ADMIN_KYC_UPDATE] [Admin: ${req.user.username}] Updated User ${user.username} (ID: ${userId}) KYC status to ${kycStatus}`);
    res.json({ message: `KYC status updated to ${kycStatus}`, user: { id: user.id, username: user.username, kycStatus: user.kycStatus } });
  } catch (error) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      console.warn(`[ADMIN_KYC_UPDATE_FAIL] [Admin: ${req.user.username}] Validation failed for user ${req.params.userId} KYC update`);
      return res.status(400).json({ errors: error.errors || error.issues });
    }
    console.error(`[ADMIN_KYC_UPDATE_ERROR] [Admin: ${req.user.username}] Exception updating KYC for user ${req.params.userId} - Error: ${error.message}`);
    next(error);
  }
};

/**
 * List all pending financial requests
 */
exports.getFinancialRequests = async (req, res, next) => {
  try {
    const requests = await prisma.transaction.findMany({
      where: {
        status: 'PENDING',
        type: { in: ['DEPOSIT', 'WITHDRAWAL'] },
      },
      include: {
        user: {
          select: {
            username: true,
            balance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a pending financial request
 */
exports.approveFinancialRequest = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: { user: true },
    });

    if (!transaction || transaction.status !== 'PENDING') {
      console.warn(`[ADMIN_FINANCIAL_APPROVE_FAIL] [Admin: ${req.user.username}] Transaction ID ${transactionId} is invalid or not PENDING`);
      return res.status(400).json({ message: 'Invalid or already processed transaction' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: parseInt(transactionId) },
        data: { status: 'SUCCESS' },
      });

      // Update user balance
      const amount = Number(transaction.amount);
      const balanceChange = transaction.type === 'DEPOSIT' ? amount : -amount;
      
      const updatedUser = await tx.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return { updatedTransaction, updatedUser };
    });

    console.log(`[ADMIN_FINANCIAL_APPROVE_SUCCESS] [Admin: ${req.user.username}] Approved ${transaction.type} transaction ID ${transactionId} for User ${transaction.user.username}. Amount: ${transaction.amount}`);
    res.json({ message: 'Request approved successfully', result });
  } catch (error) {
    console.error(`[ADMIN_FINANCIAL_APPROVE_ERROR] [Admin: ${req.user.username}] Exception approving financial request ID ${req.params.transactionId} - Error: ${error.message}`);
    next(error);
  }
};

/**
 * Set Game RTP for a user via OroPlay
 */
exports.setGameRTP = async (req, res, next) => {
  try {
    const { vendorCode, username, rtp } = setRTPSchema.parse(req.body);

    const result = await oroplayApi.setUserRTP(vendorCode, username, rtp);

    if (result.status !== 200) {
      console.error(`[ADMIN_RTP_SET_FAIL] [Admin: ${req.user.username}] Failed to set RTP for user ${username} on vendor ${vendorCode} to ${rtp}%. Status: ${result.status} | Details: ${JSON.stringify(result.data)}`);
      return res.status(result.status).json({ message: 'Failed to set RTP via OroPlay', details: result.data });
    }

    console.log(`[ADMIN_RTP_SET_SUCCESS] [Admin: ${req.user.username}] Successfully set RTP for user ${username} on vendor ${vendorCode} to ${rtp}%`);
    res.json({ message: 'RTP set successfully', data: result.data });
  } catch (error) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      console.warn(`[ADMIN_RTP_SET_FAIL] [Admin: ${req.user.username}] Validation failed for set RTP request`);
      return res.status(400).json({ errors: error.errors || error.issues });
    }
    console.error(`[ADMIN_RTP_SET_ERROR] [Admin: ${req.user.username}] Exception setting game RTP - Error: ${error.message}`);
    next(error);
  }
};

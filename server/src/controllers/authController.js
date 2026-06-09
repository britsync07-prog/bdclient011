const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../config/db');
const { signToken } = require('../utils/jwt');
const crypto = require('crypto');

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

exports.register = async (req, res, next) => {
  try {
    const { username, password } = registerSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        referralCode,
        balance: 10000,
      },
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        balance: user.balance,
      },
      token: signToken(user.id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        balance: user.balance,
      },
      token: signToken(user.id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};

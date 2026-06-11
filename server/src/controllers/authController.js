const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../config/db');
const { signToken } = require('../utils/jwt');
const crypto = require('crypto');

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
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
      console.warn(`[AUTH_REGISTER_FAIL] Registration failed for username: ${username} - Reason: User already exists`);
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

    console.log(`[AUTH_REGISTER_SUCCESS] User registered successfully: ${username}`);
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
      console.warn(`[AUTH_REGISTER_FAIL] Registration input validation failed for: ${req.body?.username || 'unknown'}`);
      return res.status(400).json({ message: error.errors[0]?.message || "Invalid input", errors: error.errors });
    }
    console.error(`[AUTH_REGISTER_ERROR] Exception during registration: ${error.message}`);
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
      console.warn(`[AUTH_LOGIN_FAIL] Login failed for username: ${username} - Reason: Invalid credentials`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[AUTH_LOGIN_SUCCESS] User logged in: ${username}`);
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
      console.warn(`[AUTH_LOGIN_FAIL] Login input validation failed for: ${req.body?.username || 'unknown'}`);
      return res.status(400).json({ message: error.errors[0]?.message || "Invalid input", errors: error.errors });
    }
    console.error(`[AUTH_LOGIN_ERROR] Exception during login: ${error.message}`);
    next(error);
  }
};

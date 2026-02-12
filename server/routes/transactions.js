const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Bet = require('../models/Bet');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth header' });
  const token = parts[1];
  try {
    const payload = require('jsonwebtoken').verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).exec();
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/deposit', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const user = req.user;
  user.balance = user.balance + amount;
  await user.save();
  await Transaction.create({ user: user._id, type: 'deposit', amount });
  res.json({ success: true, balance: user.balance });
});

router.post('/withdraw', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const user = req.user;
  if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
  user.balance = user.balance - amount;
  await user.save();
  await Transaction.create({ user: user._id, type: 'withdraw', amount: -amount });
  res.json({ success: true, balance: user.balance });
});

router.get('/me', authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200).lean().exec();
  const bets = await Bet.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200).lean().exec();
  res.json({ transactions, bets });
});

module.exports = router;

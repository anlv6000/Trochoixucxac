const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const Bet = require('../models/Bet');
const Session = require('../models/Session');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).exec();
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/', authMiddleware, async (req, res) => {
  const { sessionId, choice, amount, choiceValue } = req.body;
  if (!sessionId || !choice || !amount) return res.status(400).json({ error: 'Missing fields' });
  const session = await Session.findById(sessionId).exec();
  if (!session) return res.status(400).json({ error: 'Session not found' });
  if (session.status !== 'open') return res.status(400).json({ error: 'Betting closed for this session' });
  const user = await User.findById(req.user._id).exec();
  if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
  const betData = { user: user._id, session: session._id, choice, amount };
  if (choiceValue !== undefined) betData.choiceValue = choiceValue;
  const bet = new Bet(betData);
  await bet.save();
  user.balance = user.balance - amount;
  await user.save();
  await Transaction.create({ user: user._id, type: 'bet', amount: -amount, meta: { sessionId, choice } });
  res.json({ success: true, betId: bet._id });
});

module.exports = router;

const express = require('express');
const Session = require('../models/Session');
const Bet = require('../models/Bet');

const router = express.Router();

router.get('/', async (req, res) => {
  const rows = await Session.find().sort({ startAt: -1 }).limit(100).lean().exec();
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const session = await Session.findById(id).lean().exec();
  if (!session) return res.status(404).json({ error: 'Not found' });
  const bets = await Bet.find({ session: session._id }).lean().exec();
  res.json({ ...session, bets });
});

module.exports = router;

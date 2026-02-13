const express = require('express');
const jwt = require('jsonwebtoken');
const BaCayRoom = require('../models/BaCayRoom');
const User = require('../models/User');
const router = express.Router();

function getUserFromHeader(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'secret');
    return payload;
  } catch (e) { return null; }
}

router.get('/', async (req, res) => {
  const rows = await BaCayRoom.find().sort({ createdAt: -1 }).limit(200).lean().exec();
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, maxPlayers, minBet, isPrivate } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const payload = getUserFromHeader(req);
  let creator = null;
  if (payload) creator = await User.findById(payload.id).lean().exec();

  const room = await BaCayRoom.create({
    name,
    maxPlayers: maxPlayers || 4,
    minBet: minBet || 1000,
    isPrivate: !!isPrivate,
    players: creator ? [{ user: creator._id, username: creator.username }] : []
  });

  res.json(room);
});

router.post('/:id/join', async (req, res) => {
  const id = req.params.id;
  const room = await BaCayRoom.findById(id).exec();
  if (!room) return res.status(404).json({ error: 'Not found' });
  if (room.players.length >= room.maxPlayers) return res.status(400).json({ error: 'Full' });
  const payload = getUserFromHeader(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findById(payload.id).lean().exec();
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (room.players.some(p => String(p.user) === String(user._id))) return res.json(room);
  room.players.push({ user: user._id, username: user.username });
  await room.save();
  res.json(room);
});

module.exports = router;

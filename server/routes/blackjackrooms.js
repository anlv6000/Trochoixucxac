const express = require('express');
const jwt = require('jsonwebtoken');
const BlackjackRoom = require('../models/BlackjackRoom');
const User = require('../models/User');

module.exports = function (io) {
  const router = express.Router();

  function getUserFromHeader(req) {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const parts = auth.split(' ');
    if (parts.length !== 2) return null;
    try {
      const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'secret');
      return payload;
    } catch (e) {
      return null;
    }
  }

  // Lấy danh sách phòng
  router.get('/', async (req, res) => {
    const rows = await BlackjackRoom.find().sort({ createdAt: -1 }).limit(200).lean().exec();
    res.json(rows);
  });

  // Lấy chi tiết phòng
  router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const room = await BlackjackRoom.findById(id).lean().exec();
    if (!room) return res.status(404).json({ error: 'Not found' });
    res.json(room);
  });

  // Tạo phòng mới
  router.post('/', async (req, res) => {
    const { name, maxPlayers, minBet, isPrivate } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const payload = getUserFromHeader(req);
    let creator = null;
    if (payload) creator = await User.findById(payload.id).lean().exec();

    const room = await BlackjackRoom.create({
      name,
      maxPlayers: maxPlayers || 6,
      minBet: minBet || 1000,
      isPrivate: !!isPrivate,
      players: creator
        ? [{ user: creator._id, username: creator.username, isReady: false, bet: 0 }]
        : []
    });
    if (io) io.emit('rooms:updated');
    res.json(room);
  });

  // Tham gia phòng
  router.post('/:id/join', async (req, res) => {
    const id = req.params.id;
    const room = await BlackjackRoom.findById(id).exec();
    if (!room) return res.status(404).json({ error: 'Not found' });
    if (room.players.length >= room.maxPlayers) return res.status(400).json({ error: 'Full' });

    const payload = getUserFromHeader(req);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(payload.id).lean().exec();
    if (!user) return res.status(401).json({ error: 'User not found' });

    // ngăn trùng lặp
    if (room.players.some(p => String(p.user) === String(user._id))) return res.json(room);

    room.players.push({ user: user._id, username: user.username, isReady: false, bet: 0 });
    await room.save();
    if (io) io.emit('room:updated', { roomId: room._id.toString(), room });
    if (io) io.emit('rooms:updated');
    res.json(room);
  });

  // Rời phòng
  router.post('/:id/leave', async (req, res) => {
    const id = req.params.id;
    const room = await BlackjackRoom.findById(id).exec();
    if (!room) return res.status(404).json({ error: 'Not found' });

    const payload = getUserFromHeader(req);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const userId = payload.id;

    const before = room.players.length;
    room.players = room.players.filter(p => String(p.user) !== String(userId));
    if (room.players.length < before) {
      await room.save();
      if (io) io.emit('room:updated', { roomId: room._id.toString(), room });
      if (io) io.emit('rooms:updated');
    }
    res.json(room);
  });

  // Ready + bet
  router.post('/:id/ready', async (req, res) => {
    const room = await BlackjackRoom.findById(req.params.id).exec();
    if (!room) return res.status(404).json({ error: 'Not found' });
    const payload = getUserFromHeader(req);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const userId = payload.id;

    const p = room.players.find(p => String(p.user) === String(userId));
    if (!p) return res.status(400).json({ error: 'Not in room' });

    p.isReady = true;
    if (req.body.bet !== undefined) p.bet = Number(req.body.bet) || p.bet;
    p.status = 'playing';
    await room.save();

    if (io) io.emit('room:updated', { roomId: room._id.toString(), room });

    const allReady = room.players.length > 0 && room.players.every(x => x.isReady);
    if (allReady) {
      // shuffle + deal
      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const deck = [];
      for (const s of suits) for (const r of ranks) deck.push({ suit: s, rank: r });
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      const deal = { players: [], dealer: [], deck: [], turnIndex: 0, results: [] };
      let idx = 0;
      for (const pl of room.players) {
        const c1 = deck[idx++]; const c2 = deck[idx++];
        deal.players.push({ user: pl.user, cards: [c1, c2], status: 'playing' });
      }
      const d1 = deck[idx++]; const d2 = deck[idx++];
      deal.dealer = [d1, { ...d2, faceDown: true }];
      deal.deck = deck.slice(idx);
      deal.turnIndex = 0;

      room.currentDeal = deal;
      room.status = 'playing';
      await room.save();

      if (io) io.emit('room:dealt', { roomId: room._id.toString(), room, deal });
      if (io) io.emit('rooms:updated');
    }
    res.json(room);
  });


  // Player action endpoint: hit / stand / double
  router.post('/:id/action', async (req, res) => {
    const { action } = req.body || {};
    const room = await BlackjackRoom.findById(req.params.id).exec();
    if (!room) return res.status(404).json({ error: 'Not found' });

    const payload = getUserFromHeader(req);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const userId = String(payload.id);

    if (!room.currentDeal || room.status !== 'playing') {
      return res.status(400).json({ error: 'No active deal' });
    }
    const deal = room.currentDeal;

    const playerIndex = deal.players.findIndex(p => String(p.user) === userId);
    if (playerIndex === -1) return res.status(400).json({ error: 'Not part of current deal' });
    if (deal.turnIndex !== playerIndex) return res.status(400).json({ error: 'Not your turn' });

    const computeTotal = (cards) => {
      let total = 0, aces = 0;
      for (const c of cards) {
        const r = String(c.rank);
        if (['J', 'Q', 'K'].includes(r)) total += 10;
        else if (r === 'A') { total += 11; aces++; }
        else total += Number(r);
      }
      while (total > 21 && aces > 0) { total -= 10; aces--; }
      return total;
    };

    const advanceTurn = async () => {
      let idx = deal.turnIndex + 1;
      while (idx < deal.players.length && deal.players[idx].status !== 'playing') idx++;
      if (idx < deal.players.length) {
        deal.turnIndex = idx;
        room.currentDeal = deal;
        await room.save();
        if (io) io.emit('room:dealt', { roomId: room._id.toString(), room, deal });
        return;
      }

      // dealer plays
      deal.dealer = deal.dealer.map(c => ({ ...c, faceDown: false }));
      let dealerTotal = computeTotal(deal.dealer);
      while (dealerTotal < 17 && deal.deck.length > 0) {
        const nc = deal.deck.shift();
        deal.dealer.push({ ...nc, faceDown: false });
        dealerTotal = computeTotal(deal.dealer);
      }

      const results = [];
      for (let i = 0; i < deal.players.length; i++) {
        const dp = deal.players[i];
        const roomPlayer = room.players[i];
        const playerTotal = computeTotal(dp.cards);
        const bet = Number(roomPlayer.bet || 0);
        let winAmount = 0, status = 'lose';

        if (dp.status === 'bust') status = 'lose';
        else if (playerTotal === 21 && dp.cards.length === 2) {
          const dealerBJ = dealerTotal === 21 && deal.dealer.length === 2;
          if (dealerBJ) { status = 'push'; winAmount = bet; }
          else { status = 'win'; winAmount = Math.floor(bet * 2.5); }
        } else if (dealerTotal > 21) { status = 'win'; winAmount = bet * 2; }
        else if (playerTotal > dealerTotal) { status = 'win'; winAmount = bet * 2; }
        else if (playerTotal < dealerTotal) { status = 'lose'; }
        else { status = 'push'; winAmount = bet; }

        if (winAmount > 0) {
          await User.findByIdAndUpdate(dp.user, { $inc: { balance: winAmount } }).exec();
        }
        results.push({ user: dp.user, status, winAmount, playerTotal });
      }

      room.currentDeal = { ...deal, dealerTotal, results };
      room.status = 'lobby';
      room.players.forEach(p => { p.isReady = false; p.bet = 0; p.status = 'playing'; });
      await room.save();
      if (io) io.emit('room:finished', { roomId: room._id.toString(), room, deal });
      if (io) io.emit('rooms:updated');
    };

    if (action === 'hit') {
      const card = deal.deck.shift();
      deal.players[playerIndex].cards.push(card);
      const total = computeTotal(deal.players[playerIndex].cards);
      if (total > 21) {
        deal.players[playerIndex].status = 'bust';
        room.players[playerIndex].status = 'bust';
        await room.save();
        await advanceTurn();
        return res.json({ room, deal });
      }
      if (total === 21) {
        deal.players[playerIndex].status = 'stand';
        room.players[playerIndex].status = 'stand';
        await advanceTurn();
        return res.json({ room, deal });
      }
      room.currentDeal = deal;
      await room.save();
      if (io) io.emit('room:dealt', { roomId: room._id.toString(), room, deal });
      return res.json({ room, deal });
    }

    if (action === 'stand') {
      deal.players[playerIndex].status = 'stand';
      room.players[playerIndex].status = 'stand';
      await advanceTurn();
      return res.json({ room, deal });
    }

    if (action === 'double') {
      const card = deal.deck.shift();
      deal.players[playerIndex].cards.push(card);
      deal.players[playerIndex].status = 'stand';
      room.players[playerIndex].bet *= 2;
      room.players[playerIndex].status = 'stand';
      // trừ thêm tiền từ balance
      await User.findByIdAndUpdate(userId, { $inc: { balance: -room.players[playerIndex].bet / 2 } }).exec();
      await advanceTurn();
      return res.json({ room, deal });
    }

    res.status(400).json({ error: 'Unknown action' });
  });


  // Bỏ sẵn sàng
  router.post('/:id/unready', async (req, res) => {
    const id = req.params.id;
    const room = await BlackjackRoom.findById(id).exec();
    if (!room) return res.status(404).json({ error: 'Not found' });

    const payload = getUserFromHeader(req);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const userId = payload.id;

    const p = room.players.find(p => String(p.user) === String(userId));
    if (!p) return res.status(400).json({ error: 'Not in room' });

    p.isReady = false;
    await room.save();

    if (io) io.emit('room:updated', { roomId: room._id.toString(), room });
    if (io) io.emit('rooms:updated');
    res.json(room);
  });

  return router;
};

const mongoose = require('mongoose');

const PlayerSub = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const BaCayRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxPlayers: { type: Number, default: 4 },
  minBet: { type: Number, default: 1000 },
  isPrivate: { type: Boolean, default: false },
  players: { type: [PlayerSub], default: [] },
  status: { type: String, enum: ['waiting', 'playing', 'closed'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BaCayRoom', BaCayRoomSchema, 'bacayrooms');

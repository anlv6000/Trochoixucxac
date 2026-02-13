const mongoose = require('mongoose');

const PlayerSub = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  isReady: { type: Boolean, default: false },
  bet: { type: Number, default: 0 },
  status: { type: String, enum: ['playing','stand','bust','win','lose','push'], default: 'playing' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const BlackjackRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxPlayers: { type: Number, default: 6 },
  minBet: { type: Number, default: 1000 },
  isPrivate: { type: Boolean, default: false },
  players: { type: [PlayerSub], default: [] },
  status: { type: String, enum: ['waiting','playing','lobby','closed'], default: 'waiting' },
  currentDeal: {
    players: { type: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, cards: { type: Array }, status: { type: String } }], default: [] },
    dealer: { type: Array, default: [] },
    deck: { type: Array, default: [] },
    turnIndex: { type: Number, default: 0 },
    dealerTotal: { type: Number },
    results: { type: Array, default: [] }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlackjackRoom', BlackjackRoomSchema, 'blackjackrooms');

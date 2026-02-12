const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  choice: { type: String, required: true },
  choiceValue: { type: Number },
  amount: { type: Number, required: true },
  payout: { type: Number, default: 0 },
  status: { type: String, enum: ['placed', 'won', 'lost'], default: 'placed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bet', BetSchema);

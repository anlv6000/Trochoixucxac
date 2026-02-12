const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  gameType: { type: String, required: true },
  startAt: { type: Date, required: true },
  openUntil: { type: Date },
  resultUntil: { type: Date },
  endAt: { type: Date, required: true },
  status: { type: String, required: true, enum: ['open', 'result', 'waiting', 'cancelled'], default: 'open' },
  result: { type: mongoose.Schema.Types.Mixed },
  resultAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);

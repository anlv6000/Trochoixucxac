const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

dotenv.config();

const Session = require('./models/Session');
const Bet = require('./models/Bet');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');
const betsRoutes = require('./routes/bets');
const txRoutes = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anlevan001:qielli2007@cluster0.02suo.mongodb.net/tai_xiu?retryWrites=true&w=majority';

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/bets', betsRoutes);
app.use('/api/tx', txRoutes);

// simple health
app.get('/api/ping', (req, res) => res.json({ ok: true }));


// Session scheduler configuration: 50s open, 10s result display, 5s gap => 65s total
const OPEN_SECONDS = parseInt(process.env.OPEN_SECONDS || '36', 10);
const RESULT_SECONDS = parseInt(process.env.RESULT_SECONDS || '10', 10);
const GAP_SECONDS = parseInt(process.env.GAP_SECONDS || '5', 10);
const TOTAL_SECONDS = OPEN_SECONDS + RESULT_SECONDS + GAP_SECONDS;

function rollTaiXiuResult() {
  const a = 1 + Math.floor(Math.random() * 6);
  const b = 1 + Math.floor(Math.random() * 6);
  const c = 1 + Math.floor(Math.random() * 6);
  const sum = a + b + c;
  return { dice: [a, b, c], sum };
}

async function settleSession(session) {
  // session is a Mongoose doc
  if (!session) return;
  const result = rollTaiXiuResult();
  session.status = 'result';
  session.result = result;
  session.resultAt = new Date();
  await session.save();

  // settle bets immediately (payouts) but clients will see result for RESULT_SECONDS
  const bets = await Bet.find({ session: session._id }).exec();
  for (const bet of bets) {
    let win = false;
    if (session.gameType === 'tai_xiu') {
      const s = result.sum;
      if (bet.choice === 'tai' && s >= 11 && s <= 17) win = true;
      if (bet.choice === 'xiu' && s >= 4 && s <= 10) win = true;
      if (bet.choice === 'total' && bet.choiceValue === s) win = true;
      // note: pair handling omitted for brevity
    }
    if (win) {
      const payout = Number((bet.amount * 1.95).toFixed(2));
      bet.payout = payout;
      bet.status = 'won';
      await bet.save();
      await User.findByIdAndUpdate(bet.user, { $inc: { balance: payout } }).exec();
      await Transaction.create({ user: bet.user, type: 'payout', amount: payout, meta: { sessionId: session._id.toString(), betId: bet._id.toString() } });
    } else {
      bet.payout = 0;
      bet.status = 'lost';
      await bet.save();
    }
  }
}

async function createSession(gameType = 'tai_xiu') {
  const startAt = new Date();
  const openUntil = new Date(startAt.getTime() + OPEN_SECONDS * 1000);
  const resultUntil = new Date(openUntil.getTime() + RESULT_SECONDS * 1000);
  const endAt = new Date(startAt.getTime() + TOTAL_SECONDS * 1000);
  const session = await Session.create({ gameType, startAt, endAt, status: 'open', openUntil, resultUntil });
  console.log('Created session', session._id.toString());

  // schedule transition to result phase
  setTimeout(async () => {
    try {
      await settleSession(session);
    } catch (err) {
      console.error('Error settling session', err);
    }
  }, OPEN_SECONDS * 1000);

  // schedule transition to waiting (after result display)
  setTimeout(async () => {
    try {
      const s = await Session.findById(session._id).exec();
      if (s) {
        s.status = 'waiting';
        await s.save();
      }
    } catch (err) {
      console.error('Error setting waiting', err);
    }
  }, (OPEN_SECONDS + RESULT_SECONDS) * 1000);

  // schedule creation of next session after TOTAL_SECONDS
  setTimeout(() => createSession(gameType), TOTAL_SECONDS * 1000);
}

async function startScheduler() {
  await createSession('tai_xiu');
}

async function start() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB', MONGO_URI);
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  startScheduler();
}

start().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});

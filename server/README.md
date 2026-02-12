# Casino Backend

Simple Node/Express backend for the Casino app. Provides:

- JWT auth (register/login)
- SQLite persistence
- Scheduled `tai_xiu` sessions with timed betting windows
- Bet placing, deposit, withdraw, and history endpoints

Quick start

1. cd server
2. npm install
3. copy `.env.example` to `.env` and set `JWT_SECRET`
4. npm start

Default config in `.env.example`:

- `PORT` — server port
- `SESSION_INTERVAL_SECONDS` — how often a new session is created
- `BET_DURATION_SECONDS` — how long betting stays open for each session

Import sample data (optional)

If you want to pre-populate MongoDB with example data, start your MongoDB server and run:

```bash
mongoimport --uri "mongodb://localhost:27017/casino" --collection users --file data/users.json --jsonArray
mongoimport --uri "mongodb://localhost:27017/casino" --collection sessions --file data/sessions.json --jsonArray
mongoimport --uri "mongodb://localhost:27017/casino" --collection bets --file data/bets.json --jsonArray
mongoimport --uri "mongodb://localhost:27017/casino" --collection transactions --file data/transactions.json --jsonArray
```

Notes
- The sample `users.json` contains placeholder password hashes. Create users via `/api/auth/register` to ensure passwords are hashed correctly.
- The scheduler will automatically create `tai_xiu` sessions based on `SESSION_INTERVAL_SECONDS` and `BET_DURATION_SECONDS`.

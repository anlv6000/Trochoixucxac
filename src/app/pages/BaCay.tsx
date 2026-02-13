import { useState } from "react";
import { Card, CardType, createDeck, shuffleDeck, Suit } from "../components/Card";
import { Wallet, Home, RotateCcw, Info, Users } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";

interface Player {
  id: number;
  name: string;
  cards: CardType[];
  score: number;
  bet: number;
  status: "waiting" | "playing" | "won" | "lost";
}

type GameStatus = "betting" | "dealing" | "revealing" | "finished";

export function BaCay() {
  const [balance, setBalance] = useState(50000);
  const [bet, setBet] = useState(5000);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: "Bạn", cards: [], score: 0, bet: 0, status: "waiting" },
    { id: 1, name: "Máy 1", cards: [], score: 0, bet: 5000, status: "waiting" },
    { id: 2, name: "Máy 2", cards: [], score: 0, bet: 5000, status: "waiting" },
    { id: 3, name: "Máy 3", cards: [], score: 0, bet: 5000, status: "waiting" },
  ]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("betting");
  const [message, setMessage] = useState("Đặt cược và bắt đầu ván!");
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const quickBets = [1000, 5000, 10000, 50000];

  // Calculate 3 Cay score (only last digit)
  const calculateScore = (cards: CardType[]): number => {
    let total = 0;
    for (const card of cards) {
      if (card.rank === "A") {
        total += 1;
      } else if (["J", "Q", "K"].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank);
      }
    }
    return total % 10; // Only last digit
  };

  // Get suit rank for comparison (♠ > ♥ > ♦ > ♣)
  const getSuitRank = (suit: Suit): number => {
    const ranks: { [key in Suit]: number } = {
      "♠": 4,
      "♥": 3,
      "♦": 2,
      "♣": 1,
    };
    return ranks[suit];
  };

  // Compare two players
  const compareHands = (p1: Player, p2: Player): number => {
    if (p1.score !== p2.score) {
      return p2.score - p1.score; // Higher score wins
    }
    
    // Same score, compare suits
    const p1MaxSuit = Math.max(...p1.cards.map(c => getSuitRank(c.suit)));
    const p2MaxSuit = Math.max(...p2.cards.map(c => getSuitRank(c.suit)));
    
    return p2MaxSuit - p1MaxSuit;
  };

  const startGame = () => {
    if (bet <= 0 || bet > balance) {
      alert("Số tiền cược không hợp lệ!");
      return;
    }

    setBalance(balance - bet);
    setGameStatus("dealing");
    setMessage("Đang chia bài...");

    const newDeck = shuffleDeck(createDeck());
    let deckIndex = 0;

    // Deal 3 cards to each player
    const updatedPlayers = players.map((player) => {
      const cards = [
        { ...newDeck[deckIndex++], faceDown: player.id !== 0 },
        { ...newDeck[deckIndex++], faceDown: player.id !== 0 },
        { ...newDeck[deckIndex++], faceDown: player.id !== 0 },
      ];
      const score = calculateScore(cards);
      
      return {
        ...player,
        cards,
        score,
        bet: player.id === 0 ? bet : 5000,
        status: "playing" as const,
      };
    });

    setPlayers(updatedPlayers);
    setDeck(newDeck.slice(deckIndex));
    setMessage("Bài đã chia! Sẵn sàng mở bài!");
  };

  const revealCards = () => {
    setGameStatus("revealing");
    setMessage("Mở bài...");

    // Reveal all cards
    const revealedPlayers = players.map((player) => ({
      ...player,
      cards: player.cards.map(card => ({ ...card, faceDown: false })),
    }));

    setPlayers(revealedPlayers);

    setTimeout(() => {
      determineWinner(revealedPlayers);
    }, 1500);
  };

  const determineWinner = (finalPlayers: Player[]) => {
    // Sort players by score
    const sortedPlayers = [...finalPlayers].sort(compareHands);
    const winningPlayer = sortedPlayers[0];

    const updatedPlayers = finalPlayers.map((player) => ({
      ...player,
      status: player.id === winningPlayer.id ? ("won" as const) : ("lost" as const),
    }));

    setPlayers(updatedPlayers);
    setWinner(winningPlayer);
    setGameStatus("finished");

    if (winningPlayer.id === 0) {
      const totalPot = finalPlayers.reduce((sum, p) => sum + p.bet, 0);
      setBalance(balance + totalPot);
      setMessage(`Bạn thắng! +${totalPot.toLocaleString('vi-VN')} VNĐ`);
    } else {
      setMessage(`${winningPlayer.name} thắng!`);
    }

    setShowResult(true);
  };

  const reset = () => {
    setPlayers(players.map(p => ({
      ...p,
      cards: [],
      score: 0,
      bet: 0,
      status: "waiting",
    })));
    setGameStatus("betting");
    setMessage("Đặt cược và bắt đầu ván!");
    setShowResult(false);
    setWinner(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Ba Cây (3 Cây)
            </h1>
            <p className="text-gray-300">{message}</p>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-lg">{balance.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>

        {/* Game Table */}
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl border-4 border-yellow-600/50 min-h-[600px]">
          <div className="grid grid-cols-2 gap-6">
            {players.map((player) => (
              <div
                key={player.id}
                className={`bg-black/30 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all ${
                  player.status === "won"
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                    : player.status === "lost"
                    ? "border-red-500/30"
                    : "border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold text-lg">{player.name}</h3>
                  </div>
                  {player.status === "won" && (
                    <span className="text-2xl">👑</span>
                  )}
                </div>

                {gameStatus !== "betting" && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-400">Cược: {player.bet.toLocaleString('vi-VN')} VNĐ</div>
                    {(gameStatus === "revealing" || gameStatus === "finished") && (
                      <div className="text-2xl font-bold text-yellow-400">
                        Điểm: {player.score}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  {player.cards.map((card, index) => (
                    <Card key={index} card={card} size="md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Betting & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Betting Area */}
            {gameStatus === "betting" && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Đặt cược</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {quickBets.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBet(amount)}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        bet === amount
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {amount.toLocaleString('vi-VN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white mb-4"
                  min={1000}
                  max={balance}
                />
                <button
                  onClick={startGame}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 font-bold text-xl"
                >
                  Bắt đầu ván
                </button>
              </div>
            )}

            {/* Reveal Button */}
            {gameStatus === "dealing" && (
              <button
                onClick={revealCards}
                className="w-full py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 font-bold text-xl"
              >
                Mở bài
              </button>
            )}

            {/* Reset Button */}
            {gameStatus === "finished" && (
              <button
                onClick={reset}
                className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/50 font-bold text-xl text-black"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Ván mới
              </button>
            )}
          </div>

          {/* Rules & Info */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">Luật chơi</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Mỗi người 3 lá bài</li>
                <li>• J, Q, K = 10 điểm</li>
                <li>• A = 1 điểm</li>
                <li>• Số = giá trị thật</li>
                <li>• Tổng điểm chỉ lấy hàng đơn vị</li>
                <li>• Ví dụ: 27 điểm = 7</li>
                <li>• Điểm cao thắng</li>
                <li>• Nếu bằng điểm, so chất:</li>
                <li className="ml-4">♠ {">"} ♥ {">"} ♦ {">"} ♣</li>
              </ul>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-3">Cược hiện tại</h3>
              <div className="text-3xl font-bold text-yellow-400">{bet.toLocaleString('vi-VN')} VNĐ</div>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Result Popup */}
      <AnimatePresence>
        {showResult && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`bg-gradient-to-br ${
                winner.id === 0
                  ? "from-green-900 to-emerald-900 border-green-400"
                  : "from-red-900 to-orange-900 border-red-400"
              } backdrop-blur-xl rounded-3xl p-8 border-2 shadow-2xl max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {winner.id === 0 ? "🎉" : "😢"}
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  {winner.id === 0 ? "BẠN THẮNG!" : `${winner.name.toUpperCase()} THẮNG!`}
                </h2>
                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                  <div className="text-gray-300 mb-2">{winner.name}</div>
                  <div className="text-5xl font-bold text-yellow-400 mb-4">
                    {winner.score} điểm
                  </div>
                  <div className="flex justify-center gap-2">
                    {winner.cards.map((card, index) => (
                      <Card key={index} card={{ ...card, faceDown: false }} size="md" />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-bold text-lg"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardType, getHandTotal } from "../components/Card";
import { Home, Clock, CheckCircle } from "lucide-react";
import api, { BASE } from "../api";
import { io, Socket } from "socket.io-client";
import { useRef } from "react";
import { useUser } from "../contexts/UserContext";

interface Player {
  id: number;
  name: string;
  cards: CardType[];
  bet: number;
  isReady: boolean;
  isYou: boolean;
  status: "waiting" | "playing" | "stand" | "bust" | "win" | "lose" | "push";
  balance: number;
  result?: string;
  winAmount?: number;
}

type GamePhase = "lobby" | "betting" | "playing" | "dealer-turn" | "results";

export function BlackjackRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const userCtx = (() => { try { return useUser(); } catch { return null; } })();
  const [balance, setBalance] = useState<number>(userCtx?.balance || 50000);
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby");
  const [deck, setDeck] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState("Chờ người chơi sẵn sàng...");

  // Players will be loaded from room data (no filler bots)
  const meName = userCtx?.user?.username || "Bạn";
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [lockingBet, setLockingBet] = useState(false);

  const yourPlayer = players.find(p => p.isYou);
  const [myIndex, setMyIndex] = useState<number>(() => players.findIndex(p => p.isYou));
  const dealerTotal = getHandTotal(dealerHand);
  const quickBets = [1000, 5000, 10000, 50000];

  // Timer for player turns
  useEffect(() => {
    if (gamePhase === "playing" && players[currentPlayerIndex]?.status === "playing") {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto stand when time runs out
            handleStand();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gamePhase, currentPlayerIndex]);

  const handleReady = () => {
    const you = players.find(p => p.isYou);
    if (!you) return;
    if (lockingBet) return;

    (async () => {
      setLockingBet(true);
      try {
        if (roomBet <= 0 || roomBet > balance) {
          alert('Số tiền cược không hợp lệ!');
          setLockingBet(false);
          return;
        }
        // withdraw locally first
        await api.tx.withdraw(roomBet);
        if (userCtx?.setBalance) userCtx.setBalance((userCtx.balance || 0) - roomBet);
        setBalance(prev => prev - roomBet);

        // tell server we're ready and pass the bet; server will emit updates
        await api.blackjackrooms.ready(roomId as string, { bet: roomBet });
        setMessage('Đã sẵn sàng. Đang chờ những người chơi khác...');
      } catch (e) {
        alert('Không thể đặt cược/khóa cược: ' + (e as any).message || 'Lỗi');
      } finally {
        setLockingBet(false);
      }
    })();
  };

  const startGame = (readyPlayers: Player[]) => {
    setGamePhase("betting");
    setMessage("Đặt cược...");
    // wait for players to place bets; dealing will commence when bets are placed
  };

  // Room bet state (for you)
  const [roomBet, setRoomBet] = useState<number>(5000);

  const placeRoomBet = async () => {
    // keep for compatibility if explicitly used elsewhere; prefer locking via Ready
    const you = players.find(p => p.isYou);
    if (!you) return;
    if (roomBet <= 0 || roomBet > balance) {
      alert('Số tiền cược không hợp lệ!');
      return;
    }

    try {
      await api.tx.withdraw(roomBet);
      if (userCtx?.setBalance) userCtx.setBalance((userCtx.balance || 0) - roomBet);
      setBalance(prev => prev - roomBet);
    } catch (e) {
      console.warn('Withdraw failed', e);
      alert('Không thể đặt cược với số tiền hiện tại');
      return;
    }

    const updated = players.map(p => p.isYou ? { ...p, bet: roomBet } : p);
    setPlayers(updated);
  };

  const handleHit = async () => {
    if (!yourPlayer) return;
    try {
      await api.blackjackrooms.action(roomId as string, { action: 'hit' });
    } catch (e: any) {
      console.warn('Hit failed', e);
      const msg = (e && e.message) ? e.message : JSON.stringify(e);
      if (msg.includes('Not your turn') || msg.includes('No active deal')) {
        try {
          const r = await api.blackjackrooms.get(roomId as string);
          const mapped = (r.players || []).map((p: any, idx: number) => ({
            id: idx,
            name: p.username || 'Người chơi',
            cards: [],
            bet: p.bet || r.minBet || 5000,
            isReady: !!p.isReady,
            isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
            status: 'waiting' as const,
            balance: p.balance || 50000,
          }));
          setPlayers(mapped);
          setMyIndex(mapped.findIndex((m: any) => m.isYou));
        } catch (_) {}
      }
    }
  };

  const handleStand = async () => {
    if (!yourPlayer) return;
    try {
      await api.blackjackrooms.action(roomId as string, { action: 'stand' });
    } catch (e: any) {
      console.warn('Stand failed', e);
      const msg = (e && e.message) ? e.message : JSON.stringify(e);
      if (msg.includes('Not your turn') || msg.includes('No active deal')) {
        try {
          const r = await api.blackjackrooms.get(roomId as string);
          const mapped = (r.players || []).map((p: any, idx: number) => ({
            id: idx,
            name: p.username || 'Người chơi',
            cards: [],
            bet: p.bet || r.minBet || 5000,
            isReady: !!p.isReady,
            isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
            status: 'waiting' as const,
            balance: p.balance || 50000,
          }));
          setPlayers(mapped);
          setMyIndex(mapped.findIndex((m: any) => m.isYou));
        } catch (_) {}
      }
    }
  };

  const handleDouble = async () => {
    if (!yourPlayer) return;
    try {
      await api.blackjackrooms.action(roomId as string, { action: 'double' });
    } catch (e: any) {
      console.warn('Double failed', e);
      const msg = (e && e.message) ? e.message : JSON.stringify(e);
      if (msg.includes('Not your turn') || msg.includes('No active deal')) {
        try {
          const r = await api.blackjackrooms.get(roomId as string);
          const mapped = (r.players || []).map((p: any, idx: number) => ({
            id: idx,
            name: p.username || 'Người chơi',
            cards: [],
            bet: p.bet || r.minBet || 5000,
            isReady: !!p.isReady,
            isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
            status: 'waiting' as const,
            balance: p.balance || 50000,
          }));
          setPlayers(mapped);
          setMyIndex(mapped.findIndex((m: any) => m.isYou));
        } catch (_) {}
      }
    }
  };

  // bust handling is performed by server; clients receive updates via socket

  // Note: bots removed in favor of human players. Non-you players are automatically marked as 'stand' when their turn comes.

  // Dealer play and result calculation is handled server-side; clients receive `room:dealt` and `room:finished` events.

  const resetGame = () => {
    setPlayers(players.map(p => ({
      ...p,
      cards: [],
      isReady: false,
      status: "waiting",
      result: undefined,
      winAmount: undefined,
    })));
    setDealerHand([]);
    setGamePhase("lobby");
    setCurrentPlayerIndex(0);
    setMessage("Chờ người chơi sẵn sàng...");
  };

  // Load room data and participants
  useEffect(() => {
    let mounted = true;
    const socketRef = socketRefLazy.current;
    (async () => {
      if (!roomId) return;
      try {
        const room = await api.blackjackrooms.get(roomId as string);
        if (!mounted) return;
        // attempt to join room (adds user to participants on server) and prefer join response
        let roomData = room;
        try { const j = await api.blackjackrooms.join(roomId as string); if (j) roomData = j; } catch (err) { /* ignore join errors */ }

        const mapped = roomData.players.map((p: any, idx: number) => ({
          id: idx,
          name: p.username || 'Người chơi',
          cards: [],
          bet: p.bet || roomData.minBet || 5000,
          isReady: !!p.isReady,
          isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
          status: 'waiting' as const,
          balance: p.balance || 50000,
        }));
        // ensure current user is present; if not, add them as you
        const youPresent = mapped.some((m: any) => m.isYou);
        if (!youPresent && userCtx?.user) {
          mapped.unshift({ id: 0, name: userCtx.user.username, cards: [], bet: room.minBet || 5000, isReady: false, isYou: true, status: 'waiting' as const, balance: userCtx.balance || 50000 });
        }
        setPlayers(mapped);
        setMyIndex(mapped.findIndex((m: any) => m.isYou));
        setRoomLoaded(true);
        setRoomBet(roomData.minBet || 5000);

        // connect socket and join room
        // don't emit join here — socket may not be initialized yet. socket init will join and sync state.
      } catch (e) {
        console.error('Failed to load room', e);
      }
    })();
    return () => { mounted = false; if (socketRef && roomId) socketRef.emit('leaveRoom', roomId); };
  }, [roomId]);

  // socket
  const socketRefLazy = useRef<Socket | null>(null);
  useEffect(() => {
    if (socketRefLazy.current) return;
    try {
      const url = new URL(BASE).origin;
      const s = io(url);
      socketRefLazy.current = s;
      // once socket connects, join the room and fetch latest room state to avoid missing events
      s.on('connect', async () => {
        try {
          if (roomId) s.emit('joinRoom', roomId);
          // fetch room and sync if a deal already exists
          if (roomId) {
            const r = await api.blackjackrooms.get(roomId as string);
            if (r && r.currentDeal && r.status === 'playing') {
              const deal = r.currentDeal;
              const mapped = (deal.players || []).map((p: any, idx: number) => ({
                id: idx,
                name: (r.players && r.players[idx] && r.players[idx].username) || 'Người chơi',
                cards: p.cards || [],
                bet: (r.players && r.players[idx] && r.players[idx].bet) || r.minBet || 5000,
                isReady: true,
                isYou: userCtx?.user && r.players && (String(userCtx.user._id) === String(r.players[idx]?.user) || userCtx.user.username === r.players[idx]?.username),
                status: 'playing' as const,
                balance: (r.players && r.players[idx] && r.players[idx].balance) || 50000,
              }));
              setPlayers(mapped);
              setMyIndex(mapped.findIndex((m: any) => m.isYou));
              setDealerHand(deal.dealer || []);
              setDeck(deal.deck || []);
                setGamePhase('playing');
                setCurrentPlayerIndex(typeof deal.turnIndex === 'number' ? deal.turnIndex : 0);
                setTimeLeft(30);
                setMessage(mapped && mapped.length > 0 ? (mapped[deal.turnIndex] ? `Lượt của ${mapped[deal.turnIndex].name}` : `Lượt của ${mapped[0].name}`) : 'Đang chơi');
            }
          }
        } catch (e) {
          console.warn('Failed to sync room after socket connect', e);
        }
      });
      s.on('room:updated', (data: any) => {
        if (!data || String(data.roomId) !== String(roomId)) return;
        const room = data.room;
        const mapped = room.players.map((p: any, idx: number) => ({
          id: idx,
          name: p.username || 'Người chơi',
          cards: [],
          bet: p.bet || room.minBet || 5000,
          isReady: !!p.isReady,
          isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
          status: 'waiting' as const,
          balance: p.balance || 50000,
        }));
        setPlayers(mapped);
        setMyIndex(mapped.findIndex((m: any) => m.isYou));
        // if all ready and we're still in lobby, start dealing
        const allReady = mapped.length > 0 && mapped.every((r: any) => r.isReady);
        if (allReady && gamePhase === 'lobby') {
          // server will emit 'room:dealt' when ready
        }
      });
      s.on('room:started', (data: any) => {
        if (!data || String(data.roomId) !== String(roomId)) return;
        const room = data.room;
        const mapped = room.players.map((p: any, idx: number) => ({
          id: idx,
          name: p.username || 'Người chơi',
          cards: [],
          bet: p.bet || room.minBet || 5000,
          isReady: !!p.isReady,
          isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
          status: 'waiting' as const,
          balance: p.balance || 50000,
        }));
        setPlayers(mapped);
      });
      s.on('room:dealt', (data: any) => {
        if (!data || String(data.roomId) !== String(roomId)) return;
        const deal = data.deal;
        const room = data.room || {};
        // map players from deal
        const mapped = (deal.players || []).map((p: any, idx: number) => ({
          id: idx,
          name: (room.players && room.players[idx] && room.players[idx].username) || 'Người chơi',
          cards: p.cards || [],
          bet: (room.players && room.players[idx] && room.players[idx].bet) || room.minBet || 5000,
          isReady: true,
          isYou: userCtx?.user && room.players && (String(userCtx.user._id) === String(room.players[idx]?.user) || userCtx.user.username === room.players[idx]?.username),
          status: 'playing' as const,
          balance: (room.players && room.players[idx] && room.players[idx].balance) || 50000,
        }));
        setPlayers(mapped);
        setMyIndex(mapped.findIndex((m: any) => m.isYou));
        setDealerHand(deal.dealer || []);
        setDeck(deal.deck || []);
        setGamePhase('playing');
        setCurrentPlayerIndex(typeof deal.turnIndex === 'number' ? deal.turnIndex : 0);
        setTimeLeft(30);
        setMessage(mapped[deal.turnIndex] ? `Lượt của ${mapped[deal.turnIndex].name}` : (mapped[0] ? `Lượt của ${mapped[0].name}` : 'Đang chơi'));
      });
      s.on('room:finished', (data: any) => {
        if (!data || String(data.roomId) !== String(roomId)) return;
        const deal = data.deal || {};
        const room = data.room || {};
        // room.currentDeal may include results
        const results = (deal.results || []);
        const mapped = (room.players || []).map((p: any, idx: number) => {
          const r = results.find((x: any) => String(x.user) === String(p.user));
          return {
            id: idx,
            name: p.username || 'Người chơi',
            cards: (deal.players && deal.players[idx] && deal.players[idx].cards) || [],
            bet: p.bet || room.minBet || 5000,
            isReady: !!p.isReady,
            isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
            status: r ? (r.status === 'win' ? 'win' : r.status === 'push' ? 'push' : 'lose') : 'waiting',
            balance: p.balance || 50000,
            result: r ? (r.status === 'win' ? (r.winAmount ? `+${r.winAmount}` : 'Thắng') : r.status === 'push' ? 'Hòa' : 'Thua') : undefined,
            winAmount: r ? r.winAmount : undefined,
          };
        });
        setPlayers(mapped);
        setMyIndex(mapped.findIndex((m: any) => m.isYou));
        setDealerHand(deal.dealer || []);
        setDeck(deal.deck || []);
        setGamePhase('results');
        setMessage('Kết quả ván chơi');
        // let UI show results, server will reset room state; clients can rely on subsequent 'room:updated'
        setTimeout(() => {
          // ask server for fresh room state
          api.blackjackrooms.get(roomId as string).then(r => {
            const mapped2 = (r.players || []).map((p: any, idx: number) => ({
              id: idx,
              name: p.username || 'Người chơi',
              cards: [],
              bet: p.bet || r.minBet || 5000,
              isReady: !!p.isReady,
              isYou: userCtx?.user && (String(userCtx.user._id) === String(p.user) || userCtx.user.username === p.username),
              status: 'waiting' as const,
              balance: p.balance || 50000,
            }));
            setPlayers(mapped2);
            setDealerHand([]);
            setGamePhase('lobby');
            setMessage('Chờ người chơi sẵn sàng...');
          }).catch(()=>{});
        }, 8000);
      });
    } catch (err) {
      console.warn('Socket init failed', err);
    }
    return () => {
      if (socketRefLazy.current) {
        socketRefLazy.current.disconnect();
        socketRefLazy.current = null;
      }
    };
  }, [roomId]);

  const handleLeave = async () => {
    if (roomId && confirm('Bạn có chắc muốn rời phòng?')) {
      try {
        await api.blackjackrooms.leave(roomId as string);
      } catch (e) {
        console.warn('Leave request failed', e);
      }
      try { socketRefLazy.current?.emit('leaveRoom', roomId); } catch {};
      navigate('/blackjack');
    }
  };

  const getPlayerPosition = (index: number, total: number) => {
    // Position players in a semi-circle around the table
    if (total <= 3) {
      return index === 0 ? "bottom" : index === 1 ? "left" : "right";
    } else if (total <= 4) {
      const positions = ["bottom", "bottom-left", "top-left", "top-right"];
      return positions[index];
    } else {
      const positions = ["bottom", "bottom-left", "left", "top-left", "top-right", "right"];
      return positions[index];
    }
  };

  // Local single-player Blackjack component (rendered under Ready button)
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Phòng #{roomId}</h1>
            <p className="text-gray-300">{message}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full">
              <span className="font-bold">{balance.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
            >
              <Home className="w-4 h-4" />
              Rời phòng
            </button>
          </div>
        </div>

        {/* Game Table */}
        <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-6 md:p-12 shadow-2xl border-4 border-yellow-600/50 min-h-[700px]">
          {/* Dealer */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">Dealer</h3>
            {dealerHand.length > 0 && (
              <div className="mb-2">
                <span className="text-2xl font-bold">
                  {gamePhase === "playing" ? `${getHandTotal([dealerHand[0]])} + ?` : dealerTotal}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              {dealerHand.map((card, i) => (
                <Card key={i} card={card} size="lg" />
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="absolute inset-0 p-12">
              {players.map((player, index) => {
                // rotate positions so currentPlayerIndex appears at bottom (center)
                const total = players.length || 1;
                const posIndex = total > 0 ? ((index - currentPlayerIndex + total) % total) : index;
                const position = getPlayerPosition(posIndex, players.length);
                const isCurrentTurn = gamePhase === "playing" && index === currentPlayerIndex;
              
              let positionClass = "";
              if (position === "bottom") positionClass = "bottom-8 left-1/2 -translate-x-1/2";
              else if (position === "bottom-left") positionClass = "bottom-8 left-8";
              else if (position === "left") positionClass = "top-1/2 -translate-y-1/2 left-8";
              else if (position === "top-left") positionClass = "top-32 left-8";
              else if (position === "top-right") positionClass = "top-32 right-8";
              else if (position === "right") positionClass = "top-1/2 -translate-y-1/2 right-8";

              return (
                <div key={player.id} className={`absolute ${positionClass}`}>
                  <div
                    className={`bg-black/40 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all ${
                      isCurrentTurn
                        ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                        : player.status === "win"
                        ? "border-green-400"
                        : player.status === "lose" || player.status === "bust"
                        ? "border-red-400"
                        : "border-white/20"
                    } ${player.isYou ? "min-w-[300px]" : "min-w-[200px]"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {player.isYou && <span className="text-yellow-400">👤</span>}
                        <span className="font-bold">{player.name}</span>
                        {player.isReady && gamePhase === "lobby" && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      {isCurrentTurn && gamePhase === "playing" && (
                        <div className="flex items-center gap-1 bg-orange-500/30 px-2 py-1 rounded-full text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{timeLeft}s</span>
                        </div>
                      )}
                    </div>

                    {gamePhase !== "lobby" && (
                      <>
                        <div className="text-sm text-gray-400 mb-2">
                          Cược: {player.bet.toLocaleString('vi-VN')} VNĐ
                        </div>
                        
                        {player.cards.length > 0 && (
                          <>
                            <div className="text-lg font-bold mb-2">
                              {getHandTotal(player.cards)}
                              {player.status === "bust" && <span className="text-red-400 ml-2">BUST!</span>}
                            </div>
                            <div className="flex gap-1 flex-wrap justify-center">
                              {player.cards.map((card, i) => (
                                <Card key={i} card={card} size={player.isYou ? "md" : "sm"} />
                              ))}
                            </div>
                          </>
                        )}

                        {gamePhase === "results" && player.result && (
                          <div className={`mt-2 text-center font-bold ${
                            player.status === "win" ? "text-green-400" : 
                            player.status === "lose" || player.status === "bust" ? "text-red-400" : 
                            "text-yellow-400"
                          }`}>
                            {player.result}
                            {player.winAmount && player.winAmount > 0 && (
                              <div>+{player.winAmount.toLocaleString('vi-VN')} VNĐ</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-6">
          {gamePhase === "lobby" && yourPlayer && !yourPlayer.isReady && (
            <button
              onClick={handleReady}
              className="w-full py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 font-bold text-xl"
            >
              <CheckCircle className="w-6 h-6 inline mr-2" />
              Sẵn sàng
            </button>
          )}

          {/* Betting UI shown below Ready */}

          {gamePhase === 'lobby' && yourPlayer && !yourPlayer.isReady && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-4">
              <h3 className="text-xl font-bold mb-4">Đặt cược</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {quickBets.map(a => (
                  <button key={a} onClick={() => setRoomBet(a)} className={`py-3 rounded-xl font-bold transition-all ${roomBet===a? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg':'bg-gray-700 hover:bg-gray-600'}`}>
                    {a.toLocaleString('vi-VN')}
                  </button>
                ))}
              </div>
              <input type="number" value={roomBet} onChange={(e)=>setRoomBet(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white/10 mb-4" min={1000} max={balance} />
              <button onClick={placeRoomBet} className="w-full py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 font-bold">Đặt cược</button>
            </div>
          )}

          {gamePhase === "playing" && currentPlayerIndex === myIndex && yourPlayer?.status === "playing" && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleHit}
                className="py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-lg font-bold text-lg"
              >
                HIT
              </button>
              <button
                onClick={handleStand}
                className="py-4 rounded-xl bg-red-600 hover:bg-red-700 transition-all shadow-lg font-bold text-lg"
              >
                STAND
              </button>
              <button
                onClick={handleDouble}
                disabled={yourPlayer.bet > balance}
                className="py-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all shadow-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                DOUBLE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

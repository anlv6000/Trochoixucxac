import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { Wallet, History, Info, Home } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Dice } from "../components/Dice";

type BetType = "tai" | "xiu" | "total" | "pair" | null;

export function TaiXiu() {
  const { balance, setBalance } = useUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetType>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(5000);
  const [placing, setPlacing] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [resultSessionId, setResultSessionId] = useState<string | null>(null);
  const [countdownLabel, setCountdownLabel] = useState<string | null>(null);
  const [countdownSecs, setCountdownSecs] = useState<number>(0);
  const [spinnerDice, setSpinnerDice] = useState<number[]>([1, 1, 1]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [placedBets, setPlacedBets] = useState<Record<string, any>>({});
  const [sessionOutcome, setSessionOutcome] = useState<Record<string, { net: number; bets: any[] }>>({});
  const [totalTai, setTotalTai] = useState<number>(0);
  const [totalXiu, setTotalXiu] = useState<number>(0);
  const [userBetTai, setUserBetTai] = useState<number>(0);
  const [userBetXiu, setUserBetXiu] = useState<number>(0);

  const quickAmounts = [1000, 5000, 10000, 50000];
  // balance comes from UserContext

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const res = await (await import('../api')).api.sessions.list();
        if (!mounted) return;

        setSessions(res || []);

        // tìm phiên đang hoạt động
        const now = Date.now();
        const active = (res || []).find((s: any) => {
          const start = new Date(s.startAt).getTime();
          const end = new Date(s.endAt).getTime();
          return now >= start && now < end;
        });
        setCurrentSession(active || null);

        // khôi phục trạng thái cược từ localStorage
        if (active) {
          try {
            const saved = localStorage.getItem('bet:' + active._id);
            if (saved) {
              setPlacedBets((p) => ({ ...p, [active._id]: JSON.parse(saved) }));
            }
          } catch (e) { }
        }

        // xử lý khi phiên có kết quả
        if (active && active.status === 'result' && active.result) {
          const dismissed = localStorage.getItem('dismissed:' + active._id);
          if (!dismissed) {
            setLastResult(active.result);
            setResultSessionId(active._id);

            // lấy outcome và balance từ API
            (async () => {
              try {
                const apiMod = await import('../api');
                if (apiMod.api.tx && apiMod.api.tx.me) {
                  const me = await apiMod.api.tx.me();

                  // cập nhật balance từ API
                  if (me.balance !== undefined) {
                    setBalance(me.balance);
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    if (user) {
                      user.balance = me.balance;
                      localStorage.setItem('user', JSON.stringify(user));
                    }
                  }

                  // tính toán outcome cho phiên
                  const txs = me.transactions || me.txs || [];
                  const related = txs.filter((t: any) => t.meta && t.meta.sessionId === active._id);
                  const net = related.reduce((s: number, t: any) => s + (t.amount || 0), 0);

                  const bets = me.bets || [];
                  const myBets = bets.filter((b: any) => String(b.session) === String(active._id));

                  setSessionOutcome((so) => ({
                    ...so,
                    [active._id]: { net, bets: myBets }
                  }));
                }
              } catch (e) {
                // ignore
              }
            })();
          } else {
            setLastResult(null);
            setResultSessionId(null);
          }
        } else {
          setLastResult(null);
          setResultSessionId(null);
        }

        // nếu có phiên active thì lấy tổng cược cho tai/xiu và cược của người dùng
        if (active) {
          try {
            const apiMod = await import('../api');
            // lấy danh sách cược của phiên
            try {
              const full = await apiMod.api.sessions.get(active._id);
              const bets = full.bets || [];
              const tai = bets.filter((b: any) => b.choice === 'tai').reduce((s: number, b: any) => s + (b.amount || 0), 0);
              const xiu = bets.filter((b: any) => b.choice === 'xiu').reduce((s: number, b: any) => s + (b.amount || 0), 0);
              setTotalTai(tai);
              setTotalXiu(xiu);
            } catch (e) {
              setTotalTai(0);
              setTotalXiu(0);
            }

            // lấy cược của người dùng cho phiên (nếu đăng nhập)
            try {
              if (apiMod.api.tx && apiMod.api.tx.me) {
                const me = await apiMod.api.tx.me();
                const myBets = (me.bets || []).filter((b: any) => String(b.session) === String(active._id));
                const myTai = myBets.filter((b: any) => b.choice === 'tai').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                const myXiu = myBets.filter((b: any) => b.choice === 'xiu').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                setUserBetTai(myTai);
                setUserBetXiu(myXiu);
              }
            } catch (e) {
              setUserBetTai(0);
              setUserBetXiu(0);
            }
          } catch (e) {
            // ignore
          }
        } else {
          setTotalTai(0);
          setTotalXiu(0);
          setUserBetTai(0);
          setUserBetXiu(0);
        }
      } catch (err) {
        // ignore
      }
    }

    poll();
    const id = setInterval(poll, 2000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);


  // Countdown + dice spinner effect
  useEffect(() => {
    let tickId: any = null;
    let spinId: any = null;
    let revealTimeout: any = null;

    function formatMs(ms: number) {
      const s = Math.max(0, Math.floor(ms / 1000));
      const mm = Math.floor(s / 60).toString().padStart(2, '0');
      const ss = (s % 60).toString().padStart(2, '0');
      return `${mm}:${ss}`;
    }

    function update() {
      if (!currentSession) {
        setCountdownLabel(null);
        setCountdownSecs(0);
        setIsSpinning(false);
        return;
      }
      const now = Date.now();
      const openUntil = new Date(currentSession.openUntil).getTime();
      const resultUntil = new Date(currentSession.resultUntil).getTime();
      const start = new Date(currentSession.startAt).getTime();
      if (now < openUntil) {
        const rem = openUntil - now;
        setCountdownLabel('Đóng cược trong');
        setCountdownSecs(Math.ceil(rem / 1000));
        setIsSpinning(false);
      } else if (now >= openUntil && now < resultUntil) {
        const rem = resultUntil - now;
        setCountdownLabel('Kết quả trong');
        setCountdownSecs(Math.ceil(rem / 1000));
        // start spinner animation while waiting for reveal
        if (!isSpinning) {
          setIsSpinning(true);
          // spin dice rapidly
          spinId = setInterval(() => {
            setSpinnerDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
          }, 120);
          // reveal final result after a short animation (1.2s)
          revealTimeout = setTimeout(() => {
            const final = currentSession.result || lastResult;
            if (final && final.dice) {
              setSpinnerDice(final.dice);
            }
            setIsSpinning(false);
            if (spinId) { clearInterval(spinId); spinId = null; }
          }, 1200);
        }
      } else {
        // waiting/gap
        const rem = Math.max(0, start - now);
        setCountdownLabel('Phiên bắt đầu trong');
        setCountdownSecs(Math.ceil(rem / 1000));
        setIsSpinning(false);
      }
    }

    // initial update and tick every 500ms for smooth countdown
    update();
    tickId = setInterval(update, 500);

    return () => {
      if (tickId) clearInterval(tickId);
      if (spinId) clearInterval(spinId);
      if (revealTimeout) clearTimeout(revealTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession, lastResult]);

  const placeBet = async () => {
    if (!currentSession) return alert('Không có phiên mở để đặt cược');
    if (!selectedBet) return alert('Chọn tài hoặc xỉu');
    if (betAmount <= 0 || betAmount > balance) return alert('Số tiền không hợp lệ');
    setPlacing(true);
    try {
      const apiMod = await import('../api');
      const res = await apiMod.api.bets.place(
        currentSession._id,
        selectedBet,
        betAmount,
        selectedValue !== null ? selectedValue : undefined
      );

      // lưu trạng thái cược
      const betInfo = { choice: selectedBet, amount: betAmount, choiceValue: selectedValue };
      setPlacedBets((p) => ({ ...p, [currentSession._id]: betInfo }));
      localStorage.setItem('bet:' + currentSession._id, JSON.stringify(betInfo));

      // gọi lại API để lấy số dư mới
      const me = await apiMod.api.tx.me();
      if (me.balance !== undefined) {
        setBalance(me.balance);
      }
    } catch (err: any) {
      alert(err.message || 'Place bet failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Game Tài Xỉu
            </h1>
            <p className="text-gray-300">Đặt cược và thử vận may của bạn!</p>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-lg">{balance.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Dice Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dice Display */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 shadow-2xl shadow-red-500/20">
              <div className="flex flex-col items-center gap-4 mb-6 min-h-[150px]">
                {currentSession ? (
                  <>
                    <div className="text-center">
                      <div className="text-sm text-gray-300">Phiên hiện tại</div>
                      <div className="text-xl font-bold">{currentSession._id}</div>
                      <div className="text-sm text-gray-400">Trạng thái: {currentSession.status}</div>
                      <div className="text-sm text-gray-400">Kết thúc: {new Date(currentSession.endAt).toLocaleTimeString()}</div>
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-3">
                      {countdownLabel && (
                        <div className="text-sm text-gray-300">{countdownLabel} <span className="font-bold">{String(Math.floor(countdownSecs / 60)).padStart(2, '0')}:{String(countdownSecs % 60).padStart(2, '0')}</span></div>
                      )}

                      {/* Dice display / spinner using Dice component */}
                      <div className="flex items-center gap-4 mt-3">
                        {[0, 1, 2].map((_, i) => {
                          const final = (currentSession && currentSession.result) || lastResult;
                          const showFinal = currentSession && currentSession.status === 'result' && final && final.dice;
                          const value = showFinal ? final.dice[i] : (spinnerDice[i] || 1);
                          const rolling = !!(isSpinning && !(currentSession && currentSession.status === 'result'));
                          return (
                            <Dice key={i} value={value} rolling={rolling} />
                          );
                        })}
                      </div>

                      {/* show final sum when result is available */}
                      {currentSession.status === 'result' && (currentSession.result || lastResult) && (
                        <div className="mt-4 text-xl font-bold">Tổng: {(currentSession.result || lastResult).sum}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-300">Hiện không có phiên mở, chờ phiên tiếp theo...</div>
                )}
              </div>
            </div>

            {/* Betting Area */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Khu vực đặt cược</h3>

              {/* Tai/Xiu Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => {
                    if (currentSession && placedBets[currentSession._id]) return;
                    setSelectedBet("tai");
                    setSelectedValue(null);
                  }}
                  disabled={!!(currentSession && placedBets[currentSession._id])}
                  className={`py-6 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 ${selectedBet === "tai"
                      ? "bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-500/50 scale-105"
                      : "bg-green-600 hover:bg-green-700"
                    } ${currentSession && placedBets[currentSession._id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  TÀI (11-18)
                </button>
                <button
                  onClick={() => {
                    if (currentSession && placedBets[currentSession._id]) return;
                    setSelectedBet("xiu");
                    setSelectedValue(null);
                  }}
                  disabled={!!(currentSession && placedBets[currentSession._id])}
                  className={`py-6 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 ${selectedBet === "xiu"
                      ? "bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/50 scale-105"
                      : "bg-red-600 hover:bg-red-700"
                    } ${currentSession && placedBets[currentSession._id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  XỈU (3-10)
                </button>
              </div>

              {/* Display current user's bet and total bets for Tai / Xiu */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <div className="text-sm text-gray-300">TÀI</div>
                  <div className="text-lg font-bold text-green-300">Bạn: {userBetTai ? userBetTai.toLocaleString('vi-VN') : '0'} VNĐ</div>
                  <div className="text-sm text-gray-400">Tổng: {totalTai ? totalTai.toLocaleString('vi-VN') : '0'} VNĐ</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <div className="text-sm text-gray-300">XỈU</div>
                  <div className="text-lg font-bold text-red-300">Bạn: {userBetXiu ? userBetXiu.toLocaleString('vi-VN') : '0'} VNĐ</div>
                  <div className="text-sm text-gray-400">Tổng: {totalXiu ? totalXiu.toLocaleString('vi-VN') : '0'} VNĐ</div>
                </div>
              </div>

              {/* Total Points */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-300">Tổng điểm (x6)</h4>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }, (_, i) => i + 4).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (currentSession && placedBets[currentSession._id]) return;
                        setSelectedBet("total");
                        setSelectedValue(num);
                      }}
                      disabled={!!(currentSession && placedBets[currentSession._id])}
                      className={`py-3 rounded-lg font-bold transition-all transform hover:scale-110 ${selectedBet === "total" && selectedValue === num
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50 scale-110"
                          : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pairs */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-300">Cặp số đôi (x3)</h4>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (currentSession && placedBets[currentSession._id]) return;
                        setSelectedBet("pair");
                        setSelectedValue(num);
                      }}
                      disabled={!!(currentSession && placedBets[currentSession._id])}
                      className={`py-3 rounded-lg font-bold transition-all transform hover:scale-110 ${selectedBet === "pair" && selectedValue === num
                          ? "bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/50 scale-110"
                          : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                      Đôi {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Amount */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-300">Số tiền cược</h4>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => { if (!(currentSession && placedBets[currentSession._id])) setBetAmount(amount); }}
                      disabled={!!(currentSession && placedBets[currentSession._id])}
                      className={`py-2 rounded-lg font-medium transition-all ${betAmount === amount
                          ? "bg-blue-600 shadow-lg shadow-blue-500/50"
                          : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                      {amount.toLocaleString('vi-VN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => { if (!(currentSession && placedBets[currentSession._id])) setBetAmount(Number(e.target.value)); }}
                  disabled={!!(currentSession && placedBets[currentSession._id])}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white"
                  placeholder="Nhập số tiền tùy chỉnh"
                  min={1000}
                  max={balance}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={placeBet}
              disabled={placing || !selectedBet || (currentSession && !!placedBets[currentSession._id])}
              className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all shadow-2xl ${placing || !selectedBet || (currentSession && !!placedBets[currentSession._id])
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-yellow-500/50 hover:shadow-yellow-500/70 transform hover:scale-105"
                }`}
            >
              {currentSession && placedBets[currentSession._id] ? 'Đã đặt cược' : (placing ? "Đang đặt cược..." : "Đặt cược")}
            </button>
          </div>

          {/* Right: Info & History */}
          <div className="space-y-6">
            {/* Game Rules */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">Luật chơi</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <span className="text-green-400">Tài:</span> Tổng 11-18 (x2)</li>
                <li>• <span className="text-red-400">Xỉu:</span> Tổng 3-10 (x2)</li>
                <li>• <span className="text-yellow-400">Tổng điểm:</span> Đoán chính xác (x6)</li>
                <li>• <span className="text-purple-400">Cặp đôi:</span> 2+ xúc xắc giống nhau (x3)</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all"
                >
                  <History className="w-5 h-5" />
                  Lịch sử cược
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Thoát game
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Popup */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (resultSessionId) localStorage.setItem('dismissed:' + resultSessionId, '1');
              setLastResult(null);
              setResultSessionId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`bg-gradient-to-br from-blue-900 to-slate-900 backdrop-blur-xl rounded-3xl p-8 border-2 shadow-2xl max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🎲</div>
                <h2 className="text-2xl font-bold mb-2">Kết quả phiên</h2>
                <div className="text-gray-300 mb-4">Tổng điểm: <span className="font-bold text-xl">{lastResult.sum}</span></div>
                <div className="flex justify-center gap-3 mb-6">
                  {(lastResult.dice || []).map((d: number, i: number) => (
                    <div key={i} className="w-16 h-16">
                      <Dice value={d} rolling={false} />
                    </div>
                  ))}
                </div>
                {/* Personal outcome */}
                {resultSessionId && sessionOutcome[resultSessionId] && (
                  <div className="mb-4 p-4 bg-white/5 rounded-lg text-left">
                    <div className="text-sm text-gray-300 mb-2">Kết quả cho bạn</div>
                    <div className="font-bold text-lg mb-1">
                      {sessionOutcome[resultSessionId].net > 0 ? 'Bạn thắng' : sessionOutcome[resultSessionId].net < 0 ? 'Bạn thua' : 'Hoà'}
                      : <span className={`ml-2 ${sessionOutcome[resultSessionId].net > 0 ? 'text-green-400' : sessionOutcome[resultSessionId].net < 0 ? 'text-red-400' : 'text-gray-300'}`}>{Math.abs(sessionOutcome[resultSessionId].net).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    {sessionOutcome[resultSessionId].bets && sessionOutcome[resultSessionId].bets.length > 0 && (
                      <div className="text-sm text-gray-300">Đặt: {sessionOutcome[resultSessionId].bets.map((b: any) => `${b.choice}${b.choiceValue ? ' ' + b.choiceValue : ''} x${b.amount}`).join(', ')}</div>
                    )}
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-gray-300 mb-2">Kết luận</div>
                  <div className="text-3xl font-bold">{lastResult.sum >= 11 ? 'TÀI' : 'XỈU'}</div>
                </div>
                <button
                  onClick={() => {
                    if (resultSessionId) localStorage.setItem('dismissed:' + resultSessionId, '1');
                    setLastResult(null);
                    setResultSessionId(null);
                  }}
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

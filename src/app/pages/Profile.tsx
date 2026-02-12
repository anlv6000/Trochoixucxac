import { useState, useEffect } from "react";
import { User, Wallet, History, Settings, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { useUser } from "../contexts/UserContext";

export function Profile() {
  const { user, balance, setBalance } = useUser();
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const apiMod = await import('../api');
        const res = await apiMod.api.tx.me();
        setTransactions(res.transactions || []);
        setBets(res.bets || []);
        if (res && typeof res.balance !== 'undefined') {
          setBalance(res.balance);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);


  // balance comes from UserContext; no localStorage read needed

  // Animate balance counter
  useEffect(() => {
    let start = 0;
    const end = balance;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedBalance(end);
        clearInterval(timer);
      } else {
        setAnimatedBalance(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [balance]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'player')}`}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-lg shadow-yellow-500/50"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user?.username || '—'}</h1>
              <p className="text-gray-300 mb-1">{user?.email || ''}</p>
              <p className="text-sm text-gray-400">ID: {user?.id || user?._id || '-'}</p>
              <p className="text-sm text-gray-400">Tham gia: -</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg shadow-green-500/50">
                <Wallet className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm text-gray-200 mb-1">Số dư hiện tại</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {animatedBalance.toLocaleString('vi-VN')}
                </p>
                <p className="text-sm text-gray-200">VNĐ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(() => {
            const totalBets = bets.length;
            const wins = bets.filter(b => b.status === 'won').length;
            const winRate = totalBets ? Math.round((wins / totalBets) * 100) : 0;
            const totalWon = bets.filter(b => b.status === 'won').reduce((s, b) => s + (b.payout || 0), 0);
            const totalLost = bets.filter(b => b.status === 'lost').reduce((s, b) => s + (b.amount || 0), 0);
            return (
              <>
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="text-gray-400 text-sm mb-2">Tổng cược</div>
                  <div className="text-2xl font-bold">{totalBets}</div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="text-gray-400 text-sm mb-2">Tỷ lệ thắng</div>
                  <div className="text-2xl font-bold text-green-400">{winRate}%</div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="text-gray-400 text-sm mb-2">Tổng thắng</div>
                  <div className="text-2xl font-bold text-green-400">+{totalWon.toLocaleString('vi-VN')}</div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="text-gray-400 text-sm mb-2">Tổng thua</div>
                  <div className="text-2xl font-bold text-red-400">-{totalLost.toLocaleString('vi-VN')}</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/50">
            <Settings className="w-5 h-5" />
            Chỉnh sửa thông tin
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/50">
            <User className="w-5 h-5" />
            Đổi mật khẩu
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/50">
            <User className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>

        {/* Betting History */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Lịch sử cược (10 lượt gần nhất)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Thời gian</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Game</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Cược</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Số tiền</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Kết quả</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Lãi/Lỗ</th>
                </tr>
              </thead>
              <tbody>
                {bets.slice(0, 10).map((bet: any) => {
                  const time = new Date(bet.createdAt).toLocaleString();
                  const game = 'Tài Xỉu';
                  const choice = bet.choice || '-';
                  const amount = bet.amount || 0;
                  const result = bet.status === 'won' ? 'Thắng' : bet.status === 'lost' ? 'Thua' : '-';
                  const profit = (bet.payout || 0) - amount;
                  return (
                    <tr key={bet._id || bet.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-300">{time}</td>
                      <td className="py-3 px-4">{game}</td>
                      <td className="py-3 px-4 text-gray-300">{choice}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{amount > 0 ? amount.toLocaleString('vi-VN') : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${result === 'Thắng' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {result === 'Thắng' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>{profit > 0 ? '+' : ''}{profit.toLocaleString('vi-VN')}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

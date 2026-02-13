import { Link } from "react-router";
import { Dices, Wallet, CreditCard, Gift, TrendingUp, Shield, Zap } from "lucide-react";

export function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 p-8 md:p-16 mb-12 shadow-2xl shadow-purple-500/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-400/50 shadow-lg shadow-yellow-500/30">
              <Dices className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-bold">Casino #1 Việt Nam</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              Chơi Tài Xỉu
            </span>
            <br />
            <span className="text-white drop-shadow-lg">Thắng lớn ngay hôm nay</span>
          </h1>

          <p className="text-xl text-gray-200 mb-8 drop-shadow">
            Trải nghiệm casino trực tuyến hàng đầu với tỷ lệ thắng cao nhất
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 font-bold text-black text-lg transform hover:scale-105"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/30 font-bold text-lg transform hover:scale-105"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Features (kept only Lucky Wheel) */}
      <div className="grid md:grid-cols-1 gap-6 mb-12">
        <Link
          to="/lucky-wheel"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Vòng quay may mắn</h3>
            <p className="text-gray-200">Quay ngay để nhận thưởng hấp dẫn</p>
          </div>
        </Link>
      </div>

      {/* Game Tai Xiu CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 md:p-12 mb-12 shadow-2xl shadow-green-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Game Tài Xỉu</h2>
            <p className="text-xl text-gray-100 mb-4">Đặt cược thông minh, thắng lớn mỗi ngày</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>Tỷ lệ thắng cao</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Zap className="w-4 h-4" />
                <span>Kết quả nhanh</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span>100% minh bạch</span>
              </div>
            </div>
          </div>
          <Link
            to="/tai-xiu"
            className="px-10 py-5 rounded-full bg-white text-green-700 hover:bg-gray-100 transition-all shadow-lg font-bold text-xl transform hover:scale-105"
          >
            Chơi ngay
          </Link>
        </div>
      </div>
      {/* Card Games Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Game Bài</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/blackjack"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 p-8 hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">🃏</div>
              <h3 className="text-2xl font-bold mb-2">Blackjack Multiplayer</h3>
              <p className="text-gray-200">Chơi cùng bạn bè! Tối đa 6 người một phòng</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">👥 Nhiều người</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">🎮 Phòng riêng</span>
              </div>
            </div>
          </Link>

          <Link
            to="/ba-cay"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-pink-800 p-8 hover:shadow-2xl hover:shadow-rose-500/50 transition-all transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">🎴</div>
              <h3 className="text-2xl font-bold mb-2">Ba Cây (3 Cây)</h3>
              <p className="text-gray-200">Tính điểm hàng đơn vị, cao nhất thắng</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">🎯 Đơn giản</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">⚡ Nhanh</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Bảo mật tuyệt đối</h3>
          <p className="text-gray-300">Hệ thống bảo mật hàng đầu, giao dịch an toàn 100%</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Giao dịch nhanh chóng</h3>
          <p className="text-gray-300">Nạp rút tiền trong vòng 5 phút, 24/7</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Tỷ lệ thắng cao</h3>
          <p className="text-gray-300">Hệ thống công bằng, minh bạch, tỷ lệ thắng tốt nhất</p>
        </div>
      </div>
    </div>
  );
}

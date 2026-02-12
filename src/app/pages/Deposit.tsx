import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { CreditCard, Wallet, Smartphone, Home } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";

type PaymentMethod = "atm" | "momo" | "card";

export function Deposit() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("atm");
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const quickAmounts = [50000, 100000, 500000, 1000000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000 VNĐ");
      return;
    }
    const { setBalance } = useUser();
    (async () => {
      try {
        const apiMod = await import('../api');
        const res = await apiMod.api.tx.deposit(Number(amount));
        setShowSuccess(true);
        if (res && typeof res.balance !== 'undefined') {
          setBalance(res.balance);
        }
      } catch (err: any) {
        alert(err.message || 'Deposit failed');
      }
    })();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Nạp tiền</h1>
          <p className="text-gray-300">Chọn phương thức và số tiền muốn nạp</p>
        </div>

        {/* Main Form */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-200">
                Phương thức thanh toán
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("atm")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === "atm"
                      ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <div className="font-bold">Thẻ ATM</div>
                  <div className="text-xs text-gray-400 mt-1">Nhanh chóng</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("momo")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === "momo"
                      ? "border-pink-400 bg-pink-500/20 shadow-lg shadow-pink-500/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                  <div className="font-bold">Momo</div>
                  <div className="text-xs text-gray-400 mt-1">Tiện lợi</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === "card"
                      ? "border-orange-400 bg-orange-500/20 shadow-lg shadow-orange-500/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                  <div className="font-bold">Thẻ cào</div>
                  <div className="text-xs text-gray-400 mt-1">Đơn giản</div>
                </button>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-200">
                Chọn nhanh số tiền
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      amount === quickAmount.toString()
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {quickAmount.toLocaleString('vi-VN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Hoặc nhập số tiền tùy chỉnh
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white text-lg placeholder-gray-400"
                placeholder="Nhập số tiền (VNĐ)"
                min={10000}
                required
              />
              <div className="text-sm text-gray-400 mt-2">
                Số tiền nạp tối thiểu: 10.000 VNĐ
              </div>
            </div>

            {/* ATM Details */}
            {selectedMethod === "atm" && (
              <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Số thẻ ATM
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400"
                    placeholder="xxxx xxxx xxxx xxxx"
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Tên chủ thẻ
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400"
                    placeholder="NGUYEN VAN A"
                  />
                </div>
              </div>
            )}

            {/* Momo Details */}
            {selectedMethod === "momo" && (
              <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Số điện thoại Momo
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 text-white placeholder-gray-400"
                    placeholder="0xxxxxxxxx"
                    maxLength={10}
                  />
                </div>
              </div>
            )}

            {/* Card Details */}
            {selectedMethod === "card" && (
              <div className="space-y-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Loại thẻ
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white">
                    <option value="viettel">Viettel</option>
                    <option value="vinaphone">Vinaphone</option>
                    <option value="mobifone">Mobifone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Mã thẻ
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white placeholder-gray-400"
                    placeholder="Nhập mã thẻ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Số serial
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white placeholder-gray-400"
                    placeholder="Nhập số serial"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 font-bold text-lg transform hover:scale-105"
            >
              Xác nhận nạp tiền
            </button>
          </form>
        </div>

        {/* Back Link */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </Link>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-green-900 to-emerald-900 backdrop-blur-xl rounded-3xl p-8 border-2 border-green-400 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold mb-4 text-green-400">Thành công!</h2>
                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                  <div className="text-gray-300 mb-2">Số tiền nạp</div>
                  <div className="text-4xl font-bold text-yellow-400">
                    +{Number(amount).toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
                <p className="text-gray-300 mb-6">
                  Giao dịch đang được xử lý. Tiền sẽ được cộng vào tài khoản trong vòng 5 phút.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
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

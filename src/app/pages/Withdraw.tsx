import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { Wallet, Home, DollarSign } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export function Withdraw() {
  const { balance, setBalance } = useUser();
  const [amount, setAmount] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const quickAmounts = [10000, 50000, 100000, balance];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);
    
    if (!amount || withdrawAmount < 10000) {
      alert("Số tiền rút tối thiểu là 10.000 VNĐ");
      return;
    }
    
    if (withdrawAmount > balance) {
      alert("Số dư không đủ!");
      return;
    }
    
    if (!bankNumber || !bankName || !accountName) {
      alert("Vui lòng điền đầy đủ thông tin tài khoản!");
      return;
    }
    
    (async () => {
      try {
        const apiMod = await import('../api');
        const res = await apiMod.api.tx.withdraw(withdrawAmount);
        setShowSuccess(true);
        if (res && typeof res.balance !== 'undefined') {
          setBalance(res.balance);
        }
      } catch (err: any) {
        alert(err.message || 'Withdraw failed');
      }
    })();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/50">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Rút tiền</h1>
          <p className="text-gray-300">Rút tiền nhanh chóng và an toàn</p>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-6 shadow-lg shadow-green-500/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-6 h-6" />
            <span className="text-gray-200">Số dư khả dụng</span>
          </div>
          <div className="text-4xl font-bold text-yellow-400">
            {balance.toLocaleString('vi-VN')} VNĐ
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-200">
                Chọn nhanh số tiền
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAmounts.map((quickAmount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      amount === quickAmount.toString()
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {index === quickAmounts.length - 1 ? "Tất cả" : quickAmount.toLocaleString('vi-VN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Số tiền muốn rút
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white text-lg placeholder-gray-400"
                placeholder="Nhập số tiền (VNĐ)"
                min={10000}
                max={balance}
                required
              />
              <div className="text-sm text-gray-400 mt-2">
                Số tiền rút tối thiểu: 10.000 VNĐ
              </div>
            </div>

            {/* Bank Information */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl space-y-4">
              <h3 className="font-bold text-lg">Thông tin tài khoản nhận</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Tên ngân hàng
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white"
                  required
                >
                  <option value="">Chọn ngân hàng</option>
                  <option value="vietcombank">Vietcombank</option>
                  <option value="techcombank">Techcombank</option>
                  <option value="vcb">VCB</option>
                  <option value="bidv">BIDV</option>
                  <option value="agribank">Agribank</option>
                  <option value="mbbank">MBBank</option>
                  <option value="acb">ACB</option>
                  <option value="tpbank">TPBank</option>
                  <option value="sacombank">Sacombank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white placeholder-gray-400"
                  placeholder="Nhập số tài khoản"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-white placeholder-gray-400"
                  placeholder="NGUYEN VAN A"
                  required
                />
              </div>
            </div>

            {/* Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="text-sm text-gray-300">
                  <p className="mb-2">
                    <strong>Lưu ý:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Thời gian xử lý: 5-15 phút</li>
                    <li>Phí rút tiền: 0đ (Miễn phí)</li>
                    <li>Vui lòng kiểm tra kỹ thông tin tài khoản</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70 font-bold text-lg transform hover:scale-105"
            >
              Xác nhận rút tiền
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
                <h2 className="text-3xl font-bold mb-4 text-green-400">Yêu cầu thành công!</h2>
                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                  <div className="text-gray-300 mb-2">Số tiền rút</div>
                  <div className="text-4xl font-bold text-yellow-400">
                    {Number(amount).toLocaleString('vi-VN')} VNĐ
                  </div>
                  <div className="mt-4 text-sm text-gray-300">
                    <div>Ngân hàng: {bankName.toUpperCase()}</div>
                    <div>Số TK: {bankNumber}</div>
                    <div>Chủ TK: {accountName}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">
                  Yêu cầu rút tiền đang được xử lý. Tiền sẽ về tài khoản trong vòng 5-15 phút.
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

import { useState } from "react";
import { Gift, Wallet, Home } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";

interface Prize {
  id: number;
  label: string;
  value: number;
  color: string;
}

export function LuckyWheel() {
  const [balance, setBalance] = useState(50000);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [spinCount, setSpinCount] = useState(3);

  const prizes: Prize[] = [
    { id: 1, label: "5.000", value: 5000, color: "#EF4444" },
    { id: 2, label: "Free Bet", value: 10000, color: "#F59E0B" },
    { id: 3, label: "10.000", value: 10000, color: "#10B981" },
    { id: 4, label: "Bonus 2x", value: 20000, color: "#3B82F6" },
    { id: 5, label: "3.000", value: 3000, color: "#8B5CF6" },
    { id: 6, label: "50.000", value: 50000, color: "#EC4899" },
    { id: 7, label: "7.000", value: 7000, color: "#F97316" },
    { id: 8, label: "Bonus 3x", value: 30000, color: "#06B6D4" },
  ];

  const spinWheel = () => {
    if (spinning || spinCount <= 0) {
      if (spinCount <= 0) {
        alert("Bạn đã hết lượt quay! Quay lại vào ngày mai.");
      }
      return;
    }

    setSpinning(true);
    setShowResult(false);
    setSpinCount(spinCount - 1);

    // Random prize
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];

    // Calculate rotation (minimum 5 full rotations + position)
    const segmentAngle = 360 / prizes.length;
    const prizeAngle = randomIndex * segmentAngle;
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = rotation + spins * 360 + (360 - prizeAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setWonPrize(prize);
      setBalance(balance + prize.value);
      setShowResult(true);
    }, 5000);
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Vòng quay may mắn
            </h1>
            <p className="text-gray-300">Quay ngay để nhận thưởng hấp dẫn!</p>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-lg">{balance.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>

        {/* Spin Count */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-purple-600/30 border border-purple-400 rounded-full px-6 py-3">
            <Gift className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-bold">
              Lượt quay còn lại: <span className="text-yellow-400">{spinCount}</span>
            </span>
          </div>
        </div>

        {/* Wheel Container */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-purple-500/30 shadow-2xl shadow-purple-500/20 mb-6">
          <div className="relative max-w-md mx-auto aspect-square">
            {/* Center Pin */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400 drop-shadow-lg"></div>
            </div>

            {/* Wheel */}
            <motion.div
              className="relative w-full h-full rounded-full shadow-2xl overflow-hidden"
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: "easeOut" }}
              style={{
                transformOrigin: "center",
              }}
            >
              {/* Wheel segments */}
              {prizes.map((prize, index) => {
                const angle = index * segmentAngle;
                return (
                  <div
                    key={prize.id}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: "center",
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-start justify-end pr-4 pt-8"
                      style={{
                        backgroundColor: prize.color,
                        clipPath: `polygon(0 0, 100% 0, 0 100%)`,
                        transform: `rotate(${segmentAngle}deg)`,
                      }}
                    >
                      <span
                        className="font-bold text-white text-lg drop-shadow-lg"
                        style={{
                          transform: `rotate(${segmentAngle / 2 - 90}deg)`,
                        }}
                      >
                        {prize.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl border-4 border-white flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Spin Button */}
        <motion.button
          onClick={spinWheel}
          disabled={spinning || spinCount <= 0}
          className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all shadow-2xl ${
            spinning || spinCount <= 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-yellow-500/50 hover:shadow-yellow-500/70 transform hover:scale-105"
          }`}
          animate={
            !spinning && spinCount > 0
              ? {
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {spinning ? "Đang quay..." : spinCount <= 0 ? "Hết lượt quay" : "QUAY NGAY"}
        </motion.button>

        {/* Prize List */}
        <div className="mt-8 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Danh sách phần thưởng
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="p-4 rounded-xl text-center font-bold"
                style={{ backgroundColor: prize.color + "30", borderColor: prize.color }}
              >
                {prize.label}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </div>

      {/* Result Popup */}
      <AnimatePresence>
        {showResult && wonPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              className="bg-gradient-to-br from-yellow-900 to-orange-900 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3,
                  }}
                >
                  🎊
                </motion.div>
                <h2 className="text-3xl font-bold mb-4 text-yellow-400">CHÚC MỪNG!</h2>
                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                  <div className="text-gray-300 mb-2">Bạn đã trúng</div>
                  <div
                    className="text-5xl font-bold mb-2 py-4 px-6 rounded-xl inline-block"
                    style={{ backgroundColor: wonPrize.color }}
                  >
                    {wonPrize.label}
                  </div>
                  <div className="text-3xl font-bold text-green-400 mt-4">
                    +{wonPrize.value.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
                <div className="mb-4 text-gray-300">
                  Phần thưởng đã được cộng vào tài khoản của bạn!
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-bold text-lg"
                >
                  Tuyệt vời!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

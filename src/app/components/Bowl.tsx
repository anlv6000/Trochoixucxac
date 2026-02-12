import { motion } from "motion/react";

interface BowlProps {
  covering: boolean; // true khi đang úp bát, false khi mở
}

export function Bowl({ covering }: BowlProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: covering ? 0 : -150, opacity: covering ? 1 : 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="absolute w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-gray-700 to-black rounded-full shadow-2xl flex items-center justify-center"
      style={{
        borderRadius: "50% / 50%", // tạo cảm giác bát úp
      }}
    >
      {/* có thể thêm highlight để nhìn giống gốm */}
      <div className="w-20 h-10 bg-white/10 rounded-full blur-md" />
    </motion.div>
  );
}

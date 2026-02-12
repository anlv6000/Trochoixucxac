import { motion } from "motion/react";

interface DiceProps {
  value: number;
  rolling: boolean;
}

export function Dice({ value, rolling }: DiceProps) {
  const getDots = (num: number) => {
    const dotPositions: { [key: number]: string[] } = {
      1: ["center"],
      2: ["top-left", "bottom-right"],
      3: ["top-left", "center", "bottom-right"],
      4: ["top-left", "top-right", "bottom-left", "bottom-right"],
      5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
      6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
    };
    return dotPositions[num] || [];
  };

  const getPosition = (position: string) => {
    const positions: { [key: string]: string } = {
      "top-left": "top-[20%] left-[20%]",
      "top-right": "top-[20%] right-[20%]",
      "middle-left": "top-1/2 left-[20%] -translate-y-1/2",
      "middle-right": "top-1/2 right-[20%] -translate-y-1/2",
      "bottom-left": "bottom-[20%] left-[20%]",
      "bottom-right": "bottom-[20%] right-[20%]",
      "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    };
    return positions[position] || "";
  };

  return (
    <motion.div
      animate={{
        rotateX: rolling ? [0, 360, 720] : 0,
        rotateY: rolling ? [0, 360, 720] : 0,
        rotateZ: rolling ? [0, 180, 360] : 0,
      }}
      transition={{
        duration: rolling ? 2 : 0.5,
        ease: "easeInOut",
      }}
      className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center"
      style={{
        transformStyle: "preserve-3d",
        perspective: "600px",
      }}
    >
      <div className="relative w-full h-full">
        {getDots(value).map((pos, index) => (
          <div
            key={index}
            className={`absolute w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full ${getPosition(pos)}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

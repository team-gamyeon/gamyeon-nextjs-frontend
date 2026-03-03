"use client";

import { motion } from "framer-motion";

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  mode: "thinking" | "answering";
  size?: number;
}

export function CircularTimer({
  timeLeft,
  totalTime,
  mode,
  size = 140,
}: CircularTimerProps) {
  const progress = timeLeft / totalTime;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getColor = () => {
    if (progress > 0.5) return mode === "thinking" ? "#3b82f6" : "#22c55e";
    if (progress > 0.25) return "#f59e0b";
    return "#ef4444";
  };

  const getBgColor = () => {
    if (progress > 0.5)
      return mode === "thinking"
        ? "rgba(59, 130, 246, 0.08)"
        : "rgba(34, 197, 94, 0.08)";
    if (progress > 0.25) return "rgba(245, 158, 11, 0.08)";
    return "rgba(239, 68, 68, 0.08)";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-muted/50"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <div
        className="absolute inset-3 flex flex-col items-center justify-center rounded-full"
        style={{ backgroundColor: getBgColor() }}
      >
        <span className="text-xs font-medium" style={{ color: getColor() }}>
          {mode === "thinking" ? "생각 시간" : "답변 시간"}
        </span>
        <span
          className="text-2xl font-bold tabular-nums tracking-tight"
          style={{ color: getColor() }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

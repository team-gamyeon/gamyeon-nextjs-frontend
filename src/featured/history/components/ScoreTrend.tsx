"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreTrendProps {
  score: number;
  prevScore: number | null;
}

export function ScoreTrend({ score, prevScore }: ScoreTrendProps) {
  if (prevScore === null) return null;
  const diff = score - prevScore;
  if (diff > 0) return <span className="flex items-center gap-0.5 text-xs text-green-600"><TrendingUp className="h-3 w-3" />+{diff}</span>;
  if (diff < 0) return <span className="flex items-center gap-0.5 text-xs text-red-500"><TrendingDown className="h-3 w-3" />{diff}</span>;
  return <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="h-3 w-3" />0</span>;
}

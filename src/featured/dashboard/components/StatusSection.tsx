"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/shared/ui/card";
import { TrendingUp, BarChart3, Clock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function StatusSection() {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        나의 현황
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">76</p>
              <p className="text-xs text-muted-foreground">최근 점수</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">총 면접 횟수</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">1:45</p>
              <p className="text-xs text-muted-foreground">평균 답변 시간</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

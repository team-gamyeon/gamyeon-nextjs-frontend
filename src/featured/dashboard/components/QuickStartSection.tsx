"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Play, History, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function QuickStartSection() {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        빠른 시작
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Link href="/interview">
            <Card className="group cursor-pointer border-primary/20 bg-primary/5 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/10">
              <CardContent className="p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold">면접 시작</h3>
                  <Badge className="bg-primary/10 px-1.5 py-0 text-[10px] text-primary">추천</Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  AI 면접관과 실전 모의 면접을 진행하세요
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                  지금 시작 <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Link href="/history">
            <Card className="group cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
              <CardContent className="p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:bg-violet-100">
                  <History className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="mb-1 font-semibold">면접 기록</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  지난 면접 결과와 피드백을 다시 확인하세요
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                  기록 보기 <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

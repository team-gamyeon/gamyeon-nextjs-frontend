"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, ChevronRight } from "lucide-react";
import type { Phase } from "@/featured/interview/types";

interface FinishedOverlayProps {
  phase: Phase;
}

export function FinishedOverlay({ phase }: FinishedOverlayProps) {
  return (
    <AnimatePresence>
      {phase === "finished" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-9 w-9 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-300">면접이 완료되었습니다</p>
              <p className="mt-1 text-sm text-white/50">수고하셨습니다! AI가 결과를 분석 중입니다.</p>
            </div>
            <Button size="lg" className="mt-2 gap-2 px-8" asChild>
              <Link href="/result">
                결과 리포트 확인
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

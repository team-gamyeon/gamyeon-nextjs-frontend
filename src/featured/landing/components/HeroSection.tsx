"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Mic, Play, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              AI 기반 면접 시뮬레이터
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            면접, 이제
            <br />
            <span className="text-primary">AI와 함께</span> 준비하세요
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground sm:text-xl"
          >
            실전과 동일한 환경에서 AI 면접관과 연습하고,
            <br className="hidden sm:block" />
            즉각적인 피드백으로 면접 실력을 향상시키세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Button size="lg" className="w-full gap-2 sm:w-auto" asChild>
              <Link href="/signup">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <Play className="h-4 w-4" />
              데모 영상 보기
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />무료 체험 3회</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />카드 등록 불필요</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />즉시 시작</span>
          </motion.div>
        </div>

        {/* Product Preview Mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <div className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-2 text-xs text-muted-foreground">InterviewAI - 면접 시뮬레이션</span>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                      <Play className="ml-1 h-6 w-6 text-white/80" />
                    </div>
                    <p className="text-sm text-white/60">면접 화면 미리보기</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">AI 면접 질문</p>
                  <p className="text-sm font-medium">본인의 가장 큰 강점은 무엇이라고 생각하시나요?</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4">
                  <p className="mb-2 text-xs font-medium text-primary">남은 시간</p>
                  <p className="text-2xl font-bold text-primary">01:30</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg bg-muted/50 p-3 text-center">
                    <Mic className="mx-auto h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 rounded-lg bg-primary p-3 text-center">
                    <span className="text-xs font-medium text-primary-foreground">다음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

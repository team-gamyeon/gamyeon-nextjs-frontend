"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { BrainCircuit, ArrowLeft, Square } from "lucide-react";
import { QUESTIONS } from "@/featured/interview/types";
import type { Phase } from "@/featured/interview/types";

interface InterviewTopBarProps {
  interviewTitle: string;
  currentQuestion: number;
  phase: Phase;
  isActive: boolean;
  onEndClick: () => void;
}

export function InterviewTopBar({
  interviewTitle,
  currentQuestion,
  phase,
  isActive,
  onEndClick,
}: InterviewTopBarProps) {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BrainCircuit className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold">{interviewTitle}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentQuestion
                ? "w-2 bg-green-500"
                : i === currentQuestion && isActive
                  ? "w-5 bg-primary"
                  : "w-2 bg-white/20"
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-white/50">
          {currentQuestion + 1} / {QUESTIONS.length}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        onClick={onEndClick}
      >
        <Square className="h-3.5 w-3.5 fill-current" />
        면접 종료
      </Button>
    </header>
  );
}

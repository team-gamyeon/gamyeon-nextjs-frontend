"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Award, Clock, MessageSquare } from "lucide-react";

interface ScoreSummaryCardProps {
  overallScore: number;
}

export function ScoreSummaryCard({ overallScore }: ScoreSummaryCardProps) {
  return (
    <Card className="border-border/50 shadow-lg shadow-primary/5">
      <CardContent className="flex flex-col items-center p-6">
        <div className="relative mb-4">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
            <motion.circle
              cx="80" cy="80" r="68" fill="none"
              stroke="oklch(0.546 0.245 262.881)"
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 68}
              initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - overallScore / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="-rotate-90 origin-center"
              style={{ transformOrigin: "80px 80px" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-primary"
            >
              {overallScore}
            </motion.span>
            <span className="text-sm text-muted-foreground">/ 100점</span>
          </div>
        </div>

        <Badge className="mb-2 bg-primary/10 text-primary">
          <Award className="mr-1 h-3.5 w-3.5" />양호
        </Badge>
        <p className="text-center text-sm text-muted-foreground">
          전체적으로 준비가 잘 되어 있으나 일부 개선이 필요합니다.
        </p>

        <Separator className="my-4" />

        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />평균 답변 시간
            </span>
            <span className="font-medium">1분 45초</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />답변 질문 수
            </span>
            <span className="font-medium">5 / 5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

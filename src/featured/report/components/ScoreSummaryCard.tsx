'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { Award, Clock, MessageSquare, ShieldCheck } from 'lucide-react'
import type { AiConfidenceLevel, ScoreGrade } from '@/featured/report/types'
import { SCORE_FEEDBACK_MAP, AI_CONFIDENCE_STYLE, getScoreGrade } from '@/featured/report/constants'
import { formatDuration } from '@/shared/lib/utils/date' 

interface ScoreSummaryCardProps {
  overallScore: number
  aiConfidence: AiConfidenceLevel
  avgAnswerDurationMs: number
  answeredCount: number
  totalQuestionCount: number
}

// 점수 등급에 따른 차트 색상 매핑 (getScoreChartColor 함수 대체)
const CHART_COLORS: Record<ScoreGrade, string> = {
  미흡: '#ef4444', // red-500
  보통: '#eab308', // yellow-500
  양호: '#22c55e', // green-500
  좋음: '#3b82f6', // blue-500
}

export function ScoreSummaryCard({
  overallScore,
  aiConfidence,
  avgAnswerDurationMs,
  answeredCount,
  totalQuestionCount,
}: ScoreSummaryCardProps) {
  // 점수를 기반으로 등급, 피드백 객체, 차트 색상을 한 번에 계산
  const grade = getScoreGrade(overallScore)
  const feedback = SCORE_FEEDBACK_MAP[grade] // { grade, comment, style }
  const chartColor = CHART_COLORS[grade]

  return (
    <Card className="border-border/50 shadow-primary/5 flex h-full flex-col items-center justify-center gap-0 py-6 shadow-lg">
      <CardHeader className="w-full">
        <h2 className="text-lg font-semibold">나의 역량 점수</h2>
        <p className="text-muted-foreground text-sm break-keep">
          AI가 분석한 5가지 핵심 역량의 종합 점수입니다
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="relative flex h-full w-full items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <g transform="rotate(-90 100 100)">
              <motion.circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={chartColor} // 동적 색상 적용
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - overallScore / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold"
              style={{ color: chartColor }} // 동적 색상 적용
            >
              {overallScore}
            </motion.span>
            <span className="text-muted-foreground text-sm">/ 100점</span>
          </div>
        </div>

        <div className="mb-2 flex flex-wrap justify-center gap-2 py-3">
          <Badge className={feedback.style}>
            <Award className="mr-1 h-4 w-4" />
            {feedback.grade}
          </Badge>
          <Badge className={AI_CONFIDENCE_STYLE[aiConfidence]}>
            <ShieldCheck className="mr-1 h-4 w-4" />
            <span className="translate-y-px">AI 분석 신뢰도 : {aiConfidence}</span>
          </Badge>
        </div>

        <p className="text-muted-foreground text-center text-sm break-keep">{feedback.comment}</p>

        <Separator className="my-4" />

        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              평균 답변 시간
            </span>
            <span className="font-medium">{formatDuration(avgAnswerDurationMs)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              답변 질문 수
            </span>
            <span className="font-medium">
              {answeredCount} / {totalQuestionCount}개
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

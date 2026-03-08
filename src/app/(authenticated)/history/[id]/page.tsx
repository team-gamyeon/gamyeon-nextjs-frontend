import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowRight } from 'lucide-react'
import { ResultHeader } from '@/featured/result/components/ResultHeader'
import { ScoreSummaryCard } from '@/featured/result/components/ScoreSummaryCard'
import { RadarChartSection } from '@/featured/result/components/RadarChartSection'
import { StrengthsImprovementsSection } from '@/featured/result/components/StrengthsImprovementsSection'
import { QuestionFeedbackSection } from '@/featured/result/components/QuestionFeedbackSection'
import { NextActionsSection } from '@/featured/result/components/NextActionsSection'
import {
  MOCK_RADAR_DATA,
  MOCK_FEEDBACKS,
  MOCK_STRENGTHS,
  MOCK_IMPROVEMENTS,
  MOCK_NEXT_ACTIONS,
} from '@/featured/result/types'

const OVERALL_SCORE = 76

interface HistoryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { id } = await params

  return (
    <div className="bg-muted/20 min-h-screen">
      <ResultHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">면접 결과 리포트</h1>
          <p className="text-muted-foreground mt-2">2026년 2월 25일 · 프론트엔드 개발자 직무</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ScoreSummaryCard overallScore={OVERALL_SCORE} />
          </div>
          <RadarChartSection data={MOCK_RADAR_DATA} />
        </div>

        <StrengthsImprovementsSection strengths={MOCK_STRENGTHS} improvements={MOCK_IMPROVEMENTS} />

        <QuestionFeedbackSection feedbacks={MOCK_FEEDBACKS} />

        <NextActionsSection actions={MOCK_NEXT_ACTIONS} />

        <div className="mt-10 flex justify-center">
          <Button className="gap-2" asChild>
            <Link href="/history">
              면접 기록 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ReportHeader } from '@/featured/report/components/ReportHeader'
import { ScoreSummaryCard } from '@/featured/report/components/ScoreSummaryCard'
import { RadarChartSection } from '@/featured/report/components/RadarChartSection'
import { StrengthsImprovementsSection } from '@/featured/report/components/StrengthsImprovementsSection'
import { QuestionFeedbackSection } from '@/featured/report/components/QuestionFeedbackSection'
import { DeleteReportButton } from '@/featured/report/components/DeleteReportButton'
import {
  MOCK_RADAR_DATA,
  MOCK_FEEDBACKS,
  MOCK_STRENGTHS,
  MOCK_IMPROVEMENTS,
} from '@/featured/report/types'
import { ScrollToTopButton } from '@/shared/components/ScrollToTopButton'

interface Props {
  params: Promise<{ id: string }>
}

const OVERALL_SCORE = Math.round(
  MOCK_RADAR_DATA.reduce((sum, d) => sum + d.value, 0) / MOCK_RADAR_DATA.length,
)

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="bg-muted/20 min-h-screen">
      <ReportHeader />

      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute left-0">
            <Button
              variant="outline"
              className="gap-2 border-[oklch(0.65_0.15_180)]/30 bg-white text-[oklch(0.65_0.15_180)] hover:bg-[oklch(0.65_0.15_180)]/10 hover:text-[oklch(0.65_0.15_180)]"
              asChild
            >
              <Link href="/history">
                <ArrowLeft className="h-4 w-4" />
                면접 기록 보기
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">면접 결과 리포트</h1>
            <p className="text-muted-foreground mt-2">2026년 2월 25일 · 프론트엔드 개발자 직무</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-full lg:col-span-1">
            <ScoreSummaryCard overallScore={OVERALL_SCORE} />
          </div>
          <RadarChartSection data={MOCK_RADAR_DATA} />
        </div>

        <StrengthsImprovementsSection strengths={MOCK_STRENGTHS} improvements={MOCK_IMPROVEMENTS} />

        <QuestionFeedbackSection feedbacks={MOCK_FEEDBACKS} />

        <div className="mt-10 flex justify-center">
          <DeleteReportButton />
        </div>
      </main>

      <ScrollToTopButton />
    </div>
  )
}

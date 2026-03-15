import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ReportHeader } from '@/featured/report/components/ReportHeader'
import { ScoreSummaryCard } from '@/featured/report/components/ScoreSummaryCard'
import { RadarChartSection } from '@/featured/report/components/RadarChartSection'
import { StrengthsImprovementsSection } from '@/featured/report/components/StrengthsImprovementsSection'
import { QuestionFeedbackSection } from '@/featured/report/components/QuestionFeedbackSection'
import { DeleteReportButton } from '@/featured/report/components/DeleteReportButton'
import { ScrollToTopButton } from '@/shared/components/ScrollToTopButton'
import { getReportDetailAction } from '@/featured/report/actions/report.action'
import { formatDateKorean } from '@/shared/lib/utils/date'

interface ReportDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params
  const interviewId = Number(id)
  const response = await getReportDetailAction(interviewId)

  //  데이터 조회 실패 시 방어 코드
  if (!response.success || !response.data) {
    return (
      <div className="bg-muted/20 flex min-h-screen flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4 text-lg">리포트 데이터를 불러올 수 없습니다.</p>
        <Button asChild>
          <Link href="/history">목록으로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  const { report } = response.data
  const formattedDate = formatDateKorean(new Date(report.createdAt))

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
            <p className="text-muted-foreground mt-2">
              {/* 직무 데이터가 있을 때만 렌더링하도록 수정 */}
              {formattedDate} {report.jobCategory && `· ${report.jobCategory}`}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-full lg:col-span-1">
            <ScoreSummaryCard overallScore={report.totalScore} />
          </div>
          <RadarChartSection data={report.competencyScores} />
        </div>

        <StrengthsImprovementsSection
          strengths={report.strengths}
          improvements={report.weaknesses}
        />

        <QuestionFeedbackSection feedbacks={report.questionSummaries} />

        <div className="mt-10 flex justify-center">
          <DeleteReportButton interviewId={interviewId} />
        </div>
      </main>

      <ScrollToTopButton />
    </div>
  )
}

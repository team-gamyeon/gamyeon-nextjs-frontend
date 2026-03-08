import { Header } from '@/shared/components/header'
import { Footer } from '@/shared/components/footer'
import { HeroSection } from '@/featured/landing/components/HeroSection'
import { FeaturesSection } from '@/featured/landing/components/FeaturesSection'
import { HowItWorksSection } from '@/featured/landing/components/HowItWorksSection'
import { TestimonialsSection } from '@/featured/landing/components/TestimonialsSection'
import { CtaSection } from '@/featured/landing/components/CtaSection'
import { SigninForm } from '@/featured/auth/components/SigninForm'
import { SignupForm } from '@/featured/auth/components/SignupForm'
import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'
import { DashboardHeader } from '@/featured/dashboard/components/DashboardHeader'
import { QuickStartSection } from '@/featured/dashboard/components/QuickStartSection'
import { StatusSection } from '@/featured/dashboard/components/StatusSection'
import { RecentHistorySection } from '@/featured/dashboard/components/RecentHistorySection'
import { InterviewClient } from '@/featured/interview/components/InterviewClient'
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
import { HistoryHeader } from '@/featured/history/components/HistoryHeader'
import { HistoryClient } from '@/featured/history/components/HistoryClient'

const OVERALL_SCORE = 76

function PageLabel({ label }: { label: string }) {
  return (
    <div className="flex h-10 items-center bg-black/80 px-4">
      <span className="font-mono text-sm text-white">{label}</span>
    </div>
  )
}

export default function FigmaAllPages() {
  return (
    <div className="flex flex-col" style={{ width: '1920px' }}>
      {/* Landing */}
      <div style={{ width: '1920px' }}>
        <PageLabel label="Landing Page" />
        <div className="min-h-screen">
          <Header />
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <CtaSection />
          <Footer />
        </div>
      </div>

      {/* Sign In */}
      <div style={{ width: '1920px', height: '1080px' }}>
        <PageLabel label="Sign In" />
        <SigninForm />
      </div>

      {/* Sign Up */}
      <div style={{ width: '1920px', height: '1080px' }}>
        ¬ø
        <PageLabel label="Sign Up" />
        <SignupForm />
      </div>

      {/* Dashboard */}
      <div style={{ width: '1920px', height: '1080px' }}>
        <PageLabel label="Dashboard" />
        <div className="bg-muted/20 flex" style={{ height: '1070px' }}>
          <DashboardSidebar />
          <main className="flex-1 overflow-hidden">
            <DashboardHeader />
            <div className="space-y-6 px-8 py-6">
              <QuickStartSection />
              <StatusSection />
              <RecentHistorySection />
            </div>
          </main>
        </div>
      </div>

      {/* Interview */}
      <div style={{ width: '1920px', height: '1080px' }}>
        <PageLabel label="Interview" />
        <div style={{ height: '1070px', overflow: 'hidden' }}>
          <InterviewClient />
        </div>
      </div>

      {/* Result */}
      <div style={{ width: '1920px' }}>
        <PageLabel label="Result" />
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
            <StrengthsImprovementsSection
              strengths={MOCK_STRENGTHS}
              improvements={MOCK_IMPROVEMENTS}
            />
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
      </div>

      {/* History */}
      <div style={{ width: '1920px', height: '1080px' }}>
        <PageLabel label="History" />
        <div className="bg-muted/20 flex" style={{ height: '1070px' }}>
          <DashboardSidebar />
          <main className="flex-1 overflow-hidden">
            <HistoryHeader />
            <HistoryClient />
          </main>
        </div>
      </div>
    </div>
  )
}

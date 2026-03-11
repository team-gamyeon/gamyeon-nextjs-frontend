'use client'

import { motion } from 'framer-motion'
import { Play, History, RotateCcw } from 'lucide-react'
import { QuickStartCard } from '@/featured/dashboard/components/QuickStartCard'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

interface QuickStartSectionProps {
  resumeInterviewId?: string
}

export function QuickStartSection({ resumeInterviewId }: QuickStartSectionProps = {}) {
  // TODO: 실제 유저 상태(진행 중인 면접 여부)에 따라 이 값을 동적으로 설정해야 합니다.
  const hasInProgressInterview = !!resumeInterviewId

  return (
    <div>
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        빠른 시작
      </h2>
      {/* h-57.5 를 min-h-[160px] 로 수정했습니다 */}
      <div className="flex min-h-40 flex-row gap-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="flex-1"
        >
          <QuickStartCard
            title="면접 시작"
            description="AI 면접관과 실전 모의 면접을 진행하세요"
            icon={Play}
            iconStyle="bg-primary/10 text-primary group-hover:bg-primary/20"
            iconColorStyle="text-primary"
            href="/interview"
            buttonText="지금 시작"
            isRecommended={true}
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="flex-1"
        >
          <QuickStartCard
            title="면접 기록"
            description="지난 면접 결과와 피드백을 다시 확인하세요"
            icon={History}
            iconStyle="bg-violet-50 text-violet-600 group-hover:bg-violet-100"
            iconColorStyle="text-violet-600"
            href="/history"
            buttonText="기록 보기"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="flex-1"
        >
          <QuickStartCard
            title="이어하기"
            description={
              hasInProgressInterview
                ? '진행중인 면접이 있습니다. 이어서 진행해 보세요'
                : '현재 진행 중인 면접이 없습니다.'
            }
            icon={RotateCcw}
            iconStyle="bg-blue-50 text-blue-600 group-hover:bg-blue-100"
            iconColorStyle="text-blue-600"
            href={resumeInterviewId ? `/interview?resume=true&id=${resumeInterviewId}` : '/interview'}
            buttonText="이어서 면접보기"
            isDisabled={!hasInProgressInterview}
          />
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { TrendingUp, BarChart3, Lightbulb } from 'lucide-react'

const INTERVIEW_TIPS = [
  "답변 시 결론부터 말씀하시는 '두괄식' 화법은 면접관의 집중도를 높여줍니다.",
  "예상치 못한 질문에는 당황하지 않고, '잠시 생각할 시간을 주시겠습니까?'라고 여유를 가져보세요.",
  '자신의 경험을 STAR 기법(상황-과제-행동-결과)으로 구조화해서 답변해 보세요.',
  '면접은 대화입니다. 외운 것을 암기하듯 말하기보다 자연스럽게 소통하는 것이 중요합니다.',
  '마지막으로 하고 싶은 말이나 질문을 미리 준비해 가면 긍정적인 인상을 남길 수 있습니다.',
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

// Mock Data (scoreData는 사용하지 않으므로 삭제했습니다)
const activityData = [
  { date: '10/24', count: 1 },
  { date: '10/25', count: 0 },
  { date: '10/26', count: 2 },
  { date: '10/27', count: 0 },
  { date: '10/28', count: 1 },
  { date: '10/29', count: 3 },
  { date: '10/30', count: 2 },
]

export function StatusSection() {
  const [randomTip, setRandomTip] = useState(INTERVIEW_TIPS[0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setRandomTip(INTERVIEW_TIPS[Math.floor(Math.random() * INTERVIEW_TIPS.length)])
  }, [])

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        나의 현황
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: 오늘의 면접 팁 (유지) */}
        <Card className="border-border/50 flex min-h-[160px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-sm font-semibold">오늘의 면접 팁</h3>
            </div>
            <div className="flex flex-1 items-center">
              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                {mounted ? randomTip : INTERVIEW_TIPS[0]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: 최근 점수 추이 (차트 컨텐츠 삭제됨) */}
        <Card className="border-border/50 flex min-h-[160px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold">최근 점수 추이</h3>
            </div>
            {/* 승일님이 차트를 넣으실 빈 공간입니다 */}
            <div className="mt-2 flex w-full flex-1 items-center justify-center">
              <span className="text-muted-foreground/50 text-sm">차트 영역</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: 면접 활동 (날짜별) (유지) */}
        <Card className="border-border/50 flex min-h-[160px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold">면접 활동 (날짜별)</h3>
            </div>
            <div className="mt-2 flex w-full flex-1 items-end justify-between gap-1">
              {activityData.map((d, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-[16px] rounded-sm transition-all group-hover:opacity-80"
                    style={{
                      height: `${d.count > 0 ? (d.count / 3) * 40 : 4}px`,
                      backgroundColor: d.count > 0 ? '#3b82f6' : '#eff6ff',
                    }}
                  />
                  <span className="text-muted-foreground text-[10px]">{d.date.split('/')[1]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

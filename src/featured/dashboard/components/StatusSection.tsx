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

export function StatusSection() {
  const [randomTip, setRandomTip] = useState(INTERVIEW_TIPS[0])
  const [mounted, setMounted] = useState(false)
  const [contributionData, setContributionData] = useState<Array<{ date: string; count: number }>>(
    Array(28).fill({ date: '', count: 0 }),
  )

  useEffect(() => {
    setMounted(true)
    setRandomTip(INTERVIEW_TIPS[Math.floor(Math.random() * INTERVIEW_TIPS.length)])

    // 최근 4주(28일) 간의 잔디 그래프용 Mock 데이터 생성
    const data = []
    const today = new Date()
    // 28일치 임의의 패턴
    const mockCounts = [
      0, 1, 0, 0, 2, 4, 0, 0, 5, 1, 0, 0, 0, 3, 0, 1, 2, 0, 0, 0, 6, 0, 1, 0, 0, 2, 0, 0,
    ]

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      data.push({
        date: d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        count: mockCounts[27 - i],
      })
    }
    setContributionData(data)
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

        {/* Card 2: 최근 점수 추이 (승일님 ui추가 예정) */}
        <Card className="border-border/50 flex min-h-[160px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold">최근 점수 추이</h3>
            </div>
            {/* 승일님이 차트를 넣으실 빈 공간 */}
            <div className="mt-2 flex w-full flex-1 items-center justify-center">
              <span className="text-muted-foreground/50 text-sm">차트 영역</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: 면접 활동 (날짜별) */}
        <Card className="border-border/50 flex min-h-[160px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold">면접 활동 (날짜별)</h3>
            </div>
            <div className="mt-2 flex flex-1 items-center justify-center">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {contributionData.map((d, i) => (
                  <div
                    key={i}
                    title={mounted && d.date ? `${d.date}: 면접 ${d.count}회` : undefined}
                    className={`h-3 w-3 cursor-default rounded-sm transition-colors sm:h-3.5 sm:w-3.5 ${
                      d.count === 0
                        ? 'bg-slate-100'
                        : d.count <= 2
                          ? 'bg-emerald-200'
                          : d.count <= 4
                            ? 'bg-emerald-400'
                            : 'bg-emerald-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

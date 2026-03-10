'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { TrendingUp, LayoutGrid, Lightbulb } from 'lucide-react'

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

  useEffect(() => {
    setMounted(true)
    setRandomTip(INTERVIEW_TIPS[Math.floor(Math.random() * INTERVIEW_TIPS.length)])
  }, [])

  // --- [Card 3: 8주 잔디(초록색) 데이터 로직] ---
  const activityData = useMemo(() => {
    const data = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 월요일(0) 시작 ~ 일요일(6) 끝을 위한 보정
    const currentDayOfWeek = today.getDay()
    const mappedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1

    const daysToSunday = 6 - mappedDay
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + daysToSunday)

    for (let i = 55; i >= 0; i--) {
      const currentDate = new Date(endDate)
      currentDate.setDate(endDate.getDate() - i)
      currentDate.setHours(0, 0, 0, 0)

      let count = 0
      if (currentDate <= today) {
        const rand = Math.random()
        if (rand > 0.6 && rand <= 0.85) count = Math.floor(Math.random() * 2) + 1
        else if (rand > 0.85 && rand <= 0.95) count = Math.floor(Math.random() * 2) + 3
        else if (rand > 0.95) count = Math.floor(Math.random() * 3) + 5
      }

      data.push({
        dateObj: currentDate,
        count: count,
      })
    }
    return data
  }, [])

  const getLevelColor = (count: number, dateObj: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateObj > today) return 'bg-transparent' // 미래 날짜
    if (count === 0) return 'bg-slate-100' // 활동 없음
    if (count <= 2) return 'bg-green-300' // 적음
    if (count <= 4) return 'bg-green-500' // 보통
    return 'bg-green-700' // 많음
  }

  const formatDate = (dateObj: Date) => {
    return `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`
  }
  // --- [Card 3 로직 끝] ---

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        나의 현황
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: 오늘의 면접 팁 */}
        <Card className="border-border/50 flex h-[230px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-sm font-semibold">오늘의 면접 팁</h3>
            </div>
            <div className="flex flex-1 items-center">
              <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
                {mounted ? randomTip : INTERVIEW_TIPS[0]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: 최근 점수 추이 */}
        <Card className="border-border/50 flex h-[230px] flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold">최근 점수 추이</h3>
            </div>
            <div className="mt-2 flex w-full flex-1 items-center justify-center">
              <span className="text-muted-foreground/50 text-sm">차트 영역</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: 면접 활동 (깃허브 스타일 잔디 UI) */}
        <Card className="border-border/50 relative flex h-[230px] flex-col overflow-visible">
          <CardContent className="flex h-full flex-col p-5">
            {/* 타이틀 영역 & 그라데이션 범례(Legend) */}
            <div className="flex w-full shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <LayoutGrid className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold">면접 활동 (최근 8주)</h3>
              </div>

              {/* Less - 그라데이션 - More 범례 */}
              <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium">
                <span>Less</span>
                <div className="h-2.5 w-14 rounded-[3px] bg-gradient-to-r from-slate-100 via-green-400 to-green-700"></div>
                <span>More</span>
              </div>
            </div>

            {/* --- X축, Y축 + 전체 그리드 영역 --- */}
            <div className="mt-4 flex min-h-0 w-full flex-1 flex-col">
              {/* X축 (Week1 ~ Week8) */}
              <div className="mb-1 flex shrink-0 items-end gap-1 sm:gap-1.5">
                <div className="w-6 shrink-0"></div> {/* Y축 공간 확보 */}
                <div className="text-muted-foreground grid w-full grid-cols-8 gap-1 text-center text-[9px] font-medium sm:gap-1.5 sm:text-[10px]">
                  {['Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'Week7', 'Week8'].map(
                    (week, i) => (
                      <div key={i} className="truncate">
                        {week}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Y축 + 실제 잔디 그래프 */}
              <div className="flex min-h-0 flex-1 items-stretch gap-1 sm:gap-1.5">
                {/* Y축 (Mon ~ Sun 전체 표시) */}
                <div className="text-muted-foreground grid w-6 shrink-0 grid-rows-7 gap-1 text-right text-[9px] font-medium sm:gap-1.5 sm:text-[10px]">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="flex h-full items-center justify-end">
                      {day}
                    </div>
                  ))}
                </div>

                {/* 잔디(초록색) 그리드 - 7행 8열 */}
                <div className="grid h-full min-h-0 w-full grid-flow-col grid-rows-7 gap-1 pb-1 sm:gap-1.5">
                  {activityData.map((item, index) => (
                    // group 속성을 추가하여 hover 상태 제어
                    <div key={index} className="group relative h-full w-full">
                      {/* 잔디 블록 */}
                      <div
                        className={`h-full w-full cursor-default rounded-[3px] transition-colors duration-200 ${getLevelColor(item.count, item.dateObj)}`}
                      />

                      {/* 커스텀 툴팁 (가장자리 둥글게, 화살표 포함) */}
                      {item.dateObj <= new Date() && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <div className="rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-md">
                            {formatDate(item.dateObj)}: 면접 {item.count}회
                          </div>
                          {/* 툴팁 아래 뾰족한 화살표 부분 */}
                          <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-[4px] border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* --- 영역 끝 --- */}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

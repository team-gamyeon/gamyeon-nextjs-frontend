'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChartSpline, LayoutGrid, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import { ScoreTrendChart } from './ScoreTrendChart'
import { MOCK_RECORDS } from '@/featured/history/types'

function parseDate(str: string): Date {
  const [y, m, d] = str.split('.').map(Number)
  return new Date(y, m - 1, d)
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
import { TrendingUp, LayoutGrid, Lightbulb } from 'lucide-react'
import { useActivityData } from '@/featured/dashboard/hooks/useActivityData'
import { formatDateKorean } from '@/shared/lib/utils/date'

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

  // 주간 네비게이션 상태
  const sessions = useMemo(() => {
    return MOCK_RECORDS.filter((r) => r.status === 'completed' && r.score !== null)
      .map((r) => ({ ...r, dateObj: parseDate(r.date) }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
  }, [])

  const baseMonday = useMemo(
    () =>
      sessions.length > 0
        ? getMondayOf(sessions[sessions.length - 1].dateObj)
        : getMondayOf(new Date()),
    [sessions],
  )

  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(() => addDays(baseMonday, weekOffset * 7), [baseMonday, weekOffset])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const todayMonday = useMemo(() => getMondayOf(new Date()), [])

  const canPrev = true
  const canNext = weekStart < todayMonday

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
  const weekLabel = `${fmt(weekStart)} ~ ${fmt(weekEnd)}`

  // 2. 랜덤 잔디 데이터를 담을 빈 상태(State) 생성
  const [activityData, setActivityData] = useState<ActivityDay[]>([])
  const [tipMounted, setTipMounted] = useState(false)

  useEffect(() => {
    setTipMounted(true)
    setRandomTip(INTERVIEW_TIPS[Math.floor(Math.random() * INTERVIEW_TIPS.length)])
  }, [])

  // 커스텀 훅 사용
  const { mounted, activityData, getLevelColor } = useActivityData()

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        나의 현황
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: 오늘의 면접 팁 */}
        <Card className="border-border/50 flex h-57.5 flex-col">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-sm font-semibold">오늘의 면접 팁</h3>
            </div>
            <div className="flex flex-1 items-center">
              <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
                {tipMounted ? randomTip : INTERVIEW_TIPS[0]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: 최근 점수 추이 */}
        <Card className="border-border/50 flex h-57.5 flex-col">
          <CardContent className="flex h-full flex-col p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                  <ChartSpline className="h-5 w-5 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold">주간 점수</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-[11px] font-medium">{weekLabel}</span>
                <button
                  onClick={() => setWeekOffset((o) => o - 1)}
                  disabled={!canPrev}
                  className="hover:bg-muted rounded p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setWeekOffset((o) => o + 1)}
                  disabled={!canNext}
                  className="hover:bg-muted rounded p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <ScoreTrendChart weekStart={weekStart} weekEnd={weekEnd} />
          </CardContent>
        </Card>

        {/* Card 3: 면접 활동 */}
        <Card className="border-border/50 relative flex h-57.5 flex-col overflow-visible">
          <CardContent className="flex h-full flex-col p-5">
            <div className="flex w-full shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <LayoutGrid className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold">면접 활동 (최근 8주)</h3>
              </div>
              <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium">
                <span>Less</span>
                <div className="h-2.5 w-14 rounded-[3px] bg-linear-to-r from-slate-100 via-emerald-400 to-emerald-600"></div>
                <span>More</span>
              </div>
            </div>

            <div className="mt-4 flex min-h-0 w-full flex-1 flex-col">
              <div className="mb-1 flex shrink-0 items-end gap-1 sm:gap-1.5">
                <div className="w-6 shrink-0"></div>
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

              <div className="flex min-h-0 flex-1 items-stretch gap-1 sm:gap-1.5">
                <div className="text-muted-foreground grid w-6 shrink-0 grid-rows-7 gap-1 text-right text-[9px] font-medium sm:gap-1.5 sm:text-[10px]">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="flex h-full items-center justify-end">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid h-full min-h-0 w-full grid-flow-col grid-rows-7 gap-1 pb-1 sm:gap-1.5">
                  {!mounted || activityData.length === 0
                    ? Array.from({ length: 56 }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="h-full w-full rounded-[3px] bg-slate-100"
                        />
                      ))
                    : activityData.map((item, index) => (
                        <div key={index} className="group relative h-full w-full">
                          <div
                            className={`h-full w-full cursor-default rounded-[3px] transition-colors duration-200 ${getLevelColor(item.count, item.dateObj)}`}
                          />
                          {item.dateObj <= new Date() && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <div className="rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-md">
                                {formatDateKorean(item.dateObj)}: 면접 {item.count}회
                              </div>
                              <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-[4px] border-transparent border-t-slate-800"></div>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

import { useState, useMemo } from 'react'
import { InterviewReportItem } from '@/featured/history/types'
import { getMondayOf, addDays } from '@/shared/lib/utils/date'

export function useWeekNavigation(records: InterviewReportItem[] = []) {
  const sessions = useMemo(() => {
    // 이제  
    return (records || [])
      .filter((r) => r.intvStatus === 'FINISHED' && r.report?.totalScore !== null)
      .map((r) => ({ ...r, dateObj: new Date(r.updatedAt) }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
  }, [records])

// export function useWeekNavigation(records: InterviewReportItem[]) {
//   const sessions = useMemo(() => {
//     return (records || [])
//       .filter((r) => r.intvStatus === 'FINISHED' && r.report?.totalScore !== null)
//       .map((r) => ({ ...r, dateObj: new Date(r.updatedAt) }))
//       .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
//   }, [records])

  // 가장 최근 데이터의 월요일을 기준으로 잡음
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

  return { weekStart, weekEnd, weekLabel, weekOffset, setWeekOffset, canPrev, canNext }
}

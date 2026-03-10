import { useState, useMemo } from 'react'
import { MOCK_RECORDS } from '@/featured/history/types'
import { parseDateDot, getMondayOf, addDays } from '@/shared/lib/utils/date'

export function useWeekNavigation() {
  const sessions = useMemo(() => {
    return MOCK_RECORDS.filter((r) => r.status === 'completed' && r.score !== null)
      .map((r) => ({ ...r, dateObj: parseDateDot(r.date) }))
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

  return { weekStart, weekEnd, weekLabel, weekOffset, setWeekOffset, canPrev, canNext }
}

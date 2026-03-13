import { useState, useEffect } from 'react'
import { getInterviewStatsAction } from '../actions/dashboard.action'
import { addDays, formatDateDot, getMondayOf } from '@/shared/lib/utils/date'

export interface ActivityDay {
  dateObj: Date
  count: number
}

export function useActivityData() {
  const [mounted, setMounted] = useState(false)
  const [activityData, setActivityData] = useState<ActivityDay[]>([])

  useEffect(() => {
    setMounted(true)

    async function fetchActivity() {
      const result = await getInterviewStatsAction()

      const statMap: Record<string, number> = {}
      if (result.success && result.data) {
        result.data.forEach((stat) => {
          const normalizedDate = stat.date.replaceAll('-', '.')
          statMap[normalizedDate] = stat.count
        })
      }

      const data: ActivityDay[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const monday = getMondayOf(today)
      const endDate = addDays(monday, 6)

      for (let i = 55; i >= 0; i--) {
        const currentDate = addDays(endDate, -i)
        const dateString = formatDateDot(currentDate)

        let count = 0
        if (currentDate <= today) {
          count = statMap[dateString] || 0
        }

        data.push({
          dateObj: currentDate,
          count: count,
        })
      }
      setActivityData(data)
    }

    fetchActivity()
  }, [])

  const getLevelColor = (count: number, dateObj: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateObj > today) return 'bg-transparent'
    if (count === 0) return 'bg-slate-100'
    if (count <= 2) return 'bg-emerald-200'
    if (count <= 4) return 'bg-emerald-400'
    return 'bg-emerald-600'
  }

  return { mounted, activityData, getLevelColor }
}

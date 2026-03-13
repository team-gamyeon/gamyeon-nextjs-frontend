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

      // ✅ 1. 서버 데이터를 정리할 때, 날짜 형식을 "YYYY.MM.DD"로 통일합니다.
      const statMap: Record<string, number> = {}
      if (result.success && result.data) {
        result.data.forEach((stat) => {
          // 서버에서 "2026-03-12" 형태로 올 수 있으니 "-"를 "."으로 바꿔서 저장해둡니다.
          const normalizedDate = stat.date.replaceAll('-', '.')
          statMap[normalizedDate] = stat.count
        })
      }

      const data: ActivityDay[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // ✅ 2. 이번 주 일요일 구하기 (복잡한 수학 계산 ➡️ 유틸 함수 사용)
      const monday = getMondayOf(today) // 이번 주 월요일 구하기
      const endDate = addDays(monday, 6) // 월요일에서 6일 더해서 일요일 만들기!

      // 56칸(8주)을 하나씩 돌면서 채워 넣습니다.
      for (let i = 55; i >= 0; i--) {
        // ✅ 3. 과거 날짜 구하기 (유틸 함수 사용)
        const currentDate = addDays(endDate, -i)

        // ✅ 4. 날짜를 글자("YYYY.MM.DD")로 바꾸기 (복잡한 코드 ➡️ 유틸 함수 사용)
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

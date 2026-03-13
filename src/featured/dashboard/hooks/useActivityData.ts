import { useState, useEffect } from 'react'
// ✅ 1. 웨이터(Action) 부르기!
import { getInterviewStatsAction } from '../actions/dashboard.action'

export interface ActivityDay {
  dateObj: Date
  count: number
}

export function useActivityData() {
  const [mounted, setMounted] = useState(false)
  const [activityData, setActivityData] = useState<ActivityDay[]>([])

  useEffect(() => {
    setMounted(true)

    // ✅ 2. 비동기로 웨이터에게 데이터를 달라고 요청하는 함수
    async function fetchActivity() {
      const result = await getInterviewStatsAction()

      // ✅ 3. 서버 데이터 정리하기 (날짜를 찾기 쉽게 사전처럼 만듭니다)
      // 예: { "2026-03-12": 2, "2026-03-13": 5 }
      const statMap: Record<string, number> = {}
      if (result.success && result.data) {
        result.data.forEach((stat) => {
          statMap[stat.date] = stat.count
        })
      }

      // --- 여기서부터는 기존과 동일하게 56일치 빈 도시락통을 만드는 과정 ---
      const data: ActivityDay[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const currentDayOfWeek = today.getDay()
      const mappedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1
      const daysToSunday = 6 - mappedDay

      const endDate = new Date(today)
      endDate.setDate(today.getDate() + daysToSunday)

      // 56칸(8주)을 하나씩 돌면서 채워 넣습니다.
      for (let i = 55; i >= 0; i--) {
        const currentDate = new Date(endDate)
        currentDate.setDate(endDate.getDate() - i)
        currentDate.setHours(0, 0, 0, 0)

        // Date 객체를 YYYY-MM-DD 형태의 문자열로 변환 (서버 날짜 형식과 비교하기 위해)
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        let count = 0
        if (currentDate <= today) {
          // ✅ 4. 랜덤(가짜) 숫자가 아니라, 위에서 만든 진짜 사전(statMap)에서 꺼내옵니다!
          // 만약 사전(statMap)에 그 날짜가 있으면 그 숫자를 넣고, 없으면 0을 넣습니다.
          count = statMap[dateString] || 0
        }

        data.push({
          dateObj: currentDate,
          count: count,
        })
      }

      // 완성된 56칸 도시락을 UI로 전달!
      setActivityData(data)
    }

    // 위에서 만든 함수 실행
    fetchActivity()
  }, [])

  // 횟수에 따라 에메랄드 색상 클래스를 반환하는 함수 (수정 안 함!)
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

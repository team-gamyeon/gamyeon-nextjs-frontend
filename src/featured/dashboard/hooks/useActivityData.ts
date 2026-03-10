import { useState, useEffect } from 'react'

export interface ActivityDay {
  dateObj: Date
  count: number
}

export function useActivityData() {
  const [mounted, setMounted] = useState(false)
  const [activityData, setActivityData] = useState<ActivityDay[]>([])

  // 1. 브라우저가 렌더링될 때(Mounted) 56일치 가짜 데이터를 생성합니다.
  useEffect(() => {
    setMounted(true)
    const data: ActivityDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
        if (rand > 0.4 && rand <= 0.7) count = Math.floor(Math.random() * 2) + 1
        else if (rand > 0.7 && rand <= 0.85) count = Math.floor(Math.random() * 2) + 3
        else if (rand > 0.85) count = Math.floor(Math.random() * 2) + 5
      }

      data.push({
        dateObj: currentDate,
        count: count,
      })
    }
    setActivityData(data)
  }, [])

  // 2. 횟수에 따라 에메랄드 색상 클래스를 반환하는 함수
  const getLevelColor = (count: number, dateObj: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateObj > today) return 'bg-transparent'
    if (count === 0) return 'bg-slate-100'
    if (count <= 2) return 'bg-emerald-200'
    if (count <= 4) return 'bg-emerald-400'
    return 'bg-emerald-600'
  }

  // 계산이 끝난 데이터와 색상 함수를 컴포넌트(화면)로 던져줍니다.
  return { mounted, activityData, getLevelColor }
}

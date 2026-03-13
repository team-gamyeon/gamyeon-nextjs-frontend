export interface RecentHistoryItem {
  id: number
  position: string
  score: number
  date: string
}

export interface StatusCard {
  label: string
  value: string
  colorClass: string
}

/**
 * 일자별 면접 횟수 통계 타입
 */
export interface InterviewStat {
  date: string
  count: number
}

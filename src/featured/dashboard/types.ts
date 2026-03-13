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

export interface InterviewStat {
  date: string
  count: number
}

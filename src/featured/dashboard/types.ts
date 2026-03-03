export interface RecentHistoryItem {
  position: string
  score: number
  date: string
  diff: number | null
}

export interface StatusCard {
  label: string
  value: string
  colorClass: string
}

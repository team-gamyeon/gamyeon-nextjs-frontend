import { InterviewReportItem } from '@/featured/history/types'

// ==========================================
// 1. Chart 관련 타입 (ScoreTrendChart)
// ==========================================
export interface ChartDataItem {
  name: string
  score: number
  position: string
}

export interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartDataItem }>
}

export interface ScoreTrendChartProps {
  weekStart: Date
  weekEnd: Date
  records: InterviewReportItem[]
}

// ==========================================
// 2. Dashboard UI 관련 타입
// ==========================================
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

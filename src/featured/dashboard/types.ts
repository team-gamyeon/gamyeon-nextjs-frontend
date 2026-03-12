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
 * 1. 일자별 면접 횟수 통계 타입
 * - API: GET /api/v1/intvs/stat
 */
export interface InterviewStat {
  date: string
  count: number
}

/**
 * 2. 공지사항 목록 타입 (간략한 정보)
 * - API: GET /api/v1/notices
 */
export interface Notice {
  id: number
  title: string
  createdAt: string
}

/**
 * 3. 공지사항 상세 타입 (모든 정보)
 * - API: GET /api/v1/notices/{notice-id}
 */
export interface NoticeDetail {
  id: number
  title: string
  content: string
  imageUrls?: string[]
  createdAt: string
  updatedAt: string
}

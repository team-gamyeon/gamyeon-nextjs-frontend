import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { DailyIntvStat } from '../types'
import type { Notice, NoticeDetailResponse } from '@/featured/notice/types'

/**
 * 일자별 면접 횟수 조회
 */
export async function getDailyIntvStats(): Promise<ApiResponse<DailyIntvStat[]>> {
  const today = new Date()
  const endDate = today.toISOString().slice(0, 10)
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate())
  const startDate = twoMonthsAgo.toISOString().slice(0, 10)
  return await serverApi.get<DailyIntvStat[]>('/api/v1/intvs/stats', { params: { startDate, endDate } })
}

// 전체 공지사항 목록 조회
export async function getNotices(): Promise<ApiResponse<Notice[]>> {
  return await serverApi.get<Notice[]>('/api/v1/notices')
}

//공지사항 상세 내용 조회
export async function getNoticeDetail(
  noticeId: number,
): Promise<ApiResponse<NoticeDetailResponse>> {
  return await serverApi.get<NoticeDetailResponse>(`/api/v1/notices/${noticeId}`)
}

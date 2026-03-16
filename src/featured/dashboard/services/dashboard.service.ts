import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { DailyIntvStat } from '../types'
import type { Notice, NoticeDetailResponse } from '@/featured/notice/types'

/**
 * 일자별 면접 횟수 조회
 */
export async function getInterviewStats(params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<DailyIntvStat[]>> {
  return await serverApi.get<DailyIntvStat[]>('/api/v1/intvs/stats', { params })
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

import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { InterviewStat } from '../types'
import type { Notice, NoticeDetail } from '@/featured/notice/types'

/**
 * 일자별 면접 횟수 조회
 */
export async function getInterviewStats(): Promise<ApiResponse<InterviewStat[]>> {
  return await serverApi.get<InterviewStat[]>('/api/v1/intvs/stats')
}

/**
 * 전체 공지사항 목록 조회
 */
export async function getNotices(): Promise<ApiResponse<Notice[]>> {
  return await serverApi.get<Notice[]>('/api/v1/notices')
}

/**
 * 공지사항 상세 내용 조회
 */
export async function getNoticeDetail(noticeId: number): Promise<ApiResponse<NoticeDetail>> {
  return await serverApi.get<NoticeDetail>(`/api/v1/notices/${noticeId}`)
}

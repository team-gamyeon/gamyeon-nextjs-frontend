import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { Notice, NoticeDetailResponse } from '../types'

// 1. 공지사항 목록 조회
export async function getNotices(): Promise<ApiResponse<Notice[]>> {
  return await serverApi.get<Notice[]>('/api/v1/notices')
}

// 2. 공지사항 상세 조회
export async function getNoticeDetail(id: number): Promise<ApiResponse<NoticeDetailResponse>> {
  return await serverApi.get<NoticeDetailResponse>(`/api/v1/notices/${id}`)
}

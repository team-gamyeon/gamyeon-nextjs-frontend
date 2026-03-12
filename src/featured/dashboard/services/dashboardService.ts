'use server'

import { serverApi } from '@/shared/lib/api'
import { InterviewStat, Notice, NoticeDetail } from '../types'

/**
 * 1. 일자별 면접 횟수 조회
 */
export async function getInterviewStats() {
  try {
    const data = await serverApi.get<InterviewStat[]>('/api/v1/intvs/stats')
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
  }
}

/**
 * 2. 전체 공지사항 목록 조회
 */
export async function getNotices() {
  try {
    const data = await serverApi.get<Notice[]>('/api/v1/notices')
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
  }
}

/**
 * 3. 공지사항 상세 내용 조회
 */
export async function getNoticeDetail(noticeId: number) {
  try {
    const data = await serverApi.get<NoticeDetail>(`/api/v1/notices/${noticeId}`)
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
  }
}

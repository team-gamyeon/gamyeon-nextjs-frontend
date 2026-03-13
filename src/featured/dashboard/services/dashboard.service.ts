'use server'

import { serverApi } from '@/shared/lib/api'
import { InterviewStat } from '../types'
import { Notice, NoticeDetail } from '@/featured/notice/types'

/**
 * 일자별 면접 횟수 조회
 */
export async function getInterviewStats() {
  try {
    // utils에서 이미 { success, data, message } 형태로 포장해서 주므로 그대로 return
    return await serverApi.get<InterviewStat[]>('/api/v1/intvs/stats')
  } catch (error: any) {
    // utils의 handleResponse에서 던진 커스텀 에러 객체 처리
    return {
      success: false as const,
      message: error.message || '면접 통계를 불러오는데 실패했습니다.',
    }
  }
}

/**
 * 전체 공지사항 목록 조회
 */
export async function getNotices() {
  try {
    return await serverApi.get<Notice[]>('/api/v1/notices')
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '공지사항 목록을 불러오는데 실패했습니다.',
    }
  }
}

/**
 * 공지사항 상세 내용 조회
 */
export async function getNoticeDetail(noticeId: number) {
  try {
    return await serverApi.get<NoticeDetail>(`/api/v1/notices/${noticeId}`)
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '공지사항 상세 내용을 불러오는데 실패했습니다.',
    }
  }
}

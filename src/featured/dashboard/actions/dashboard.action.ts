'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { InterviewStat } from '../types'
import { getInterviewStats, getNotices, getNoticeDetail } from '../services/dashboard.service'
import { Notice, NoticeDetail } from '@/featured/notice/types'

type ActionError = { success: false; message: string }

/** * 일자별 면접 횟수 조회 Action */
export async function getInterviewStatsAction(): Promise<
  ApiResponse<InterviewStat[]> | ActionError
> {
  try {
    return await getInterviewStats()
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '면접 통계를 불러오는데 실패했습니다.',
    }
  }
}

/** * 전체 공지사항 목록 조회 Action */
export async function getNoticesAction(): Promise<ApiResponse<Notice[]> | ActionError> {
  try {
    return await getNotices()
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '공지사항 목록을 불러오는데 실패했습니다.',
    }
  }
}

/** * 공지사항 상세 내용 조회 Action */
export async function getNoticeDetailAction(
  noticeId: number,
): Promise<ApiResponse<NoticeDetail> | ActionError> {
  try {
    return await getNoticeDetail(noticeId)
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '공지사항 상세 내용을 불러오는데 실패했습니다.',
    }
  }
}

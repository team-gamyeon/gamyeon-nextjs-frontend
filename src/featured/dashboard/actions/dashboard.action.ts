'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { InterviewStat } from '../types'
import type { Notice, NoticeDetailResponse } from '@/featured/notice/types'

import { getInterviewStats, getNotices, getNoticeDetail } from '../services/dashboard.service'

/** * 일자별 면접 횟수 조회 Action */
export async function getInterviewStatsAction(params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<InterviewStat[]>> {
  try {
    return await getInterviewStats(params)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '면접 통계를 불러오는데 실패했습니다.'

    return {
      success: false,
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      data: null,
    }
  }
}

/** * 전체 공지사항 목록 조회 Action */
export async function getNoticesAction(): Promise<ApiResponse<Notice[]>> {
  try {
    return await getNotices()
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '공지사항 목록을 불러오는데 실패했습니다.'

    return {
      success: false,
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      data: null,
    }
  }
}

/** * 공지사항 상세 내용 조회 Action */
export async function getNoticeDetailAction(
  noticeId: number,
): Promise<ApiResponse<NoticeDetailResponse>> {
  try {
    return await getNoticeDetail(noticeId)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '공지사항 상세 내용을 불러오는데 실패했습니다.'

    return {
      success: false,
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      data: null,
    }
  }
}

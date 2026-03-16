'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { DailyIntvStat } from '../types'
import type { Notice, NoticeDetailResponse } from '@/featured/notice/types'

import { getInterviewStats, getNotices, getNoticeDetail } from '../services/dashboard.service'
import { withAction } from '@/shared/lib/withAction'

/** * 일자별 면접 횟수 조회 Action */
export async function getInterviewStatsAction(params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<DailyIntvStat[]>> {
  return withAction(() => getInterviewStats(params))
}

/** * 전체 공지사항 목록 조회 Action */
export async function getNoticesAction(): Promise<ApiResponse<Notice[]>> {
  return withAction(() => getNotices())
}

/** * 공지사항 상세 내용 조회 Action */
export async function getNoticeDetailAction(
  noticeId: number,
): Promise<ApiResponse<NoticeDetailResponse>> {
  return withAction(() => getNoticeDetail(noticeId))
}

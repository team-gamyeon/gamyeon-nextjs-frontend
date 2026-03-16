'use server'

import type { ApiResponse } from '@/shared/lib/api'
import { withAction } from '@/shared/lib/withAction'
import { InterviewReportItem } from '../types'
import { getReportList } from '../services/history.service'

// 리포트 목록 (면접 기록) 조회
export async function getReportListAction(
  userId?: number,
): Promise<ApiResponse<InterviewReportItem[]>> {
  // UI에서 넘어온 userId를 서비스 함수로 그대로 전달
  return withAction(() => getReportList(userId))
}

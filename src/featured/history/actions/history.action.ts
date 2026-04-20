'use server'

import type { ApiResponse } from '@/shared/lib/api'
import { withAction } from '@/shared/lib/withAction'
import { InterviewReportItem } from '../types'
import { getReportList } from '../services/history.service'

// 리포트 목록 (면접 기록) 조회
export async function getReportListAction(): Promise<ApiResponse<InterviewReportItem[]>> {
  return withAction(() => getReportList())
}
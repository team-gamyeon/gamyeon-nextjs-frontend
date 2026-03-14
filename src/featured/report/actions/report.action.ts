'use server'

import type { ApiResponse } from '@/shared/lib/api'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { ReportDetailData } from '../types'
import { getReportDetail, deleteReport } from '../service/report.service'

// 리포트 상세 조회
export async function getReportDetailAction(
  interviewId: number,
): Promise<ApiResponse<ReportDetailData>> {
  try {
    return await getReportDetail(interviewId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

// 리포트 삭제
export async function deleteReportAction(interviewId: number): Promise<ApiResponse<null>> {
  try {
    return await deleteReport(interviewId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

'use server'

import type { ApiResponse } from '@/shared/lib/api'
import { InterviewReportItem, ReportDetailData } from '../types'
import { getReportList, getReportDetail, deleteReport } from '../service/report.service'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// 리포트 목록 조회
export async function getReportListAction(
  userId?: number,
): Promise<ApiResponse<InterviewReportItem[]>> {
  try {
    // UI에서 넘어온 userId를 서비스 함수로 그대로 전달
    return await getReportList(userId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

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

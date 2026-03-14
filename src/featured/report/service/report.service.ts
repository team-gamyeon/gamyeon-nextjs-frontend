import { ApiResponse, serverApi } from '@/shared/lib/api'
import { InterviewReportItem, ReportDetailData } from '../types'

/**
 * 리포트 목록을 조회합니다.
 * GET /api/v1/report/list?userId={userId}
 * @param userId (선택) 특정 사용자의 리포트만 필터링할 때 사용
 */
export async function getReportList(userId?: number): Promise<ApiResponse<InterviewReportItem[]>> {
  // userId가 있으면 쿼리 파라미터로 추가, 없으면 그냥 호출
  const config = userId ? { params: { userId } } : undefined
  return await serverApi.get<InterviewReportItem[]>('/api/v1/report/list', config)
}

/**
 * 특정 모의면접의 상세 리포트 데이터를 조회합니다.
 * GET /api/v1/report/detail/{interview_id}
 */
export async function getReportDetail(interviewId: number): Promise<ApiResponse<ReportDetailData>> {
  return await serverApi.get<ReportDetailData>(`/api/v1/report/detail/${interviewId}`)
}

/**
 * 특정 리포트를 삭제합니다.
 * DELETE /api/v1/report/delete/{interview_id}
 */
export async function deleteReport(interviewId: number): Promise<ApiResponse<null>> {
  return await serverApi.delete<null>(`/api/v1/report/delete/${interviewId}`)
}

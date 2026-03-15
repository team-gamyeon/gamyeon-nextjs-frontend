import { ApiResponse, serverApi } from '@/shared/lib/api'
import { ReportDetailData } from '../types'

/**
 * 특정 모의면접의 상세 리포트 데이터를 조회합니다.
 * GET /api/v1/report/detail/{interview_id}
 */
export async function getReportDetail(interviewId: number): Promise<ApiResponse<ReportDetailData>> {
  return await serverApi.get<ReportDetailData>(`/api/v1/report/detail/${interviewId}`)
}

// @ 리포트 삭제 api 임의 코드 (확정되면 수정할 것)
/**
 * 특정 리포트를 삭제합니다.
 * DELETE /api/v1/report/delete/{interview_id}
 */
export async function deleteReport(interviewId: number): Promise<ApiResponse<null>> {
  return await serverApi.delete<null>(`/api/v1/report/delete/${interviewId}`)
}

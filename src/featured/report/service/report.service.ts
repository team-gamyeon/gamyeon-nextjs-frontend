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

// @ 뭐가 맞는건지 모르겠음 (서현님 답장오면 수정예정)
// export async function getReportList(): Promise<ApiResponse<InterviewReportItem[]>> {
//   return await serverApi.get<InterviewReportItem[]>('/api/v1/report/list')
// }

/**
 * 특정 모의면접의 상세 리포트 데이터를 조회합니다.
 * GET /api/v1/report/detail/{interview_id}
 */
export async function getReportDetail(interviewId: number): Promise<ApiResponse<ReportDetailData>> {
  return await serverApi.get<ReportDetailData>(`/api/v1/report/detail/${interviewId}`)
}

// @ 리포트 삭제 api 임의 코드 (확적되면 수정할것 )
/**
 * 특정 리포트를 삭제합니다.
 * DELETE /api/v1/report/delete/{interview_id}
 */
export async function deleteReport(interviewId: number): Promise<ApiResponse<null>> {
  return await serverApi.delete<null>(`/api/v1/report/delete/${interviewId}`)
}

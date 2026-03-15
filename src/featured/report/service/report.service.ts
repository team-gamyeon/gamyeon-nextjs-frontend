import { ApiResponse, serverApi } from '@/shared/lib/api'
import { ReportDetailData } from '../types'

/**
 * 특정 모의면접의 상세 리포트 데이터를 조회합니다.
 * GET /api/v1/report/detail/{intvId}
 */
export async function getReportDetail(
  intvId: number,
): Promise<ApiResponse<ReportDetailData>>, {
  return await serverApi.get<ReportDetailData>(`/api/v1/report/detail/${intvId}`)
}

/**
 * 특정 리포트를 삭제합니다.
 * DELETE /api/v1/report/delete/{intvId}
 * * @param intvId - 삭제할 면접 세션 ID (Path Parameter)
 * @returns 성공 시 data 필드는 null로 반환됩니다.
 */
export async function deleteReport(
  intvId: number,
): Promise<ApiResponse<null>> {
  // 명세서의 /api/v1/report/delete/{interviewId} 반영
  return await serverApi.delete<null>(`/api/v1/report/delete/${intvId}`)
}
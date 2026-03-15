import { ApiResponse, serverApi } from '@/shared/lib/api'
import { InterviewReportItem } from '../types'

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

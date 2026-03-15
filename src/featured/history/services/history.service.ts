import { ApiResponse, serverApi } from '@/shared/lib/api'
import { InterviewReportItem } from '../types'

/**
 * 리포트 목록을 조회합니다.
 * GET /api/v1/report/list?userId={userId}
 * @param userId (선택) 특정 사용자의 리포트만 필터링할 때 사용
 */
export async function getReportList(userId?: number): Promise<ApiResponse<InterviewReportItem[]>> {
  // 수정 부분: userId 여부와 상관없이 무조건 silent: true를 포함
  const config = userId ? { params: { userId }, silent: true } : { silent: true }

  return await serverApi.get<InterviewReportItem[]>('/api/v1/report/list', config)
}

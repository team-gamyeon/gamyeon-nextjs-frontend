import { ApiResponse, serverApi } from '@/shared/lib/api'
import { InterviewReportItem } from '../types'


/**
 * 리포트 목록을 조회합니다.
 * GET /api/v1/report/list (토큰을 통해 자동으로 유저 식별)
 */
export async function getReportList(): Promise<ApiResponse<InterviewReportItem[]>> {
  // 이제 userId 파라미터가 필요 없으므로 silent 옵션만 남깁니다.
  const config = { silent: true }

  return await serverApi.get<InterviewReportItem[]>('/api/v1/report/list', config)
}
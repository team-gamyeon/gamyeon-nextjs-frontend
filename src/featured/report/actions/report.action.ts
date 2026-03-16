'use server'

import { revalidatePath } from 'next/cache' // 캐시 갱신을 위해 import
import type { ApiResponse } from '@/shared/lib/api'
import { withAction } from '@/shared/lib/withAction'
import { ReportDetailData } from '../types'
import { getReportDetail, deleteReport } from '../service/report.service'

/**
 * 리포트 상세 데이터 조회 Action
 */
export async function getReportDetailAction(
  interviewId: number,
): Promise<ApiResponse<ReportDetailData>> {
  return withAction(() => getReportDetail(interviewId))
}

/**
 * 리포트 삭제 Action
 */
export async function deleteReportAction(interviewId: number): Promise<ApiResponse<null>> {
  return withAction(async () => {
    const response = await deleteReport(interviewId)

    // API 응답 성공 여부 확인 (명세서의 "success": true 기준)
    if (response.success) {
      // History(면접 목록) 페이지의 캐시를 무효화하여 다음 방문 시 최신 DB 데이터를 불러오게 합니다.
      revalidatePath('/history')
    }

    return response
  })
}

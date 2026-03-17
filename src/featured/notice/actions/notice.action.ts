//이 파일에 있는 함수들은 무조건 백엔드(서버) 환경에서만 실행해!"라는 강력한 선언
'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { Notice, NoticeDetailResponse } from '../types'
import { getNotices, getNoticeDetail } from '../services/notice.service'
import { withAction } from '@/shared/lib/withAction'

// 공지사항 목록 조회 Action
export async function getNoticesAction(): Promise<ApiResponse<Notice[]>> {
  return withAction(() => getNotices())
}

// 공지사항 상세 조회 Action
export async function getNoticeDetailAction(
  id: number,
): Promise<ApiResponse<NoticeDetailResponse>> {
  return withAction(() => getNoticeDetail(id))
}

//이 파일에 있는 함수들은 무조건 백엔드(서버) 환경에서만 실행해!"라는 강력한 선언
'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { Notice, NoticeDetailResponse } from '../types'
import { getNotices, getNoticeDetail } from '../services/notice.service'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// 공지사항 목록 조회 Action
export async function getNoticesAction(): Promise<ApiResponse<Notice[]>> {
  try {
    return await getNotices()
  } catch (error) {
    // Next.js의 redirect 에러인 경우 그대로 던져서 페이지 이동을 허용
    // (isRedirectError(error)) throw error 구문으로 리다이렉트 에러는 건드리지 않고 통과시켜 주는 것
    if (isRedirectError(error)) throw error

    // 일반 에러도 그대로 던져서 클라이언트(UI)에서 처리하도록 함
    throw error
  }
}

// 공지사항 상세 조회 Action
export async function getNoticeDetailAction(
  id: number,
): Promise<ApiResponse<NoticeDetailResponse>> {
  try {
    return await getNoticeDetail(id)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

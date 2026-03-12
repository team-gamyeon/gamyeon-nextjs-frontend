'use server'

import { serverApi } from '@/shared/lib/api'
import { InterviewStat, Notice, NoticeDetail } from '../types'

/**
 * 1. 일자별 면접 횟수 조회
 */
export async function getInterviewStats() {
  try {
    const data = await serverApi.get<InterviewStat[]>('/api/v1/intvs/stats')
    // 성공 시: success 깃발을 true로 들고, 데이터를 건네줌
    return { success: true as const, data }
  } catch (error) {
    // 실패 시: 에러가 나도 앱이 안 터짐! success 깃발을 false로 들고 에러 메시지를 건네줌
    return { success: false as const, message: (error as Error).message }
  }
}

/**
 * 2. 전체 공지사항 목록 조회
 */
export async function getNotices() {
  try {
    const data = await serverApi.get<Notice[]>('/api/v1/notices')
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
  }
}

/**
 * 3. 공지사항 상세 내용 조회
 */
export async function getNoticeDetail(noticeId: number) {
  try {
    // 상세 조회는 주소 뒤에 noticeId를 붙여서 요청
    const data = await serverApi.get<NoticeDetail>(`/api/v1/notices/${noticeId}`)
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
  }
}

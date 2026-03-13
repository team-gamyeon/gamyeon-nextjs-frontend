'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { InterviewStat } from '../types'
import { getInterviewStats, getNotices, getNoticeDetail } from '../services/dashboard.service'
import { Notice, NoticeDetail } from '@/featured/notice/types'

type ActionError = { success: false; message: string }
// Promise<ApiResponse<InterviewStat[]>>
// 이렇게 정의하셔도 성공이랑 실패랑 항목은 똑같이 넘어와서 괜찮을 것 같아요!

// 💌 피드백 1번 해설: "ActionError를 굳이 안 써도 돼요!"
// 팀원 피드백: Promise<ApiResponse<InterviewStat[]>> 이렇게 정의하셔도 성공이랑 실패랑 항목은 똑같이 넘어와서 괜찮을 것 같아요!

// 쉬운 해석: "아까 우리가 실패했을 때 주려고 예쁜 사과 쪽지(ActionError)를 따로 만들었잖아요? 그런데 알고 보니 원래 쓰던 기본 배달 상자(ApiResponse) 안에 이미 '성공/실패'를 모두 담을 수 있는 칸이 준비되어 있었네요! 그러니까 굳이 사과 쪽지 타입을 따로 만들 필요 없이, 그냥 기본 배달 상자 하나만 쓴다고 적어두면 충분합니다."

// 해결 방법: 우리가 만들었던 type ActionError를 지우고, 반환 타입에서 | ActionError를 깔끔하게 빼주면 됩니다.

/** * 일자별 면접 횟수 조회 Action */
export async function getInterviewStatsAction(): Promise<
  ApiResponse<InterviewStat[]> | ActionError
> {
  try {
    return await getInterviewStats()
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '면접 통계를 불러오는데 실패했습니다.',
    }
  }
}

/** * 전체 공지사항 목록 조회 Action */
export async function getNoticesAction(): Promise<ApiResponse<Notice[]> | ActionError> {
  try {
    return await getNotices()
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '공지사항 목록을 불러오는데 실패했습니다.',
    }
  }
}

/** * 공지사항 상세 내용 조회 Action */
export async function getNoticeDetailAction(
  noticeId: number,
): Promise<ApiResponse<NoticeDetail> | ActionError> {
  try {
    return await getNoticeDetail(noticeId)
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || '공지사항 상세 내용을 불러오는데 실패했습니다.',
    }
  }
}

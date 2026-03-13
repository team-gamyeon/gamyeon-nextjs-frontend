import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { InterviewStat } from '../types'
import type { Notice, NoticeDetail } from '@/featured/notice/types'

//일자별 면접 횟수 조회
export async function getInterviewStats(): Promise<ApiResponse<InterviewStat[]>> {
  return await serverApi.get<InterviewStat[]>('/api/v1/intvs/stats')
}

// 피드백 2번 해설: "나중에 날짜를 좁혀서 검색할 수 있어요!"
// 팀원 피드백: 추후에 파라미터 값을 붙여줘야 할 수도 있습니다. ex) /api/v1/intvs/stats?startDate=2026-03-01&endDate=2026-03-10 이런 느낌으로다가

// 쉬운 해석: "지금은 요리사(service)가 오븐(API)한테 '면접 기록 싹 다 가져와!' 하고 통째로 가져오고 있죠? 그런데 데이터가 10년 치가 쌓이면 너무 무거워질 거예요. 그래서 나중에는 오븐한테 '3월 1일부터 3월 10일까지 기록만 가져와!' 하고 특정 기간(startDate, endDate)을 콕 집어서 주문하게 될 테니, 미리 그 주문표(파라미터)를 받을 수 있게 자리를 비워두자!"라는 뜻입니다.

// 해결 방법: 함수 괄호 () 안에 params (주문표)를 받을 수 있게 옵션으로 열어두면 됩니다.

// 전체 공지사항 목록 조회
export async function getNotices(): Promise<ApiResponse<Notice[]>> {
  return await serverApi.get<Notice[]>('/api/v1/notices')
}

//공지사항 상세 내용 조회
export async function getNoticeDetail(noticeId: number): Promise<ApiResponse<NoticeDetail>> {
  return await serverApi.get<NoticeDetail>(`/api/v1/notices/${noticeId}`)
}

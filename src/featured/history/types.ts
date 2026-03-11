export type SortBy = 'date' | 'score'

export type InterviewStatus = 'completed' | 'pending' | 'analysing' | 'failed'

export interface InterviewRecord {
  id: string
  date: string
  position: string
  score: number | null
  prevScore: number | null
  questionCount: number
  duration: string
  status: InterviewStatus
  strengths: string[]
  improvements: string[]
}

export const MOCK_RECORDS: InterviewRecord[] = [
  {
    id: '1',
    date: '2026.03.10',
    position: '프론트엔드 개발자',
    score: null,
    prevScore: 85,
    questionCount: 5,
    duration: '10분 15초',
    status: 'analysing',
    strengths: [],
    improvements: [],
  },
  {
    id: '2',
    date: '2026.03.02',
    position: '프론트엔드 개발자',
    score: 62,
    prevScore: null,
    questionCount: 5,
    duration: '10분 30초',
    status: 'failed',
    strengths: ['성실한 태도', '기본기 탄탄'],
    improvements: ['답변 구조화 필요', '구체적 사례 부족'],
  },
  {
    id: '3',
    date: '2026.03.02',
    position: '라인 경력 백엔드 개발자 직무 면접',
    score: 68,
    prevScore: 62,
    questionCount: 5,
    duration: '11분 45초',
    status: 'pending',
    strengths: ['문제 해결 능력', '논리적 사고'],
    improvements: ['기술 깊이 부족', '답변 구조화'],
  },
  {
    id: '4',
    date: '2026.03.03',
    position: '토스 신입 프론트엔드 개발자 최종 면접',
    score: 71,
    prevScore: 68,
    questionCount: 5,
    duration: '12분 00초',
    status: 'completed',
    strengths: ['논리적 흐름', '기술 키워드 활용'],
    improvements: ['자신감 있는 말투 필요'],
  },
  {
    id: '5',
    date: '2026.03.04',
    position: '쿠팡 신입 풀스택 개발자 1차 면접',
    score: 74,
    prevScore: 71,
    questionCount: 5,
    duration: '13분 10초',
    status: 'failed',
    strengths: ['명확한 결론 제시', '기술 키워드 활용'],
    improvements: ['꼬리 질문 대비 필요'],
  },
  {
    id: '6',
    date: '2026.03.04',
    position: '당근마켓 신입 백엔드 개발자 직무 면접',
    score: 76,
    prevScore: 74,
    questionCount: 5,
    duration: '12분 30초',
    status: 'completed',
    strengths: ['논리적 답변 구조', '시간 관리'],
    improvements: ['구체적 사례 부족', 'STAR 기법 활용'],
  },
  {
    id: '7',
    date: '2026.03.05',
    position: '카카오페이 신입 프론트엔드 개발자 면접',
    score: 78,
    prevScore: 76,
    questionCount: 5,
    duration: '13분 00초',
    status: 'pending',
    strengths: ['STAR 기법 적용', '시간 관리'],
    improvements: ['마지막 질문 준비 부족'],
  },
  {
    id: '8',
    date: '2026.03.06',
    position: '삼성SDS 경력 데브옵스 엔지니어 직무 면접',
    score: 80,
    prevScore: 78,
    questionCount: 5,
    duration: '12분 40초',
    status: 'completed',
    strengths: ['운영 경험 풍부', '논리적 설명'],
    improvements: ['자동화 사례 보완'],
  },
  {
    id: '9',
    date: '2026.03.07',
    position: '배민 신입 프론트엔드 개발자 최종 면접',
    score: 82,
    prevScore: 80,
    questionCount: 5,
    duration: '14분 15초',
    status: 'completed',
    strengths: ['STAR 기법 적용', '구체적 수치 활용', '시간 관리'],
    improvements: ['자신감 있는 말투 필요'],
  },
  {
    id: '10',
    date: '2026.03.07',
    position: '네이버클라우드 신입 풀스택 개발자 면접',
    score: 83,
    prevScore: 82,
    questionCount: 5,
    duration: '13분 50초',
    status: 'completed',
    strengths: ['명확한 결론', '논리적 흐름'],
    improvements: ['기술 깊이 보완'],
  },
  {
    id: '11',
    date: '2026.03.08',
    position: '카카오 경력 프론트엔드 개발자 최종 면접',
    score: 85,
    prevScore: 83,
    questionCount: 5,
    duration: '14분 30초',
    status: 'completed',
    strengths: ['구체적 수치 활용', '명확한 결론', '자신감'],
    improvements: ['꼬리 질문 대비 필요'],
  },
]

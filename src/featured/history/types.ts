export type SortBy = 'date' | 'score'

export type InterviewStatus = 'completed' | 'pending' | 'analysing'

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
    date: '2026.03.09',
    position: '프론트엔드 개발자',
    score: null,
    prevScore: 76,
    questionCount: 5,
    duration: '10분 15초',
    status: 'analysing',
    strengths: [],
    improvements: [],
  },
  {
    id: '2',
    date: '2026.03.05',
    position: '프론트엔드 개발자',
    score: 76,
    prevScore: 68,
    questionCount: 5,
    duration: '12분 30초',
    status: 'completed',
    strengths: ['논리적 답변 구조', '시간 관리'],
    improvements: ['구체적 사례 부족', 'STAR 기법 활용'],
  },
  {
    id: '3',
    date: '2026.03.01',
    position: '프론트엔드 개발자',
    score: 0,
    prevScore: 65,
    questionCount: 5,
    duration: '00분 00초',
    status: 'pending',
    strengths: [],
    improvements: [],
  },
  {
    id: '4',
    date: '2026.02.22',
    position: '프론트엔드 개발자',
    score: 68,
    prevScore: 65,
    questionCount: 5,
    duration: '14분 15초',
    status: 'completed',
    strengths: ['기술 키워드 활용'],
    improvements: ['답변 시간 초과', '자신감 부족'],
  },
  {
    id: '5',
    date: '2026.02.14',
    position: '프론트엔드 개발자',
    score: 82,
    prevScore: 76,
    questionCount: 5,
    duration: '13분 00초',
    status: 'completed',
    strengths: ['STAR 기법 적용', '구체적 수치 활용', '시간 관리'],
    improvements: ['마지막 질문 준비 부족'],
  },
]

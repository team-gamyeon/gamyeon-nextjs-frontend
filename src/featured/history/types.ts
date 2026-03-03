export interface InterviewRecord {
  id: string
  date: string
  position: string
  score: number
  prevScore: number | null
  questionCount: number
  duration: string
  strengths: string[]
  improvements: string[]
}

export type SortBy = 'date' | 'score'

export const MOCK_RECORDS: InterviewRecord[] = [
  {
    id: '1',
    date: '2026.02.25',
    position: '프론트엔드 개발자',
    score: 76,
    prevScore: 68,
    questionCount: 5,
    duration: '12분 30초',
    strengths: ['논리적 답변 구조', '시간 관리'],
    improvements: ['구체적 사례 부족', 'STAR 기법 활용'],
  },
  {
    id: '2',
    date: '2026.02.22',
    position: '프론트엔드 개발자',
    score: 68,
    prevScore: 65,
    questionCount: 5,
    duration: '14분 15초',
    strengths: ['기술 키워드 활용'],
    improvements: ['답변 시간 초과', '자신감 부족'],
  },
  {
    id: '3',
    date: '2026.02.18',
    position: '백엔드 개발자',
    score: 65,
    prevScore: null,
    questionCount: 5,
    duration: '11분 45초',
    strengths: ['성실한 답변 태도'],
    improvements: ['기술 깊이 부족', '구조화 미흡'],
  },
  {
    id: '4',
    date: '2026.02.14',
    position: '프론트엔드 개발자',
    score: 82,
    prevScore: 76,
    questionCount: 5,
    duration: '13분 00초',
    strengths: ['STAR 기법 적용', '구체적 수치 활용', '시간 관리'],
    improvements: ['마지막 질문 준비 부족'],
  },
  {
    id: '5',
    date: '2026.02.10',
    position: 'PM/기획',
    score: 71,
    prevScore: null,
    questionCount: 5,
    duration: '15분 20초',
    strengths: ['논리적 사고'],
    improvements: ['직무 이해 보완 필요', '사례 다양성'],
  },
]

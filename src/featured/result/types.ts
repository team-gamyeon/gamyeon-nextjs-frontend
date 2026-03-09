export interface RadarDataPoint {
  label: string
  value: number
  description: string
}

export interface FeedbackItem {
  question: string
  score: number
  feedback: string
  tags: string[]
  videoUrl?: string
}

export interface NextAction {
  title: string
  description: string
}

export const MOCK_RADAR_DATA: RadarDataPoint[] = [
  {
    label: '답변 구성력',
    value: 30,
    description:
      '결론부터 말하는 두괄식 구조를 갖추었는지, 그리고 이유와 사례를 논리적인 순서로 배치하여 전달했는지 평가합니다.',
  },
  {
    label: '시선 집중도',
    value: 68,
    description:
      '면접 중 시선의 흔들림이나 이탈을 분석하여, 질문자(카메라)를 향한 시선의 유지 정도와 태도의 안정감을 측정합니다.',
  },
  {
    label: '키워드',
    value: 72,
    description: '지원 직무와 관련된 핵심 어휘를 적절히 사용했는지와 답변 내 빈도수를 체크합니다.',
  },
  {
    label: '논리성',
    value: 75,
    description:
      '답변의 전개 방식이 타당하며, 질문의 의도에 부합하는 결론을 도출하고 있는지 평가합니다.',
  },
  {
    label: '시간 관리',
    value: 90,
    description:
      '제한된 답변 시간(60초) 내에 핵심 내용을 얼마나 효율적으로 전달했는지 계산합니다.',
  },
]

export const MOCK_FEEDBACKS: FeedbackItem[] = [
  {
    question: '자기소개를 부탁드립니다.',
    score: 85,
    feedback:
      '핵심 역량을 잘 정리하여 전달했습니다. 지원 동기와 연결하여 더 구체적으로 말씀하시면 좋겠습니다.',
    tags: ['좋은 구조', '동기 보완 필요'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    question: '가장 어려웠던 기술적 도전은?',
    score: 72,
    feedback:
      '문제 상황 설명은 잘했으나, 해결 과정을 STAR 기법으로 구조화하면 더 설득력이 높아집니다.',
    tags: ['구체적 사례', 'STAR 기법 활용 권장'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    question: '팀 내 의견 충돌 대처 방법은?',
    score: 68,
    feedback:
      '협업 경험이 부족한 느낌입니다. 구체적인 갈등 사례와 본인의 역할을 더 명확히 설명해주세요.',
    tags: ['사례 부족', '역할 명확화 필요'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    question: '5년 후 커리어 목표는?',
    score: 78,
    feedback:
      '비전이 명확하고 현실적입니다. 회사의 성장과 연결 지으면 더 좋은 인상을 줄 수 있습니다.',
    tags: ['명확한 비전', '회사 연계 보완'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
]

export const MOCK_STRENGTHS: string[] = [
  '답변 시간 관리가 우수합니다 (평균 1분 45초)',
  '핵심 키워드를 적절히 활용했습니다',
  '논리적인 답변 구조를 갖추고 있습니다',
]

export const MOCK_IMPROVEMENTS: string[] = [
  '구체적인 사례와 수치를 더 활용해주세요',
  'STAR 기법으로 답변을 구조화하면 좋겠습니다',
  '팀워크 관련 경험을 더 준비해주세요',
]

export const MOCK_NEXT_ACTIONS: NextAction[] = [
  { title: 'STAR 기법 연습', description: '상황-과제-행동-결과 프레임워크로 답변 구조화하기' },
  { title: '협업 사례 정리', description: '팀 프로젝트 경험 3가지 이상 구체적으로 준비하기' },
  { title: '재면접 연습', description: '같은 직무의 다른 질문으로 다시 연습하기' },
]

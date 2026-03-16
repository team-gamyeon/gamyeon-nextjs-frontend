import { AiConfidenceLevel, CompetencyScores } from './types'

// 점수 구간 기준 상수
export const SCORE_THRESHOLD = {
  EXCELLENT: 76,
  GOOD: 51,
  FAIR: 26,
} as const

/**
 * [통합 버전] 점수를 넣으면 등급, 코멘트, CSS 스타일, 차트 색상을 한 번에 반환합니다.
 */
export function getScoreConfig(score: number) {
  if (score >= SCORE_THRESHOLD.EXCELLENT) {
    return {
      grade: '좋음',
      comment: '아주 훌륭한 답변입니다!',
      style: 'bg-blue-500/10 text-blue-500',
      chartColor: '#3b82f6', // blue-500
    }
  }
  if (score >= SCORE_THRESHOLD.GOOD) {
    return {
      grade: '양호',
      comment: '괜찮은 수준입니다! 조금만 더 보완해볼까요?',
      style: 'bg-green-500/10 text-green-500',
      chartColor: '#22c55e', // green-500
    }
  }
  if (score >= SCORE_THRESHOLD.FAIR) {
    return {
      grade: '보통',
      comment: '부족하지만 가능성이 보입니다.',
      style: 'bg-yellow-500/10 text-yellow-600',
      chartColor: '#eab308', // yellow-500
    }
  }
  return {
    grade: '미흡',
    comment: '미흡합니다. 좀 더 연습이 필요해요.',
    style: 'bg-red-500/10 text-red-600',
    chartColor: '#ef4444', // red-500
  }
}

// AI 분석 신뢰도 스타일 상수
export const AI_CONFIDENCE_STYLE: Record<AiConfidenceLevel, string> = {
  높음: 'bg-green-500/10 text-green-600',
  보통: 'bg-yellow-500/10 text-yellow-600',
  낮음: 'bg-orange-500/10 text-orange-600',
  '생성 불가': 'bg-muted text-muted-foreground',
}

/**
 * 리포트 관련 API 응답 코드
 */
export const REPORT_API_CODE = {
  SUCCESS: 'CMMN-S000',
} as const

/**
 * API의 영문 키값을 한글 라벨과 설명으로 매핑하기 위한 딕셔너리
 */
export const COMPETENCY_MAP: Record<
  keyof CompetencyScores,
  { label: string; description: string }
> = {
  logic: {
    label: '논리성',
    description: '질문의 의도를 파악하고 논리적인 흐름으로 답변을 전개했는지 평가합니다.',
  },
  answerComposition: {
    label: '답변 구성력',
    description: 'PREP 기법 등 체계적인 구조를 갖추어 답변했는지 평가합니다.',
  },
  gaze: {
    label: '시선 집중도',
    description: '카메라(면접관)를 안정적으로 응시하며 자신감을 보였는지 평가합니다.',
  },
  timeManagement: {
    label: '시간 관리',
    description: '주어진 시간 내에 적절한 길이로 핵심 내용을 전달했는지 평가합니다.',
  },
  keyword: {
    label: '핵심 키워드',
    description: '직무 및 질문과 관련된 주요 키워드를 효과적으로 활용했는지 평가합니다.',
  },
}

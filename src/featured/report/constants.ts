import { ScoreGrade, AiConfidenceLevel, ScoreRangeFeedback } from './types'

// 점수 구간 기준 상수
const SCORE_THRESHOLD = {
  EXCELLENT: 76,
  GOOD: 51,
  FAIR: 26,
} as const

// 점수 구간별 피드백 및 스타일 통합 관리 (0-25: 미흡, 26-50: 보통, 51-75: 양호, 76-100: 좋음)
const SCORE_FEEDBACK_MAP: Record<ScoreGrade, ScoreRangeFeedback> = {
  미흡: {
    grade: '미흡',
    comment: '미흡합니다. 좀 더 연습이 필요해요.',
    style: 'bg-red-500/10 text-red-600',
  },
  보통: {
    grade: '보통',
    comment: '부족하지만 가능성이 보입니다.',
    style: 'bg-yellow-500/10 text-yellow-600',
  },
  양호: {
    grade: '양호',
    comment: '괜찮은 수준입니다! 조금만 더 보완해볼까요?',
    style: 'bg-green-500/10 text-green-500',
  },
  좋음: {
    grade: '좋음',
    comment: '아주 훌륭한 답변입니다!',
    style: 'bg-blue-500/10 text-blue-500',
  },
}

// AI 분석 신뢰도 스타일 상수
const AI_CONFIDENCE_STYLE: Record<AiConfidenceLevel, string> = {
  높음: 'bg-green-500/10 text-green-600',
  보통: 'bg-yellow-500/10 text-yellow-600',
  낮음: 'bg-orange-500/10 text-orange-600',
  '생성 불가': 'bg-muted text-muted-foreground',
}

/** * 점수에 따른 등급 반환 (25점 단위 구간)
 */
function getScoreGrade(score: number): ScoreGrade {
  if (score >= SCORE_THRESHOLD.EXCELLENT) return '좋음'
  if (score >= SCORE_THRESHOLD.GOOD) return '양호'
  if (score >= SCORE_THRESHOLD.FAIR) return '보통'
  return '미흡'
}

/**
 * 리포트 관련 API 응답 코드
 */
const REPORT_API_CODE = {
  SUCCESS: 'CMMN-S000',
} as const

export { SCORE_THRESHOLD, SCORE_FEEDBACK_MAP, AI_CONFIDENCE_STYLE, REPORT_API_CODE, getScoreGrade }

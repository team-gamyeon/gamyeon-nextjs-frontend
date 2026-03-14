export type ScoreGrade = '미흡' | '보통' | '양호' | '좋음'

const SCORE_GRADE_STYLE: Record<ScoreGrade, string> = {
  미흡: 'bg-red-500/10 text-red-600',
  보통: 'bg-yellow-500/10 text-yellow-600',
  양호: 'bg-green-500/10 text-green-500',
  좋음: 'bg-blue-500/10 text-blue-500',
}

function getScoreGrade(score: number): ScoreGrade {
  if (score >= 75) return '좋음'
  if (score >= 50) return '양호'
  if (score >= 25) return '보통'
  return '미흡'
}

export type AiConfidenceLevel = '높음' | '보통' | '낮음' | '생성 불가'

const AI_CONFIDENCE_STYLE: Record<AiConfidenceLevel, string> = {
  높음: 'bg-green-500/10 text-green-600',
  보통: 'bg-yellow-500/10 text-yellow-600',
  낮음: 'bg-orange-500/10 text-orange-600',
  '생성 불가': 'bg-muted text-muted-foreground',
}

// ---------------------------------------------------------
// API 상태값 상수 및 UI 맵핑
// ---------------------------------------------------------

// 리포트 생성 상태 (reportStatus)
const REPORT_STATUS = {
  SUCCEED: 'SUCCEED',
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
} as const

const REPORT_STATUS_LABEL: Record<string, string> = {
  [REPORT_STATUS.SUCCEED]: '분석 완료',
  [REPORT_STATUS.IN_PROGRESS]: '분석 중',
  [REPORT_STATUS.FAILED]: '분석 실패',
}

// 면접 진행 상태 (intvStatus)
const INTV_STATUS = {
  READY: 'READY',
  FINISHED: 'FINISHED',
  PAUSED: 'PAUSED',
  IN_PROGRESS: 'IN_PROGRESS',
} as const

const INTV_STATUS_LABEL: Record<string, string> = {
  [INTV_STATUS.READY]: '준비 중',
  [INTV_STATUS.FINISHED]: '면접 완료',
  [INTV_STATUS.PAUSED]: '일시 정지',
  [INTV_STATUS.IN_PROGRESS]: '진행 중',
}

export type ReportCardType = 'completedCard' | 'analysingCard' | 'failedCard' | 'pendingCard' | null 

export function getReportCardType(
  intvStatus: string,
  reportStatus?: string | null,
): ReportCardType {
  if (intvStatus === INTV_STATUS.FINISHED) {
    if (reportStatus === REPORT_STATUS.SUCCEED) return 'completedCard'
    if (reportStatus === REPORT_STATUS.IN_PROGRESS) return 'analysingCard'
    if (reportStatus === REPORT_STATUS.FAILED) return 'failedCard'
  }

  if (intvStatus === INTV_STATUS.PAUSED) {
    return 'pendingCard'
  }

  // 기획서에 없는 모든 상태(IN_PROGRESS, READY 등)는 null(없음)을 반환!
  return null
}

export {
  SCORE_GRADE_STYLE,
  getScoreGrade,
  AI_CONFIDENCE_STYLE,
  REPORT_STATUS,
  REPORT_STATUS_LABEL,
  INTV_STATUS,
  INTV_STATUS_LABEL,
}

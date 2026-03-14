// ==========================================
// 리포트 상세 페이지 UI 전용 상수
// ==========================================

export type ScoreGrade = '미흡' | '보통' | '양호' | '좋음'

export const SCORE_GRADE_STYLE: Record<ScoreGrade, string> = {
  미흡: 'bg-red-500/10 text-red-600',
  보통: 'bg-yellow-500/10 text-yellow-600',
  양호: 'bg-green-500/10 text-green-500',
  좋음: 'bg-blue-500/10 text-blue-500',
}

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 75) return '좋음'
  if (score >= 50) return '양호'
  if (score >= 25) return '보통'
  return '미흡'
}

export type AiConfidenceLevel = '높음' | '보통' | '낮음' | '생성 불가'

export const AI_CONFIDENCE_STYLE: Record<AiConfidenceLevel, string> = {
  높음: 'bg-green-500/10 text-green-600',
  보통: 'bg-yellow-500/10 text-yellow-600',
  낮음: 'bg-orange-500/10 text-orange-600',
  '생성 불가': 'bg-muted text-muted-foreground',
}

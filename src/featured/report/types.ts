// ==========================================
// 1. API 응답 및 데이터 모델 타입
// ==========================================

export interface CompetencyScores {
  logic: number
  answerComposition: number
  gaze: number
  timeManagement: number
  keyword: number
}

export interface QuestionFeedbackDetail {
  strength: string
  improvement: string
}

export interface QuestionSummary {
  index: number
  question: string
  answerSummary: string
  feedbackBadges: string[]
  feedback: QuestionFeedbackDetail
}

export interface DetailReportBody {
  totalScore: number
  reportAccuracy: '높음' | '보통' | '낮음' | '생성 불가'
  jobCategory: string | null
  answeredCount: number
  avgAnswerDurationMs: number
  createdAt: string
  competencyScores: CompetencyScores
  strengths: string[]
  weaknesses: string[]
  questionSummaries: QuestionSummary[]
}

export interface ReportDetailData {
  interviewId: number
  interviewStatus: 'READY' | 'FINISHED' | 'PAUSED' | 'IN_PROGRESS'
  // 삭제된 상태를 프론트에서 처리해야 할 경우를 대비해 'DELETED' 추가 (논리 삭제 시 필요)
  reportStatus: 'SUCCEED' | 'IN_PROGRESS' | 'FAILED' | 'DELETED'
  report: DetailReportBody
}

// ==========================================
// 2. UI/컴포넌트 전용 타입
// ==========================================

export type ScoreGrade = '미흡' | '보통' | '양호' | '좋음'
export type AiConfidenceLevel = '높음' | '보통' | '낮음' | '생성 불가'

export interface ScoreRangeFeedback {
  grade: ScoreGrade
  comment: string
  style: string
}

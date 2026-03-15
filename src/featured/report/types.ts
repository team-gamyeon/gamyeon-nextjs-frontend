// ==========================================
// 1. 공통 유니온(Union) 타입
// ==========================================
export type ScoreGrade = '미흡' | '보통' | '양호' | '좋음'
export type AiConfidenceLevel = '높음' | '보통' | '낮음' | '생성 불가'

// ==========================================
// 2. API 응답 및 데이터 모델 타입
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

// videoUrl 명세 다시 확인해야함 (임의로 넣어둠)
export interface QuestionSummary {
  index: number
  question: string
  answerSummary: string
  feedbackBadges: string[]
  feedback: QuestionFeedbackDetail
  videoUrl?: string | null
}

export interface DetailReportBody {
  totalScore: number
  reportAccuracy: AiConfidenceLevel
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
  reportStatus: 'SUCCEED' | 'IN_PROGRESS' | 'FAILED' | 'DELETED'
  report: DetailReportBody
}

// ==========================================
// 3. UI/컴포넌트 전용 타입
// ==========================================

export interface ScoreRangeFeedback {
  grade: ScoreGrade
  comment: string
  style: string
}

export interface RadarDataPoint {
  label: string
  value: number
  description: string
}

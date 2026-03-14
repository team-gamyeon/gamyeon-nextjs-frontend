// ==========================================
// 면접 결과 리포트 상세 API 관련 타입 (/api/v1/report/detail/{id})
// ==========================================

// 1. 역량별 점수 (방사형 차트용 데이터)
export interface CompetencyScores {
  logic: number
  answerComposition: number
  gaze: number
  timeManagement: number
  keyword: number
}

// 2. 문항별 피드백 상세 객체
export interface QuestionFeedbackDetail {
  characteristic: string
  strength: string
  improvement: string
}

// 3. 문항별 요약 리스트 아이템
export interface QuestionSummary {
  index: number
  question: string
  answerSummary: string
  feedbackBadges: string[]
  feedback: QuestionFeedbackDetail
}

// 4. 리포트 상세 본문 (data.report)
export interface DetailReportBody {
  totalScore: number
  reportAccuracy: string
  jobCategory: string | null
  answeredCount: number
  avgAnswerDurationMs: number
  createdAt: string
  competencyScores: CompetencyScores
  strengths: string[]
  weaknesses: string[]
  questionSummaries: QuestionSummary[]
}

// 5. [최상위] 리포트 상세 API 응답 데이터 (data 객체)
export interface ReportDetailData {
  interviewId: number
  interviewStatus: 'READY' | 'FINISHED' | 'PAUSED' | 'IN_PROGRESS' | (string & {})
  reportStatus: 'SUCCEED' | 'IN_PROGRESS' | 'FAILED' | (string & {})
  report: DetailReportBody
}

// ==========================================
// UI 컴포넌트 전용 타입 (데이터 변환용)
// ==========================================
export interface RadarDataPoint {
  label: string
  value: number
  description: string
}

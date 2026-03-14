// ==========================================
// 1. 리포트 목록 API 관련 타입 (/api/v1/report/list)
// ==========================================
export interface ReportSummary {
  reportId: number
  reportStatus: 'SUCCEED' | 'IN_PROGRESS' | 'FAILED' | (string & {})
  totalScore: number | null
  answeredCount: number | null
  strengths: string[] | null
  weaknesses: string[] | null
}

export interface InterviewReportItem {
  interviewId: number
  intvTitle: string
  intvStatus: 'FINISHED' | 'PAUSED' | 'IN_PROGRESS' | (string & {})
  durationMs: number | null
  updatedAt: string
  report: ReportSummary | null
}

// ==========================================
// 2. 리포트 상세 API 관련 타입 (/api/v1/report/detail/{id})
// ==========================================

// 2-1. 역량별 점수 (방사형 차트용 데이터)
export interface CompetencyScores {
  logic: number
  answerComposition: number
  gaze: number
  timeManagement: number
  keyword: number
}

// 2-2. 문항별 피드백 상세 객체
export interface QuestionFeedbackDetail {
  characteristic: string
  strength: string
  improvement: string
}

// 2-3. 문항별 요약 리스트 아이템
export interface QuestionSummary {
  index: number
  question: string
  answerSummary: string
  feedbackBadges: string[]
  feedback: QuestionFeedbackDetail
}

// 2-4. 리포트 상세 본문 (data.report)
export interface DetailReportBody {
  totalScore: number
  reportAccuracy: string // '높음', '보통' 등 (AiConfidenceLevel과 매핑 가능)
  jobCategory: string | null
  answeredCount: number
  avgAnswerDurationMs: number
  createdAt: string
  competencyScores: CompetencyScores
  strengths: string[]
  weaknesses: string[]
  questionSummaries: QuestionSummary[]
}

// 2-5. [최상위] 리포트 상세 API 응답 데이터 (data 객체)
export interface ReportDetailData {
  interviewId: number
  interviewStatus: 'READY' | 'FINISHED' | 'PAUSED' | 'IN_PROGRESS' | (string & {})
  reportStatus: 'SUCCEED' | 'IN_PROGRESS' | 'FAILED' | (string & {})
  report: DetailReportBody
}

// ==========================================
// 3. UI 컴포넌트 전용 타입 (데이터 변환용)
// ==========================================
// API의 CompetencyScores를 레이더 차트 컴포넌트에 넣기 위해 변환할 때 사용할 타입
export interface RadarDataPoint {
  label: string
  value: number
  description: string
}

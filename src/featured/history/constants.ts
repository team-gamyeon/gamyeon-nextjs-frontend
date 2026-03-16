import { InterviewReportItem, ReportSummary } from './types'

// 1. 리포트 생성 상태 (reportStatus)
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

// 2. 면접 진행 상태 (intvStatus)
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

// ==========================================
// UI 카드 타입
// ==========================================

type ReportCardType = 'completedCard' | 'analysingCard' | 'failedCard' | 'pendingCard' | null

// 2. UI 카드 타입 결정 로직
function getReportCardType(
  intvStatus: InterviewReportItem['intvStatus'],
  reportStatus?: ReportSummary['reportStatus'] | null,
): ReportCardType {
  // 면접이 FINISHED인 경우, 리포트 상태에 따라 카드 분기
  if (intvStatus === INTV_STATUS.FINISHED) {
    if (reportStatus === REPORT_STATUS.SUCCEED) return 'completedCard' // 활성화
    if (reportStatus === REPORT_STATUS.IN_PROGRESS) return 'analysingCard' // ai 분석중
    if (reportStatus === REPORT_STATUS.FAILED) return 'failedCard' // 실패 안내
  }

  // 면접이 PAUSED인 경우 (report_status는 null)
  if (intvStatus === INTV_STATUS.PAUSED) {
    return 'pendingCard' // (이어하기 카드)
  }

  // IN_PROGRESS 등 나머지 상태
  return null
}

export {
  REPORT_STATUS,
  REPORT_STATUS_LABEL,
  INTV_STATUS,
  INTV_STATUS_LABEL,
  getReportCardType,
  type ReportCardType,
}

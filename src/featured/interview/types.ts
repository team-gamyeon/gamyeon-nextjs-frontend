export type Phase = 'ready' | 'thinking' | 'answering' | 'transition' | 'finished'

export interface InterviewSession {
  currentQuestion: number
  phase: Phase
  timeLeft: number
  micOn: boolean
  cameraOn: boolean
  showEndDialog: boolean
  typingKey: number
  questionRevealed: boolean
  interviewTitle: string
  showSetup: boolean
}

export type FocusState =
  | 'CENTER'
  | 'LEFT'
  | 'RIGHT'
  | 'TOP'
  | 'BOTTOM'
  | 'TOP-LEFT'
  | 'TOP-RIGHT'
  | 'BOTTOM-LEFT'
  | 'BOTTOM-RIGHT'

interface RawGazeData {
  offset_ms: number
  gaze: {
    left: {
      x: number
      y: number
    }
    right: {
      x: number
      y: number
    }
  }
  head: {
    pitch: number
    yaw: number
    roll: number
  }
}

interface GazeEvent {
  type: 'AWAY_START' | 'AWAY_END'
  offset_ms: number
  direction: FocusState
}

export interface InterviewBatchPayload {
  meta: {
    interviewId: string
    questionId: string
    timestamp: number
    segmentSequence: number
  }
  metrics_summary: {
    average_concentration: number
    blink_count: number
    is_away_detected: boolean
  }
  raw_data: RawGazeData[] // 10FPS 기준 10초간의 데이터 (약 100개)
  events: GazeEvent[] // 구간 내 발생한 모든 이탈/복귀 이벤트
}
export interface BackendPayload {
  timestamp: string
  focusState: FocusState
  blinkCount: number
  pitch: string
  yaw: string
  roll: string
  leftGazeX: string
  leftGazeY: string
  rightGazeX: string
  rightGazeY: string
  eventType: 'ANOMALY' | 'RECOVERY' // 백엔드 분류용 태그
}

export const QUESTIONS = [
  '자기소개를 부탁드립니다. 본인의 핵심 역량과 지원 동기를 중심으로 말씀해주세요.',
  '이전 프로젝트에서 가장 어려웠던 기술적 도전은 무엇이었고, 어떻게 해결하셨나요?',
  '팀 내에서 의견 충돌이 발생했을 때 어떻게 대처하시나요? 구체적인 경험을 말씀해주세요.',
  '5년 후 본인의 커리어 목표는 무엇인가요?',
  '마지막으로 저희에게 하고 싶은 질문이 있으신가요?',
] as const

export const TOTAL_THINK_TIME = 10
export const TOTAL_ANSWER_TIME = 60

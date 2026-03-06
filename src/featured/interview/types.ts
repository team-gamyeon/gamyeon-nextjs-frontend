export type Phase = 'ready' | 'thinking' | 'answering' | 'transition' | 'finished'

export type StepStatus = 'pending' | 'active' | 'done'
export type PermStatus = 'idle' | 'requesting' | 'granted' | 'denied'

export interface InterviewSetupConfig {
  title: string
  basePose: { pitch: number; yaw: number } | null
}

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
  raw_data: RawGazeData[]
  events: GazeEvent[]
}

export type Phase = 'ready' | 'thinking' | 'answering' | 'transition' | 'finished'

export type StepStatus = 'pending' | 'active' | 'done'
export type PermStatus = 'idle' | 'requesting' | 'granted' | 'denied'
export type RecordingStatus = 'idle' | 'recording' | 'recorded'

export interface InterviewSetupConfig {
  title: string
  basePose: { pitch: number; yaw: number } | null
  stream: MediaStream | null
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

export interface RawGazeData {
  offset_ms: number
  confidence: number
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

export interface GazeEvent {
  type: 'AWAY_START' | 'AWAY_END'
  offset_ms: number
  direction: FocusState
}

export interface createInterviewResponse {
  intvId: number
  title: string
  status: string
}

export interface updateInterviewTitleResponse {
  intvId: number
  title: string
  status: string
}
export type InterviewFileType = 'RESUME' | 'PORTFOLIO' | 'SELF_INTRO'
export interface issuePresignedUrlRequest {
  fileType: string
  originalFileName: string
  contentType: string
  fileSizeBytes: number
}
export interface FileInfo {
  fileType: string
  originalFileName: string
  fileKey: string
  fileUrl: string
}
export interface issuePresignedUrlResponse {
  preparationId: number
  fileType: InterviewFileType
  originalFileName: string
  fileKey: string
  presignedUrl: string
  fileUrl: string
  expiresInSeconds: number
}
export type preparationStatusType = 'READY'
export interface completeFileUploadResponse {
  preparationId: number
  fileId: number
  fileType: InterviewFileType
  originalFileName: string
  fileKey: string
  fileUrl: string
  preparationStatus: preparationStatusType
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

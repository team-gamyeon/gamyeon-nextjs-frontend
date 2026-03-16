'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TOTAL_ANSWER_TIME, TOTAL_THINK_TIME } from '@/featured/interview/constants'
import type { InterviewQuestions, Phase } from '@/featured/interview/types'
import {
  completeVideoFileUploadAction,
  issueVideoPresignedUrlAction,
  requestAnswerAnalysisAction,
} from '@/featured/interview/actions/interview.action'
import uploadFileToS3 from '@/shared/lib/utils/uploadFileToS3'
import { useVideoRecorder } from '@/featured/interview/hooks/useVideoRecorder'

export function useInterview() {
  const router = useRouter()
  const { stopRecording, startRecording } = useVideoRecorder()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [timeLeft, setTimeLeft] = useState(TOTAL_THINK_TIME)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [typingKey, setTypingKey] = useState(0)
  const [questionRevealed, setQuestionRevealed] = useState(false)
  const [showSetup, setShowSetup] = useState(true)
  const [interviewTitle, setInterviewTitle] = useState('AI 모의 면접')
  const [basePose, setBasePose] = useState<{ pitch: number; yaw: number } | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [interviewId, setInterviewId] = useState<number | null>(null)
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestions[]>([])

  const phaseRef = useRef(phase)
  const currentQuestionRef = useRef(currentQuestion)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const interviewIdRef = useRef<number | null>(null)
  const interviewQuestionsRef = useRef<InterviewQuestions[]>([])

  const isActive = phase === 'thinking' || phase === 'answering'

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    currentQuestionRef.current = currentQuestion
  }, [currentQuestion])

  useEffect(() => {
    cameraStreamRef.current = cameraStream
  }, [cameraStream])

  useEffect(() => {
    interviewIdRef.current = interviewId
  }, [interviewId])

  useEffect(() => {
    interviewQuestionsRef.current = interviewQuestions
  }, [interviewQuestions])

  const cleanupInterviewMedia = useCallback(() => {
    const stream = cameraStreamRef.current
    if (!stream) return

    stream.getTracks().forEach((track) => {
      if (track.readyState === 'live') {
        track.stop()
      }
    })

    cameraStreamRef.current = null
    setCameraStream(null)
  }, [])

  const handleSetupComplete = (config: {
    title?: string
    basePose?: { pitch: number; yaw: number } | null
    stream?: MediaStream | null
    interviewId?: number | null
    questions?: InterviewQuestions[]
  }) => {
    setInterviewTitle(config.title || 'AI 모의 면접')
    setBasePose(config.basePose ?? null)
    setCameraStream(config.stream ?? null)
    setInterviewId(config.interviewId ?? null)
    setInterviewQuestions(config.questions ?? [])
    setShowSetup(false)
    setTypingKey((prev) => prev + 1)
    setQuestionRevealed(false)
    setPhase('thinking')
    setTimeLeft(TOTAL_THINK_TIME)
  }

  const handleSetupCancel = () => {
    cleanupInterviewMedia()
    router.push('/dashboard')
  }

  const beginAnswering = useCallback(() => {
    const stream = cameraStreamRef.current
    if (phaseRef.current !== 'thinking') return
    if (stream) {
      startRecording(stream)
    }
    setPhase('answering')
    setTimeLeft(TOTAL_ANSWER_TIME)
  }, [startRecording])

  const handleNext = useCallback(async () => {
    const questionIndex = currentQuestionRef.current
    const videoBlob = (await stopRecording()) as Blob

    try {
      const currentInterviewId = interviewIdRef.current
      const currentQuestionSet = interviewQuestionsRef.current[questionIndex]

      if (!currentInterviewId || !currentQuestionSet) {
        throw new Error('영상 업로드에 필요한 인터뷰 정보가 없습니다.')
      }

      const videoFile = new File(
        [videoBlob],
        `answer-${currentQuestionSet.questionSetId}-${Date.now()}.webm`,
        {
          type: videoBlob.type || 'video/webm',
        },
      )

      const urlRes = await issueVideoPresignedUrlAction(currentQuestionSet.questionSetId, {
        video: {
          originalFileName: videoFile.name,
          contentType: videoFile.type,
          fileSizeBytes: videoFile.size,
        },
      })

      if (!urlRes.success || !urlRes.data) {
        throw new Error(urlRes.message || '영상 Presigned URL 발급 실패')
      }

      const s3Res = await uploadFileToS3(videoFile, urlRes.data.presignedUrl)
      if (!s3Res.success) {
        throw new Error(s3Res.message)
      }

      const completeRes = await completeVideoFileUploadAction(currentQuestionSet.questionSetId, {
        originalFileName: urlRes.data.originalFileName,
        fileKey: urlRes.data.fileKey,
        fileUrl: urlRes.data.fileUrl,
        contentType: videoFile.type,
        fileSizeBytes: videoFile.size,
      })

      const answerId = completeRes.data?.answerId
      if (!answerId) {
        throw new Error('답변 업로드 완료 응답에 answerId가 없습니다.')
      }

      await requestAnswerAnalysisAction(answerId)
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : '답변 처리 중 오류가 발생했습니다.')
    }

    const totalQuestions = interviewQuestionsRef.current.length
    if (questionIndex < totalQuestions - 1) {
      setPhase('transition')
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1)
        setTypingKey((prev) => prev + 1)
        setQuestionRevealed(false)
        setPhase('thinking')
        setTimeLeft(TOTAL_THINK_TIME)
      }, 600)
      return
    }

    setPhase('finished')
  }, [stopRecording])

  useEffect(() => {
    if (phase !== 'thinking' && phase !== 'answering') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phaseRef.current === 'thinking') {
            beginAnswering()
            return TOTAL_ANSWER_TIME
          }

          handleNext()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, handleNext, beginAnswering])

  useEffect(() => {
    const handlePageExit = () => {
      cleanupInterviewMedia()
    }

    window.addEventListener('pagehide', handlePageExit)
    window.addEventListener('beforeunload', handlePageExit)
    window.addEventListener('popstate', handlePageExit)

    return () => {
      window.removeEventListener('pagehide', handlePageExit)
      window.removeEventListener('beforeunload', handlePageExit)
      window.removeEventListener('popstate', handlePageExit)
      cleanupInterviewMedia()
    }
  }, [cleanupInterviewMedia])

  const startInterview = () => {
    setTypingKey((prev) => prev + 1)
    setQuestionRevealed(false)
    setPhase('thinking')
    setTimeLeft(TOTAL_THINK_TIME)
  }

  const startAnswering = () => {
    beginAnswering()
  }

  return {
    currentQuestion,
    interviewQuestions,
    phase,
    timeLeft,
    micOn,
    setMicOn,
    cameraOn,
    setCameraOn,
    showEndDialog,
    setShowEndDialog,
    typingKey,
    questionRevealed,
    setQuestionRevealed,
    showSetup,
    interviewTitle,
    basePose,
    cameraStream,
    isActive,
    handleSetupComplete,
    handleSetupCancel,
    cleanupInterviewMedia,
    handleNext,
    startInterview,
    startAnswering,
  }
}

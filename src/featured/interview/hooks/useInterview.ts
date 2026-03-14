'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, TOTAL_ANSWER_TIME, TOTAL_THINK_TIME } from '@/featured/interview/constants'
import type { Phase } from '@/featured/interview/types'
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

  const phaseRef = useRef(phase)
  const currentQuestionRef = useRef(currentQuestion)
  const cameraStreamRef = useRef<MediaStream | null>(null)

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
  }) => {
    setInterviewTitle(config.title || 'AI 모의 면접')
    setBasePose(config.basePose ?? null)
    setCameraStream(config.stream ?? null)
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
    if (stream) {
      startRecording(stream)
    }
    setPhase('answering')
    setTimeLeft(TOTAL_ANSWER_TIME)
  }, [startRecording])

  const handleNext = useCallback(async () => {
    const questionIndex = currentQuestionRef.current
    await stopRecording()
    if (questionIndex < QUESTIONS.length - 1) {
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

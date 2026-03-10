'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Phase } from '@/featured/interview/types'
import { QUESTIONS, TOTAL_ANSWER_TIME, TOTAL_THINK_TIME } from '@/featured/interview/constants'

export function useInterview() {
  const router = useRouter()

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

  const isActive = phase === 'thinking' || phase === 'answering'

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    currentQuestionRef.current = currentQuestion
  }, [currentQuestion])

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
    router.push('/dashboard')
  }

  const handleNext = useCallback(() => {
    const q = currentQuestionRef.current
    if (q < QUESTIONS.length - 1) {
      setPhase('transition')
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1)
        setTypingKey((prev) => prev + 1)
        setQuestionRevealed(false)
        setPhase('thinking')
        setTimeLeft(TOTAL_THINK_TIME)
      }, 600)
    } else {
      setPhase('finished')
    }
  }, [])

  useEffect(() => {
    if (phase !== 'thinking' && phase !== 'answering') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phaseRef.current === 'thinking') {
            setPhase('answering')
            return TOTAL_ANSWER_TIME
          } else {
            handleNext()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, handleNext])

  const startInterview = () => {
    setTypingKey((prev) => prev + 1)
    setQuestionRevealed(false)
    setPhase('thinking')
    setTimeLeft(TOTAL_THINK_TIME)
  }

  const startAnswering = () => {
    setPhase('answering')
    setTimeLeft(TOTAL_ANSWER_TIME)
  }

  // 면접이 끝나는 즉시 스트림 리소스 정리
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          if (track.readyState === 'live') {
            track.stop()
            console.log('면접 종료로 인한 스트림 트랙 종료')
          }
        })
      }
    }
  }, [cameraStream])

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
    handleNext,
    startInterview,
    startAnswering,
  }
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, VideoOff } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'
import Webcam from 'react-webcam'
import { useGazeTracker } from '../hooks/useGazeTracker'
import { useEffect, useRef, useState } from 'react'

interface VideoAreaProps {
  cameraOn: boolean
  micOn: boolean
  phase: Phase
}

export function VideoArea({ cameraOn, micOn, phase }: VideoAreaProps) {
  const webcamRef = useRef<Webcam>(null)
  const landmarker = useGazeTracker()
  const requestRef = useRef<number | null>(null)

  // 1. 기준점과 이탈 여부를 저장할 변수 (렌더링과 별개로 계산하기 위해 useRef 사용)
  const basePose = useRef<{ x: number; y: number } | null>(null)
  const [isGazeOut, setIsGazeOut] = useState(false)

  // 2. 기준점을 잡는 함수 (면접 시작 버튼 등에 연결)
  const calibrate = (x: number, y: number) => {
    basePose.current = { x, y }
    console.log('🎯 기준점 설정 완료:', basePose.current)
  }

  useEffect(() => {
    if (phase === 'answering' && landmarker && webcamRef.current?.video) {
      const video = webcamRef.current.video
      const result = landmarker.detectForVideo(video, performance.now())

      if (result.faceLandmarks && result.faceLandmarks[0]) {
        const iris = result.faceLandmarks[0][473]
        calibrate(iris.x, iris.y) // 현재 위치를 정면으로 등록
      }
    }
  }, [phase, landmarker]) // 답변 시작 시점에 딱 한 번 실행

  useEffect(() => {
    const detectGaze = () => {
      const video = webcamRef.current?.video

      if (landmarker && video && video.readyState === 4) {
        try {
          const result = landmarker.detectForVideo(video, performance.now())
          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const irisPoint = result.faceLandmarks[0][473] // 오른쪽 눈동자
            if (basePose.current) {
              // 현재 좌표와 기준점의 차이 계산
              const diffX = Math.abs(irisPoint.x - basePose.current.x)
              const diffY = Math.abs(irisPoint.y - basePose.current.y)

              const threshold = 0.01
              if (diffX > threshold || diffY > threshold) {
                setIsGazeOut((prev) => {
                  if (!prev) console.warn('⚠️ 시선 이탈 감지!')
                  return true
                })
              } else {
                setIsGazeOut((prev) => {
                  if (prev) console.log('✅ 정면 복귀')
                  return false
                })
              }
            }
          }
        } catch (error) {
          console.error('MediaPipe Error:', error)
        }
      }
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    if (landmarker && cameraOn) {
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [landmarker, cameraOn])

  return (
    <motion.div
      layout
      className="relative flex aspect-video w-full max-w-[700px] items-center justify-center overflow-hidden rounded-2xl bg-slate-800 shadow-2xl"
    >
      {cameraOn ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="text-center text-white/25">
          <VideoOff className="mx-auto mb-2 h-14 w-14" />
          <p className="text-sm">카메라 꺼짐</p>
        </div>
      )}

      {cameraOn && !landmarker && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <p className="animate-pulse text-sm text-white">AI 분석 엔진 로딩 중...</p>
        </div>
      )}

      <div className="absolute bottom-3 left-3">
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur ${micOn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
        >
          {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          {micOn ? '마이크 켜짐' : '마이크 꺼짐'}
        </div>
      </div>

      <AnimatePresence>
        {phase === 'answering' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 left-3"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium backdrop-blur">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              답변 중
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

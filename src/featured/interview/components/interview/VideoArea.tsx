'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, VideoOff } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'
import { useEffect, useRef } from 'react'
import { useVisionAnalysis } from '@/featured/interview/hooks/useVisionAnalysis'

interface VideoAreaProps {
  cameraOn: boolean
  micOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
  stream?: MediaStream | null
}

export function VideoArea({ cameraOn, micOn, phase, basePose, stream }: VideoAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { landmarker } = useVisionAnalysis({
    cameraOn,
    phase,
    basePose,
    canvasRef,
    videoRef,
  })

  useEffect(() => {
    if (videoRef.current && stream && cameraOn) {
      videoRef.current.srcObject = stream
    }
  }, [stream, cameraOn])

  return (
    <div className="flex w-full max-w-175 flex-col gap-4">
      <motion.div
        layout
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-800 shadow-2xl"
      >
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
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

        <div className="absolute bottom-3 left-3 flex gap-2">
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
              className="absolute top-3 left-3 flex items-center gap-2"
            >
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                답변 분석 중
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

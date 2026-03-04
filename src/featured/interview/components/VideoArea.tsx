'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, VideoOff, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'
import Webcam from 'react-webcam'
import { useGazeTracker } from '../hooks/useGazeTracker'
import { useEffect, useRef, useState } from 'react'

// --- 1. 비전 연산 유틸리티 함수 ---

const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

const calculateEAR = (landmarks: any[], indices: number[], scaleX: number, scaleY: number) => {
  const pts = indices.map((i) => ({
    x: landmarks[i].x * scaleX,
    y: landmarks[i].y * scaleY,
  }))
  const v1 = getDistance(pts[1], pts[5])
  const v2 = getDistance(pts[2], pts[4])
  const h = getDistance(pts[0], pts[3])
  if (h === 0) return 1
  return (v1 + v2) / (2.0 * h)
}

const extractEulerAngles = (matrix: number[] | Float32Array) => {
  try {
    const RAD_TO_DEG = 180 / Math.PI
    const pitch = Math.atan2(matrix[6], matrix[10]) * RAD_TO_DEG
    const yaw = -Math.asin(matrix[2]) * RAD_TO_DEG

    return {
      pitch: isNaN(pitch) ? 0 : pitch,
      yaw: isNaN(yaw) ? 0 : yaw,
    }
  } catch (e) {
    return { pitch: 0, yaw: 0 }
  }
}

const LEFT_EYE = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE = [362, 385, 387, 263, 373, 380]
const EAR_THRESHOLD = 0.22

interface BackendPayload {
  timestamp: string
  focusState: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'
  blinkCount: number
  pitch: string
  yaw: string
  eventType: 'ANOMALY' | 'RECOVERY'
}

interface VideoAreaProps {
  cameraOn: boolean
  micOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
}

export function VideoArea({ cameraOn, micOn, phase, basePose }: VideoAreaProps) {
  // 🎯 [핵심 수정] 도구 상자에서 landmarker만 쏙 꺼내옵니다.
  const { landmarker } = useGazeTracker()

  const webcamRef = useRef<Webcam>(null)
  const requestRef = useRef<number | null>(null)

  const [realtimeStats, setRealtimeStats] = useState({
    pitch: 0,
    yaw: 0,
    ear: 0,
    focusState: 'CENTER',
  })

  const [backendLogs, setBackendLogs] = useState<BackendPayload[]>([])

  const blinkCountRef = useRef(0)
  const isBlinkingRef = useRef(false)
  const lastDetectTimeRef = useRef(0)
  const lastStateUpdateRef = useRef(0)
  const lastLogTimeRef = useRef(0)

  const lastLoggedStateRef = useRef<'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'>('CENTER')

  const DETECT_INTERVAL_MS = 50
  const STATE_INTERVAL_MS = 100

  useEffect(() => {
    const detectGaze = () => {
      requestRef.current = requestAnimationFrame(detectGaze)

      const now = performance.now()
      if (now - lastDetectTimeRef.current < DETECT_INTERVAL_MS) return
      lastDetectTimeRef.current = now

      const video = webcamRef.current?.video
      if (!landmarker || !video || video.readyState !== 4) return

      try {
        const result = landmarker.detectForVideo(video, now)
        if (!result.faceLandmarks?.length) return

        const landmarks = result.faceLandmarks[0]

        // 1. EAR (눈 깜빡임)
        const scaleX = video.videoWidth
        const scaleY = video.videoHeight
        const avgEAR =
          (calculateEAR(landmarks, LEFT_EYE, scaleX, scaleY) +
            calculateEAR(landmarks, RIGHT_EYE, scaleX, scaleY)) /
          2
        if (avgEAR < EAR_THRESHOLD) {
          if (!isBlinkingRef.current) {
            blinkCountRef.current += 1
            isBlinkingRef.current = true
          }
        } else {
          isBlinkingRef.current = false
        }

        // 2. Head Pose (고개 각도)
        let pitch = 0,
          yaw = 0
        const matrixes = result.facialTransformationMatrixes
        if (matrixes && matrixes.length > 0) {
          const rawMatrix = matrixes[0].data || matrixes[0]
          const angles = extractEulerAngles(rawMatrix)
          pitch = angles.pitch
          yaw = angles.yaw
        }

        // 3. 시선 집중도 (모달창에서 잡은 basePose 기준으로 상대 판단!)
        const baseYaw = basePose?.yaw ?? 0
        const basePitch = basePose?.pitch ?? 0
        let currentFocus: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' = 'CENTER'

        if (yaw - baseYaw > 15) currentFocus = 'LEFT'
        else if (yaw - baseYaw < -15) currentFocus = 'RIGHT'
        else if (pitch - basePitch > 15) currentFocus = 'DOWN'
        else if (pitch - basePitch < -10) currentFocus = 'UP'

        // 4. UI 상태 업데이트
        if (now - lastStateUpdateRef.current >= STATE_INTERVAL_MS) {
          lastStateUpdateRef.current = now
          setRealtimeStats({
            pitch: Math.round(pitch),
            yaw: Math.round(yaw),
            ear: Number(avgEAR.toFixed(2)),
            focusState: currentFocus,
          })
        }

        // 5. 백엔드 로그 전송 (Event-driven)
        const isAnomaly = currentFocus !== 'CENTER'
        const isStateChanged = currentFocus !== lastLoggedStateRef.current
        const timeSinceLastLog = now - lastLogTimeRef.current

        if (isAnomaly && (isStateChanged || timeSinceLastLog > 2000)) {
          lastLogTimeRef.current = now
          lastLoggedStateRef.current = currentFocus

          setBackendLogs((prev) =>
            [
              {
                timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                focusState: currentFocus,
                blinkCount: blinkCountRef.current,
                pitch: pitch.toFixed(1),
                yaw: yaw.toFixed(1),
                eventType: 'ANOMALY' as const,
              },
              ...prev,
            ].slice(0, 5),
          )
          blinkCountRef.current = 0
        } else if (!isAnomaly && isStateChanged) {
          lastLogTimeRef.current = now
          lastLoggedStateRef.current = 'CENTER'

          setBackendLogs((prev) =>
            [
              {
                timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                focusState: 'CENTER' as const,
                blinkCount: blinkCountRef.current,
                pitch: pitch.toFixed(1),
                yaw: yaw.toFixed(1),
                eventType: 'RECOVERY' as const,
              },
              ...prev,
            ].slice(0, 5),
          )
          blinkCountRef.current = 0
        }
      } catch (error) {
        console.error('MediaPipe Error:', error)
      }
    }

    if (landmarker && cameraOn && phase === 'answering') {
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [landmarker, cameraOn, phase])

  return (
    <div className="flex w-full max-w-175 flex-col gap-4">
      {/* 윗부분: 비디오 영역 */}
      <motion.div
        layout
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-800 shadow-2xl"
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

        <div className="absolute bottom-3 left-3 flex gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur ${micOn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
          >
            {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            {micOn ? '마이크 켜짐' : '마이크 꺼짐'}
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur ${realtimeStats.focusState === 'CENTER' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}
          >
            <Activity className="h-3 w-3" />
            {realtimeStats.focusState === 'CENTER' ? '응시 중' : '시선 이탈'}
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
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                답변 분석 중
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 아랫부분: 실시간 수치 및 백엔드 전송 로그 영역 */}
      {phase === 'answering' && (
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-xl">
          <div className="flex flex-col gap-2 rounded-xl bg-slate-800 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Activity className="h-4 w-4 text-emerald-400" />
              실시간 비전 데이터 (60fps)
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Pitch (상하)</p>
                <p className="font-mono text-lg">{realtimeStats.pitch}°</p>
              </div>
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Yaw (좌우)</p>
                <p className="font-mono text-lg">{realtimeStats.yaw}°</p>
              </div>
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">EAR (눈 깜빡임)</p>
                <p
                  className={`font-mono text-lg ${realtimeStats.ear < EAR_THRESHOLD ? 'text-red-400' : ''}`}
                >
                  {realtimeStats.ear}
                </p>
              </div>
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Focus State</p>
                <p
                  className={`font-mono text-lg ${realtimeStats.focusState !== 'CENTER' ? 'text-orange-400' : 'text-emerald-400'}`}
                >
                  {realtimeStats.focusState}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-slate-800 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              이상 감지 로그 (Event-driven)
            </h3>
            <div className="mt-2 flex h-35 flex-col gap-2 overflow-y-auto pr-1">
              {backendLogs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  특이점 발생 대기 중...
                </div>
              ) : (
                backendLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded border p-2 font-mono text-[10px] ${log.eventType === 'RECOVERY' ? 'border-emerald-700/50 bg-emerald-900/20' : 'border-orange-700/50 bg-orange-900/20'}`}
                  >
                    <span className="w-16 text-slate-400">{log.timestamp}</span>
                    <span
                      className={`w-14 font-bold ${log.focusState === 'CENTER' ? 'text-emerald-400' : 'text-orange-400'}`}
                    >
                      {log.eventType === 'RECOVERY' ? '정상복귀' : log.focusState}
                    </span>
                    <span className="text-slate-300">Blinks: {log.blinkCount}</span>
                    <span className="w-20 truncate text-right text-[9px] text-slate-500">
                      P:{log.pitch} Y:{log.yaw}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

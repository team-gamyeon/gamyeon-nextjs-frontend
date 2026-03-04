'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, VideoOff, Activity, AlertTriangle } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'
import Webcam from 'react-webcam'
import { useVisionAnalysis } from '@/featured/interview/hooks/useVisionAnalysis'
import { EAR_THRESHOLD, YAW_THRESHOLD, PITCH_THRESHOLD } from '@/featured/interview/utils/visionUtils'

interface VideoAreaProps {
  cameraOn: boolean
  micOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
}

export function VideoArea({ cameraOn, micOn, phase, basePose }: VideoAreaProps) {
  const { backendLogs, realtimeStats, webcamRef, landmarker } = useVisionAnalysis({
    cameraOn,
    phase,
    basePose,
  })

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
          {/* 좌측 패널 */}
          <div className="flex flex-col gap-2 rounded-xl bg-slate-800 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Activity className="h-4 w-4 text-emerald-400" />
              실시간 비전 데이터 (60fps)
            </h3>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Pitch (상하)</p>
                <p className="font-mono text-lg">{realtimeStats.pitch}°</p>
              </div>
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Yaw (좌우)</p>
                <p className="font-mono text-lg">{realtimeStats.yaw}°</p>
              </div>
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Roll (기울기)</p>
                <p className="font-mono text-lg">{realtimeStats.roll}°</p>
              </div>
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">EAR (눈 감김)</p>
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
              <div className="rounded bg-slate-900 p-2">
                <p className="text-slate-400">Blink Count</p>
                <p className="font-mono text-lg text-blue-400">{realtimeStats.blinkCount}</p>
              </div>
            </div>

            {/* Base Pose 기준값 */}
            <div className="mt-1 rounded bg-slate-950/60 px-3 py-2 text-xs">
              <p className="mb-1 text-slate-500">Base Pose (기준 자세)</p>
              {basePose ? (
                <div className="flex gap-4 font-mono text-slate-400">
                  <span>
                    Pitch: <span className="text-slate-300">{basePose.pitch}°</span>
                  </span>
                  <span>
                    Yaw: <span className="text-slate-300">{basePose.yaw}°</span>
                  </span>
                  <span>
                    ΔP:{' '}
                    <span
                      className={
                        Math.abs(realtimeStats.pitch - basePose.pitch) > PITCH_THRESHOLD
                          ? 'text-orange-400'
                          : 'text-slate-300'
                      }
                    >
                      {realtimeStats.pitch - basePose.pitch > 0 ? '+' : ''}
                      {realtimeStats.pitch - basePose.pitch}°
                    </span>
                  </span>
                  <span>
                    ΔY:{' '}
                    <span
                      className={
                        Math.abs(realtimeStats.yaw - basePose.yaw) > YAW_THRESHOLD
                          ? 'text-orange-400'
                          : 'text-slate-300'
                      }
                    >
                      {realtimeStats.yaw - basePose.yaw > 0 ? '+' : ''}
                      {realtimeStats.yaw - basePose.yaw}°
                    </span>
                  </span>
                </div>
              ) : (
                <p className="text-slate-600">미설정</p>
              )}
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

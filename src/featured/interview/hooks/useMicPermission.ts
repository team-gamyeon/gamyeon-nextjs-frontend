import { useState, useRef, useEffect } from 'react'
import { type PermStatus } from '@/featured/interview/types'

export interface UseMicPermissionReturn {
  micStatus: PermStatus
  setMicStatus: React.Dispatch<React.SetStateAction<PermStatus>>
  // VuMeter에 전달할 실시간 음량 (0~1)
  audioLevel: number
  // 녹음 훅에서 사용할 마이크 스트림 ref
  micStreamRef: React.MutableRefObject<MediaStream | null>
  // 브라우저 마이크 권한 요청 및 AudioContext·AnalyserNode 초기화
  requestMic: () => Promise<void>
  // 마이크 스트림·오디오 컨텍스트 정리
  cleanupMic: () => void
}

export function useMicPermission(): UseMicPermissionReturn {
  const [micStatus, setMicStatus] = useState<PermStatus>('idle')
  const [audioLevel, setAudioLevel] = useState(0)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const levelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 마이크 허용 후 오디오 레벨 폴링 (80ms 간격)
  useEffect(() => {
    if (micStatus !== 'granted') return
    levelIntervalRef.current = setInterval(() => {
      if (!analyserRef.current) return
      const data = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      setAudioLevel(Math.min(1, avg / 60))
    }, 80)
    return () => {
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
    }
  }, [micStatus])

  // 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
      audioCtxRef.current?.close()
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const requestMic = async () => {
    setMicStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256
      ctx.createMediaStreamSource(stream).connect(analyser)
      setMicStatus('granted')
    } catch {
      setMicStatus('denied')
    }
  }

  const cleanupMic = () => {
    if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
    setAudioLevel(0)
  }

  return {
    micStatus,
    setMicStatus,
    audioLevel,
    micStreamRef,
    requestMic,
    cleanupMic,
  }
}

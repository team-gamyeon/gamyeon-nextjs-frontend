import { useState, useRef } from 'react'
import { type RecordingStatus } from '@/featured/interview/types'

export interface UseMicRecorderReturn {
  recordingStatus: RecordingStatus
  isPlaying: boolean
  recordedDuration: number
  playbackProgress: number
  startRecording: () => void
  stopRecording: () => void
  playRecording: () => void
  cleanupRecorder: () => void
}

export function useMicRecorder(
  micStreamRef: React.RefObject<MediaStream | null>,
): UseMicRecorderReturn {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedDuration, setRecordedDuration] = useState(0)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordedUrlRef = useRef<string | null>(null)
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null)
  const recordingStartTimeRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  const startRecording = () => {
    if (!micStreamRef.current) return
    recordedChunksRef.current = []
    const recorder = new MediaRecorder(micStreamRef.current)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
      if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
      recordedUrlRef.current = URL.createObjectURL(blob)
      setRecordedDuration(Math.round((Date.now() - recordingStartTimeRef.current) / 1000))
      setRecordingStatus('recorded')
    }
    recordingStartTimeRef.current = Date.now()
    recorder.start()
    setRecordingStatus('recording')
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  // requestAnimationFrame(60fps)으로 playbackProgress 업데이트
  const playRecording = () => {
    if (!recordedUrlRef.current || isPlaying) return
    playbackAudioRef.current?.pause()
    const audio = new Audio(recordedUrlRef.current)
    playbackAudioRef.current = audio

    const tick = () => {
      if (audio.duration) setPlaybackProgress(audio.currentTime / audio.duration)
      if (!audio.paused && !audio.ended) rafRef.current = requestAnimationFrame(tick)
    }
    audio.onplay = () => {
      rafRef.current = requestAnimationFrame(tick)
    }
    audio.onended = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setIsPlaying(false)
      setPlaybackProgress(0)
    }
    audio.play()
    setIsPlaying(true)
  }

  const cleanupRecorder = () => {
    if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
    recordedUrlRef.current = null
    playbackAudioRef.current?.pause()
    playbackAudioRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setRecordingStatus('idle')
    setRecordedDuration(0)
    setPlaybackProgress(0)
    setIsPlaying(false)
  }

  return {
    recordingStatus,
    isPlaying,
    recordedDuration,
    playbackProgress,
    startRecording,
    stopRecording,
    playRecording,
    cleanupRecorder,
  }
}

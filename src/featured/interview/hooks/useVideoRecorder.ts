import { useCallback, useRef } from 'react'

export function useVideoRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current

      if (!recorder) {
        reject(new Error('녹화가 실행중이지 않습니다.'))
        return
      }
      recorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: recorder.mimeType })
        chunksRef.current = []
        mediaRecorderRef.current = null
        resolve(videoBlob)
      }
      recorder.stop()
    })
  }, [])

  const startRecording = useCallback((stream: MediaStream) => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/mp4;codecs=h264,aac',
    ]
    const supportedType = types.find((type) => MediaRecorder.isTypeSupported(type))
    const options = supportedType ? supportedType : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType: options })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.start()
    mediaRecorderRef.current = recorder
  }, [])
  return {
    stopRecording,
    startRecording,
  }
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { type StepStatus } from '@/featured/interview/types'
import { useCameraModalHandler } from '@/featured/interview/hooks/useCameraModalHandler'
import { useMicPermission } from '@/featured/interview/hooks/useMicPermission'
import { useMicRecorder } from '@/featured/interview/hooks/useMicRecorder'
import { SetupSidebar } from '@/featured/interview/components/setup/SetupSidebar'
import { TitleStep } from '@/featured/interview/components/setup/TitleStep'
import { DocumentStep } from '@/featured/interview/components/setup/DocumentStep'
import { CameraStep } from '@/featured/interview/components/setup/CameraStep'
import { MicStep } from '@/featured/interview/components/setup/MicStep'
import type { useInterview } from '@/featured/interview/hooks/useInterview'

interface InterviewSetupModalProps {
  session: ReturnType<typeof useInterview>
}

export function InterviewSetupModal({ session }: InterviewSetupModalProps) {
  const [statuses, setStatuses] = useState<StepStatus[]>([
    'active',
    'pending',
    'pending',
    'pending',
  ])
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [portfolio, setPortfolio] = useState<File | null>(null)
  const [selfIntro, setSelfIntro] = useState<File | null>(null)

  const camera = useCameraModalHandler()
  const micPerm = useMicPermission()
  const micRec = useMicRecorder(micPerm.micStreamRef)

  const currentStep = statuses.findIndex((s) => s === 'active') + 1 || 5
  const doneCount = statuses.filter((s) => s === 'done').length
  const allDone = doneCount === 4

  const completeStep = (step: number) => {
    setStatuses((prev) => {
      const next = [...prev] as StepStatus[]
      next[step - 1] = 'done'
      if (step < 4) next[step] = 'active'
      return next
    })
  }

  const handleCameraConfirm = () => {
    camera.confirmCamera()
    completeStep(3)
  }

  const handleMicConfirm = () => {
    micPerm.cleanupMic()
    micRec.cleanupRecorder()
    completeStep(4)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TitleStep
            title={title}
            onChange={setTitle}
            onConfirm={() => {
              if (title.trim()) completeStep(1)
            }}
          />
        )
      case 2:
        return (
          <DocumentStep
            resume={resume}
            portfolio={portfolio}
            selfIntro={selfIntro}
            setResume={setResume}
            setPortfolio={setPortfolio}
            setSelfIntro={setSelfIntro}
            onComplete={() => completeStep(2)}
            onSkip={() => completeStep(2)}
          />
        )
      case 3:
        return (
          <CameraStep
            cameraStatus={camera.cameraStatus}
            cameraVideoRef={camera.cameraVideoRef}
            isLandmarkerReady={!!camera.landmarker}
            basePose={camera.basePose}
            alignProgress={camera.alignProgress}
            faceDetected={camera.faceDetected}
            onRequest={camera.requestCamera}
            onConfirm={handleCameraConfirm}
            onRetry={() => camera.setCameraStatus('idle')}
            onSkip={() => completeStep(3)}
          />
        )
      case 4:
        return (
          <MicStep
            micStatus={micPerm.micStatus}
            audioLevel={micPerm.audioLevel}
            onRequest={micPerm.requestMic}
            onConfirm={handleMicConfirm}
            onRetry={() => micPerm.setMicStatus('idle')}
            onSkip={() => completeStep(4)}
            recordingStatus={micRec.recordingStatus}
            isPlaying={micRec.isPlaying}
            recordedDuration={micRec.recordedDuration}
            playbackProgress={micRec.playbackProgress}
            onStartRecording={micRec.startRecording}
            onStopRecording={micRec.stopRecording}
            onPlayRecording={micRec.playRecording}
          />
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold">모든 설정이 완료되었습니다!</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">면접을 시작할 준비가 되었습니다.</p>
          </div>
        )
    }
  }

  return (
    <Dialog
      open={session.showSetup}
      onOpenChange={(isOpen) => {
        if (!isOpen) session.handleSetupCancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-7xl min-w-4xl overflow-hidden p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">면접 환경 설정</DialogTitle>
        <div className="flex min-h-155">
          <SetupSidebar statuses={statuses} doneCount={doneCount} />
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="border-border/50 flex items-center justify-between border-t px-8 py-4">
              <Button variant="ghost" size="sm" onClick={session.handleSetupCancel}>
                취소
              </Button>
              <Button
                disabled={!allDone || !camera.cameraStream}
                onClick={() => {
                  if (!camera.cameraStream) {
                    console.error('스트림이 아직 준비되지 않았습니다.')
                    return
                  }
                  session.handleSetupComplete({
                    title: title.trim() || '모의 면접',
                    basePose: camera.basePose,
                    stream: camera.cameraStream,
                  })
                }}
                className="gap-2"
              >
                면접 시작하기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

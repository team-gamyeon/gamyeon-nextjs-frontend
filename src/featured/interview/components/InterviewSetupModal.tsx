'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CameraStep } from '@/featured/interview/components/setup/CameraStep'
import { DocumentStep } from '@/featured/interview/components/setup/DocumentStep'
import { MicStep } from '@/featured/interview/components/setup/MicStep'
import { SetupSidebar } from '@/featured/interview/components/setup/SetupSidebar'
import { TitleStep } from '@/featured/interview/components/setup/TitleStep'
import { useCameraModalHandler } from '@/featured/interview/hooks/useCameraModalHandler'
import type { useInterview } from '@/featured/interview/hooks/useInterview'
import { useMicPermission } from '@/featured/interview/hooks/useMicPermission'
import { useMicRecorder } from '@/featured/interview/hooks/useMicRecorder'
import {
  createInterview,
  updateInterviewTitle,
} from '@/featured/interview/actions/interview.action'
import { type StepStatus } from '@/featured/interview/types'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'

interface InterviewSetupModalProps {
  session: ReturnType<typeof useInterview>
  isResume?: boolean
}

const RESUME_LOCKED_STEPS = new Set([1, 2])

export function InterviewSetupModal({ session, isResume = false }: InterviewSetupModalProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() =>
    isResume ? new Set([1, 2]) : new Set(),
  )
  const [currentStep, setCurrentStep] = useState(() => (isResume ? 3 : 1))
  const [maxReachedStep, setMaxReachedStep] = useState(() => (isResume ? 3 : 1))
  const [interviewId, setInterviewId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [portfolio, setPortfolio] = useState<File | null>(null)
  const [selfIntro, setSelfIntro] = useState<File | null>(null)

  const camera = useCameraModalHandler()
  const micPerm = useMicPermission()
  const micRec = useMicRecorder(micPerm.micStreamRef)

  const { cleanupCamera } = camera
  const { cleanupMic } = micPerm
  const cleanupSetupDevices = useCallback(() => {
    cleanupCamera()
    cleanupMic()
  }, [cleanupCamera, cleanupMic])

  const handleCancel = useCallback(() => {
    cleanupSetupDevices()
    session.handleSetupCancel()
  }, [cleanupSetupDevices, session])

  useEffect(() => {
    if (!session.showSetup) return

    const handleHistoryBack = () => {
      cleanupSetupDevices()
    }

    window.addEventListener('popstate', handleHistoryBack)
    return () => {
      window.removeEventListener('popstate', handleHistoryBack)
    }
  }, [cleanupSetupDevices, session.showSetup])

  const statuses: StepStatus[] = [1, 2, 3, 4].map((step) => {
    if (step === currentStep) return 'active'
    if (completedSteps.has(step)) return 'done'
    return 'pending'
  })

  const doneCount = completedSteps.size
  const allDone = doneCount === 4

  const completeStep = (step: number) => {
    const newCompleted = new Set([...completedSteps, step])
    setCompletedSteps(newCompleted)
    const nextStep = [1, 2, 3, 4].find((s) => !newCompleted.has(s))
    const dest = nextStep ?? 5
    setCurrentStep(dest)
    if (dest > maxReachedStep) setMaxReachedStep(dest)
  }

  const resetStep = (step: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.delete(step)
      return next
    })
  }

  const navigateToStep = (step: number) => {
    if (isResume && RESUME_LOCKED_STEPS.has(step)) return
    if (maxReachedStep >= 4 || completedSteps.has(step)) {
      setCurrentStep(step)
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (completedSteps.has(1)) resetStep(1)
  }

  const handleDocumentChange = (setter: (file: File | null) => void) => (file: File | null) => {
    setter(file)
    if (completedSteps.has(2)) resetStep(2)
  }

  const handleCameraConfirm = () => {
    camera.confirmCamera()
    completeStep(3)
  }

  const handleMicConfirm = () => {
    completeStep(4)
  }

  const handleTitleConfirm = async () => {
    try {
      if (interviewId) {
        await updateInterviewTitle(interviewId, title)
      } else {
        const result = await createInterview(title)
        if (result.data) setInterviewId(result.data.intvId)
      }
      completeStep(1)
    } catch {
      // handleResponse가 이미 toast.error() 처리 — redirect도 자동 전파
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TitleStep title={title} onChange={handleTitleChange} onConfirm={handleTitleConfirm} />
        )
      case 2:
        return (
          <DocumentStep
            resume={resume}
            portfolio={portfolio}
            selfIntro={selfIntro}
            setResume={handleDocumentChange(setResume)}
            setPortfolio={handleDocumentChange(setPortfolio)}
            setSelfIntro={handleDocumentChange(setSelfIntro)}
            onComplete={() => completeStep(2)}
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
            <h3 className="text-lg font-bold">모든 설정이 완료되었습니다.</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              면접을 시작할 준비가 완료되었습니다.
            </p>
          </div>
        )
    }
  }

  return (
    <Dialog
      open={session.showSetup}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-7xl min-w-4xl overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">면접 환경 설정</DialogTitle>
        <div className="flex min-h-155">
          <SetupSidebar
            statuses={statuses}
            doneCount={doneCount}
            onStepClick={navigateToStep}
            freeNavigation={maxReachedStep >= 4}
            lockedSteps={isResume ? RESUME_LOCKED_STEPS : undefined}
          />
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
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                취소
              </Button>
              <Button
                disabled={
                  !allDone || !camera.cameraStream || (!isResume && (!title.trim() || !resume))
                }
                onClick={() => {
                  if (!camera.cameraStream) {
                    console.error('카메라 스트림이 아직 준비되지 않았습니다.')
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

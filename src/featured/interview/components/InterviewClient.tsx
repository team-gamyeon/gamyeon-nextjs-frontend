'use client'

import { InterviewTopBar } from '@/featured/interview/components/InterviewTopBar'
import { QuestionBanner } from '@/featured/interview/components/QuestionBanner'
import { VideoArea } from '@/featured/interview/components/VideoArea'
import { TimerOverlay } from '@/featured/interview/components/TimerOverlay'
import { ReadyOverlay } from '@/featured/interview/components/ReadyOverlay'
import { FinishedOverlay } from '@/featured/interview/components/FinishedOverlay'
import { ControlBar } from '@/featured/interview/components/ControlBar'
import { EndDialog } from '@/featured/interview/components/EndDialog'
import { useInterviewSession } from '@/featured/interview/hooks/useInterviewSession'
import { InterviewSetupModal } from './InterviewSetupModal'

export function InterviewClient() {
  const session = useInterviewSession()

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <InterviewTopBar
        interviewTitle={session.interviewTitle}
        currentQuestion={session.currentQuestion}
        phase={session.phase}
        isActive={session.isActive}
        onEndClick={() => session.setShowEndDialog(true)}
      />

      <QuestionBanner
        currentQuestion={session.currentQuestion}
        isActive={session.isActive}
        typingKey={session.typingKey}
        questionRevealed={session.questionRevealed}
        onTypingComplete={() => session.setQuestionRevealed(true)}
      />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        <VideoArea
          cameraOn={session.cameraOn}
          micOn={session.micOn}
          phase={session.phase}
          basePose={session.basePose}
        />

        <TimerOverlay
          isActive={session.isActive}
          timeLeft={session.timeLeft}
          phase={session.phase}
          currentQuestion={session.currentQuestion}
          onStartAnswering={session.startAnswering}
          onNext={session.handleNext}
        />

        <ReadyOverlay phase={session.phase} onStart={session.startInterview} />

        <FinishedOverlay phase={session.phase} />
      </div>

      <ControlBar
        micOn={session.micOn}
        cameraOn={session.cameraOn}
        phase={session.phase}
        currentQuestion={session.currentQuestion}
        onToggleMic={() => session.setMicOn((v) => !v)}
        onToggleCamera={() => session.setCameraOn((v) => !v)}
        onStartInterview={session.startInterview}
        onStartAnswering={session.startAnswering}
        onNext={session.handleNext}
      />

      <EndDialog open={session.showEndDialog} onOpenChange={session.setShowEndDialog} />

      <InterviewSetupModal
        open={session.showSetup}
        onComplete={session.handleSetupComplete}
        onCancel={session.handleSetupCancel}
      />
    </div>
  )
}

import { ProcessBar } from '@/featured/interview/components/interview/ProcessBar'
import { QuestionBanner } from '@/featured/interview/components/interview/QuestionBanner'
import { VideoArea } from '@/featured/interview/components/interview/VideoArea'
import { TimerWidget } from '@/featured/interview/components/interview/TimerWidget'
import { FinishedOverlay } from '@/featured/interview/components/interview/FinishedOverlay'
import { ControlBar } from '@/featured/interview/components/interview/ControlBar'
import type { useInterview } from '@/featured/interview/hooks/useInterview'

interface InterviewPageProps {
  session: ReturnType<typeof useInterview>
  interviewId: number | null
}

export function InterviewContainer({ session, interviewId }: InterviewPageProps) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <ProcessBar
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
          stream={session.cameraStream}
        />
        <TimerWidget
          isActive={session.isActive}
          timeLeft={session.timeLeft}
          phase={session.phase}
        />
        <FinishedOverlay phase={session.phase} intvId={interviewId!} />
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
    </div>
  )
}

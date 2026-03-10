'use client'

import { EndDialogModal } from '@/featured/interview/components/EndDialogModal'
import { InterviewSetupModal } from '@/featured/interview/components/InterviewSetupModal'
import { InterviewContainer } from '@/featured/interview/components/InterviewContainer'
import { useInterview } from '@/featured/interview/hooks/useInterview'

export function InterviewLayout() {
  const session = useInterview()

  return (
    <>
      <InterviewContainer session={session} />
      <EndDialogModal session={session} />
      <InterviewSetupModal session={session} />
    </>
  )
}

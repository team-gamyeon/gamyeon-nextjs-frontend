'use client'

import { EndDialogModal } from '@/featured/interview/components/EndDialogModal'
import { InterviewSetupModal } from '@/featured/interview/components/InterviewSetupModal'
import { InterviewLayout } from '@/featured/interview/components/InterviewLayout'
import { useInterview } from '@/featured/interview/hooks/useInterview'

export function InterviewClient() {
  const session = useInterview()

  return (
    <>
      <InterviewLayout session={session} />
      <EndDialogModal session={session} />
      <InterviewSetupModal session={session} />
    </>
  )
}

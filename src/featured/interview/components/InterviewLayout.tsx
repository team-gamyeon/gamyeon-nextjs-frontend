'use client'

import { useSearchParams } from 'next/navigation'
import { EndDialogModal } from '@/featured/interview/components/EndDialogModal'
import { InterviewSetupModal } from '@/featured/interview/components/InterviewSetupModal'
import { InterviewContainer } from '@/featured/interview/components/InterviewContainer'
import { useInterview } from '@/featured/interview/hooks/useInterview'

export function InterviewLayout() {
  const session = useInterview()
  const searchParams = useSearchParams()
  const IntvId = searchParams.get('IntvId')
  const interviewId = IntvId ? parseInt(IntvId, 10) : null
  const isResume = searchParams.get('resume') === 'true'

  return (
    <>
      <InterviewContainer session={session} interviewId={interviewId} />
      <EndDialogModal session={session} />
      <InterviewSetupModal session={session} isResume={isResume} />
    </>
  )
}

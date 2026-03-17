import { Suspense } from 'react'
import { InterviewLayout } from '@/featured/interview/components/InterviewLayout'

export default function InterviewPage() {
  return (
    <Suspense>
      <InterviewLayout />
    </Suspense>
  )
}

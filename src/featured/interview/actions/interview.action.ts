'use server'

import { createInterviewService } from '@/featured/interview/services/interview.service'

export async function createInterviewAction(title: string) {
  const result = await createInterviewService(title)
  return result
}

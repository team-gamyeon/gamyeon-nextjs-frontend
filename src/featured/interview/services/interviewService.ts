'use server'

import { serverApi } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'

export async function createInterview(title: string) {
  const result = await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', { title })

  console.log('[interviewService] createInterview 요청:', { title })
  console.log('[interviewService] createInterview 응답:', JSON.stringify(result, null, 2))

  return result
}

export async function updateInterviewTitle(id: number, title: string) {
  const result = await serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })

  console.log('[interviewService] updateInterviewTitle 요청:', { id, title })
  console.log('[interviewService] updateInterviewTitle 응답:', JSON.stringify(result, null, 2))

  return result
}

'use server'

import { serverApi } from '@/shared/lib/api'
import type { ApiResponse } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'

export async function createInterview(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return serverApi.post<CreateInterviewResponse>('/api/v1/intvs', { title })
}

export async function updateInterviewTitle(
  id: number,
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })
}

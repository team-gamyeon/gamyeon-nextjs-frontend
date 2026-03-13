'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'
import { createInterview } from '@/featured/interview/services/interview.service'

export async function createInterviewAction(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return createInterview(title)
}

//
// export async function updateInterviewTitle(
//   id: number,
//   title: string,
// ): Promise<ApiResponse<CreateInterviewResponse>> {
//   return serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })
// }

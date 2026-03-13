'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'
import {
  createInterview,
  startInterview,
} from '@/featured/interview/services/interview.service'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function createInterviewAction(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return createInterview(title)
}

export async function startInterviewAction(
  intvId: number,
): Promise<ApiResponse<void>> {
  try {
    return await startInterview(intvId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

//
// export async function updateInterviewTitle(
//   id: number,
//   title: string,
// ): Promise<ApiResponse<CreateInterviewResponse>> {
//   return serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })
// }

'use server'

import type { ApiResponse } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'
import {
  createInterview,
  startInterview,
  pauseInterview,
  resumeInterview,
  finishInterview,
} from '@/featured/interview/services/interview.service'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// 면접 생성
export async function createInterviewAction(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return createInterview(title)
}

// 면접 시작
export async function startInterviewAction(intvId: number): Promise<ApiResponse<null>> {
  try {
    return await startInterview(intvId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

// 면접 중단
export async function pauseInterviewAction(intvId: number): Promise<ApiResponse<null>> {
  try {
    return await pauseInterview(intvId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

// 면접 재개
export async function resumeInterviewAction(intvId: number): Promise<ApiResponse<null>> {
  try {
    return await resumeInterview(intvId)
  } catch (error) {
    if (isRedirectError(error)) throw error
    throw error
  }
}

// 면접 완료
export async function finishInterviewAction(intvId: number): Promise<ApiResponse<null>> {
  try {
    return await finishInterview(intvId)
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

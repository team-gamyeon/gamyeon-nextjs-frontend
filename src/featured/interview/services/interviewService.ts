'use server'

import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function createInterview(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  try {
    return await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', {
      title,
    })
  } catch (error: any) {
    if (isRedirectError(error)) throw error
    return {
      success: false,
      data: null,
      message: error.message || '오류발생',
      code: error.code || '알 수 없는 에러',
      errors: error.errors || null,
    }
  }
}

export async function updateInterviewTitle(id: number, title: string) {
  try {
    const data = await serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
  }
}

'use server'

import { ApiResponse, ApiResult, serverApi } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'

export async function createInterview(title: string): Promise<ApiResult<CreateInterviewResponse>> {
  try {
    const res = await serverApi.post<ApiResponse<CreateInterviewResponse>>('/api/v1/intvs', {
      title,
    })
    return {
      success: true,
      data: res.data,
      message: res.message,
      code: res.code,
      errors: null,
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || '오류발생',
      code: error.code,
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

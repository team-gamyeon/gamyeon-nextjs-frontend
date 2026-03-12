'use server'

import { serverApi } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'

export async function createInterview(title: string) {
  try {
    const data = await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', { title })
    return { success: true as const, data }
  } catch (error) {
    return { success: false as const, message: (error as Error).message }
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

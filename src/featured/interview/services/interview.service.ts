import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'

export async function createInterview(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', {
    title,
  })
}

// 면접 시작
export async function startInterview(intvId: number): Promise<ApiResponse<null>> {
  return await serverApi.patch<null>(`/api/v1/intvs/${intvId}/start`)
}

// 면저 중단
export async function pauseInterview(intvId: number): Promise<ApiResponse<null>> {
  return await serverApi.patch<null>(`/api/v1/intvs/${intvId}/pause`)
}

// 면접 재개
export async function resumeInterview(intvId: number): Promise<ApiResponse<null>> {
  return await serverApi.patch<null>(`/api/v1/intvs/${intvId}/resume`)
}

// 면접 완료
export async function finishInterview(intvId: number): Promise<ApiResponse<null>> {
  return await serverApi.patch<null>(`/api/v1/intvs/${intvId}/finish`)
}

// export async function updateInterviewTitle(id: number, title: string) {
//   try {
//     const data = await serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })
//     return { success: true as const, data }
//   } catch (error) {
//     return { success: false as const, message: (error as Error).message }
//   }
// }

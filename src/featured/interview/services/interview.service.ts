import { ApiResponse, serverApi } from '@/shared/lib/api'
import type { CreateInterviewResponse } from '../types'

export async function createInterviewService(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', {
    title,
  })
}

// export async function updateInterviewTitle(id: number, title: string) {
//   try {
//     const data = await serverApi.patch<CreateInterviewResponse>(`/api/v1/intvs/${id}`, { title })
//     return { success: true as const, data }
//   } catch (error) {
//     return { success: false as const, message: (error as Error).message }
//   }
// }

import { ApiResponse, serverApi } from '@/shared/lib/api'
import {
  CompleteFileUploadResponse,
  CreateInterviewResponse,
  FileInfo,
  IssuePresignedUrlRequest,
  IssuePresignedUrlResponse,
  UpdateInterviewTitleResponse,
} from '../types'

export async function createInterview(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', {
    title,
  })
}

export async function updateInterviewTitle(
  id: number,
  title: string,
): Promise<ApiResponse<UpdateInterviewTitleResponse>> {
  const intvId = id
  return await serverApi.patch(`/api/v1/intvs/${intvId}`, {
    title,
  })
}

export async function issuePresignedUrl(
  resBody: IssuePresignedUrlRequest,
  id: number,
): Promise<ApiResponse<IssuePresignedUrlResponse>> {
  const { fileType, originalFileName, fileSizeBytes, contentType } = resBody
  const intvId = id
  return await serverApi.post(`/api/v1/preparations/${intvId}/files/presigned-url`, {
    fileType: fileType,
    originalFileName: originalFileName,
    fileSizeBytes: fileSizeBytes,
    contentType: contentType,
  })
}

export async function completeFileUpload(
  files: FileInfo[],
  id: number,
): Promise<ApiResponse<CompleteFileUploadResponse>> {
  const intvId = id
  return await serverApi.post(`/api/v1/preparation/${intvId}/files`, {
    files: files,
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

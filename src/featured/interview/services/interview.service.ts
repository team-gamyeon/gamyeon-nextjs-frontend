import { ApiResponse, serverApi } from '@/shared/lib/api'
import {
  completeFileUploadResponse,
  createInterviewResponse,
  issuePresignedUrlRequest,
  issuePresignedUrlResponse,
  updateInterviewTitleResponse,
} from '../types'

export async function createInterview(
  title: string,
): Promise<ApiResponse<createInterviewResponse>> {
  return await serverApi.post<createInterviewResponse>('/api/v1/intvs', {
    title,
  })
}

export async function updateInterviewTitle(
  id: number,
  title: string,
): Promise<ApiResponse<updateInterviewTitleResponse>> {
  const intvId = id
  return await serverApi.patch(`/api/v1/intvs/${intvId}`, {
    title,
  })
}

export async function issuePresignedUrl(
  resBody: issuePresignedUrlRequest,
  id: number,
): Promise<ApiResponse<issuePresignedUrlResponse>> {
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
  files: any[],
  id: number,
): Promise<ApiResponse<completeFileUploadResponse>> {
  const intvId = id
  return await serverApi.post(`/api/v1/preparation/${intvId}/files`, {
    files: files,
  })
}

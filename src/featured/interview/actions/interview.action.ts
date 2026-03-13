'use server'

import type { ApiResponse } from '@/shared/lib/api'
import {
  completeFileUploadResponse,
  createInterviewResponse,
  FileInfo,
  issuePresignedUrlRequest,
  issuePresignedUrlResponse,
  updateInterviewTitleResponse,
} from '../types'
import {
  completeFileUpload,
  createInterview,
  issuePresignedUrl,
  updateInterviewTitle,
} from '@/featured/interview/services/interview.service'
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
): Promise<ApiResponse<createInterviewResponse>> {
  return createInterview(title)
}

export async function updateInterviewTitleAction(
  id: number,
  title: string,
): Promise<ApiResponse<updateInterviewTitleResponse>> {
  return updateInterviewTitle(id, title)
}

export async function issuePresignedUrlAction(
  resBody: issuePresignedUrlRequest,
  id: number,
): Promise<ApiResponse<issuePresignedUrlResponse>> {
  return issuePresignedUrl(resBody, id)
}

export async function completeFileUploadAction(
  { files }: { files: FileInfo[] },
  id: number,
): Promise<ApiResponse<completeFileUploadResponse>> {
  if (!files || files.length === 0) {
    return {
      success: false,
      message: '업로드된 파일 정보가 없습니다.',
      code: '',
      data: null,
    }
  }
  return completeFileUpload(files, id)
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

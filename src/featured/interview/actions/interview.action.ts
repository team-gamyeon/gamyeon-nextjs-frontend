'use server'

import type { ApiResponse } from '@/shared/lib/api'
import {
  CompleteFileUploadResponse,
  CreateInterviewResponse,
  FileInfo,
  IssuePresignedUrlRequest,
  IssuePresignedUrlResponse,
  UpdateInterviewTitleResponse,
} from '../types'
import {
  completeFileUpload,
  createInterview,
  finishInterview,
  issuePresignedUrl,
  pauseInterview,
  resumeInterview,
  startInterview,
  updateInterviewTitle,
} from '@/featured/interview/services/interview.service'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// 면접 생성
export async function createInterviewAction(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return createInterview(title)
}

export async function updateInterviewTitleAction(
  id: number,
  title: string,
): Promise<ApiResponse<UpdateInterviewTitleResponse>> {
  return updateInterviewTitle(id, title)
}

export async function issuePresignedUrlAction(
  resBody: IssuePresignedUrlRequest,
  id: number,
): Promise<ApiResponse<IssuePresignedUrlResponse>> {
  return issuePresignedUrl(resBody, id)
}

export async function completeFileUploadAction(
  { files }: { files: FileInfo[] },
  id: number,
): Promise<ApiResponse<CompleteFileUploadResponse>> {
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


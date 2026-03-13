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

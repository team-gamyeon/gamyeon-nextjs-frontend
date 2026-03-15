import { ApiResponse, serverApi } from '@/shared/lib/api'
import {
  CompleteFileUploadResponse,
  CreateInterviewResponse,
  FileInfo,
  GetInterviewQuestionsResponse,
  IssuePresignedUrlRequest,
  IssuePresignedUrlResponse,
  UpdateInterviewTitleResponse,
} from '../types'

// 면접 생성(제목 추가)
export async function createInterview(
  title: string,
): Promise<ApiResponse<CreateInterviewResponse>> {
  return await serverApi.post<CreateInterviewResponse>('/api/v1/intvs', {
    title,
  })
}

// 면접 제목 수정
export async function updateInterviewTitle(
  intvId: number,
  title: string,
): Promise<ApiResponse<UpdateInterviewTitleResponse>> {
  return await serverApi.patch(`/api/v1/intvs/${intvId}`, {
    title,
  })
}

// 면접 문서 업로드 presignedUrl 발급
export async function issuePresignedUrl(
  intvId: number,
  resBody: IssuePresignedUrlRequest,
): Promise<ApiResponse<IssuePresignedUrlResponse>> {
  const { fileType, originalFileName, fileSizeBytes, contentType } = resBody
  return await serverApi.post(`/api/v1/preparations/${intvId}/files/presigned-url`, {
    fileType: fileType,
    originalFileName: originalFileName,
    fileSizeBytes: fileSizeBytes,
    contentType: contentType,
  })
}

// 면접 문서 업로드 완료
export async function completeFileUpload(
  intvId: number,
  files: FileInfo[],
): Promise<ApiResponse<CompleteFileUploadResponse>> {
  return await serverApi.post(`/api/v1/preparations/${intvId}/files`, {
    files: files,
  })
}

// 면접 질문 생성
export async function generateInterviewQuestion(intvId: number): Promise<ApiResponse<null>> {
  return await serverApi.post(`/api/v1/intvs/${intvId}/questions`)
}

// 면접 질문 조회
export async function getInterviewQuestions(
  intvId: number,
): Promise<ApiResponse<GetInterviewQuestionsResponse>> {
  return await serverApi.get(`/api/v1/intvs/${intvId}/questions`)
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

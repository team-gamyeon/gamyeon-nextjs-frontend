import type { InterviewFileType } from '@/featured/interview/types'

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

interface ValidationResult {
  valid: boolean
  message?: string
}

export function validateFileSize(
  fileType: InterviewFileType,
  fileSizeBytes: number,
): ValidationResult {
  if (fileType === 'RESUME' && fileSizeBytes > MAX_RESUME_SIZE_BYTES) {
    return { valid: false, message: '이력서는 5MB 이하만 가능합니다.' }
  }

  if (
    (fileType === 'PORTFOLIO' || fileType === 'COVER_LETTER') &&
    fileSizeBytes > MAX_ATTACHMENT_SIZE_BYTES
  ) {
    return { valid: false, message: '포트폴리오, 자기소개서는 10MB 이하만 가능합니다.' }
  }

  return { valid: true }
}

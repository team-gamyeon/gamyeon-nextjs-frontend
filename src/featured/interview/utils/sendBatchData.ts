import { InterviewBatchPayload } from '@/featured/interview/types'

export const sendInterviewBatch = async (payload: InterviewBatchPayload) => {
  try {
    const res = await fetch('백엔드 api', {
      method: 'POST',
    })
    console.log('[API 전송 완료]', payload)
    return true
  } catch (e) {
    console.log('[API 전송 실패]', e)
    return false
  }
}

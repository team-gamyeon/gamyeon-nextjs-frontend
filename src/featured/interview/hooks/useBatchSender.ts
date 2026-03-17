import { useCallback, useRef } from 'react'
import { InterviewBatchPayload } from '@/featured/interview/types'
import { calculateAverageConcentration } from '@/featured/interview/utils/visionUtils'
import { sendGazeStatsAction } from '@/featured/interview/actions/interview.action'

interface UseBatchSenderParams {
  intvId: number | null
  questionSetId: number | null
}
export function useBatchSender({ intvId, questionSetId }: UseBatchSenderParams) {
  const rawDataRef = useRef<InterviewBatchPayload['raw_data']>([])
  const eventsRef = useRef<InterviewBatchPayload['events']>([])
  const segmentSequenceRef = useRef(1)
  const lastBatchTimeRef = useRef(0)

  const handleSendBatch = useCallback(
    async (blinkCount: number) => {
      if (rawDataRef.current.length === 0) return
      if (intvId === null || questionSetId === null) return

      const averageConcentration = calculateAverageConcentration(rawDataRef.current)

      const payload: InterviewBatchPayload = {
        meta: {
          intvId: intvId,
          questionSetId: questionSetId,
          timestamp: Date.now(),
          segmentSequence: segmentSequenceRef.current,
        },
        metrics_summary: {
          average_concentration: averageConcentration,
          blink_count: blinkCount,
          is_away_detected: eventsRef.current.some((e) => e.type === 'AWAY_START'),
        },
        raw_data: [...rawDataRef.current],
        events: [...eventsRef.current],
      }

      const success = await sendGazeStatsAction(questionSetId, payload)
      if (success) {
        console.group(`[BATCH #${segmentSequenceRef.current}] 전송 성공`)
        console.log('Payload:', payload)
        console.log('Raw data:', payload.raw_data.length)
        console.groupEnd()

        rawDataRef.current = []
        eventsRef.current = []
        segmentSequenceRef.current += 1
        lastBatchTimeRef.current = performance.now()
      } else {
        console.error('전송 실패, 다음 배치에 합쳐서 전송')
      }
    },
    [intvId, questionSetId],
  )

  return {
    rawDataRef,
    eventsRef,
    lastBatchTimeRef,
    handleSendBatch,
  }
}

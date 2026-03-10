import { motion } from 'framer-motion'
import { RotateCw } from 'lucide-react'

export function PendingCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-yellow-100 p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <RotateCw className="h-8 w-8 text-yellow-600" />
        </motion.div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">AI 리포트 분석중...</h3>
      <p className="text-sm text-gray-500">
        면접 영상을 분석하고 있습니다.
        <br />
        잠시만 기다려주세요.
      </p>
      <div className="mt-6 flex gap-1">
        <motion.div
          className="h-2 w-2 rounded-full bg-yellow-500"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-yellow-500"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-yellow-500"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  )
}

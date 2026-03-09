import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardContainerProps {
  children: ReactNode
  isFlipped: boolean
  onFlip: () => void
}
export function CardContainer({
  children,
  isFlipped, // 뒤집힌 상태
  onFlip,
}: CardContainerProps) {
  return (
    <div
      onClick={onFlip}
      className="perspective-1000 group relative h-[380px] w-full cursor-pointer"
    >
      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 80, damping: 15 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="bg-primary/5 h-96 w-96 rounded-full blur-3xl sm:h-125 sm:w-125" />
      </div>

      <div className="mx-auto max-w-xl text-center">
        {/* 404 타이포그래피 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-primary/20 text-8xl font-black tracking-tighter sm:text-9xl">404</h1>
        </motion.div>

        {/* 텍스트 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">길을 잃으셨나요?</h2>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            요청하신 페이지가 사라졌거나 잘못된 경로로 접근하셨습니다.
            <br className="hidden sm:block" />
            AI 면접관이 있는 올바른 길로 다시 안내해 드릴게요.
          </p>
        </motion.div>

        {/* 버튼 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          {/* 메인으로 이동하기 (Primary Button) */}
          <Button size="lg" className="w-full gap-2 sm:w-auto" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              메인으로 이동하기
            </Link>
          </Button>

          {/* 이전 페이지로 가기 (Secondary/Outline Button) */}
          <Button
            variant="outline"
            size="lg"
            className="w-full cursor-pointer gap-2 sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            이전 페이지
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

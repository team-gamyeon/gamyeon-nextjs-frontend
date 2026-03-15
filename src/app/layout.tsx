import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { TooltipProvider } from '@/shared/ui/tooltip'
import ReactQueryProvider from '@/shared/lib/ReactQueryProvider'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '가면 | AI 가상 면접',
  description:
    'AI 기반 실전 면접 연습으로 합격을 준비하세요. 실시간 피드백과 맞춤형 분석으로 면접 실력을 한 단계 끌어올립니다.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ReactQueryProvider>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </ReactQueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

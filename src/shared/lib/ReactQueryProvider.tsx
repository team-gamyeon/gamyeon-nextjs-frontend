'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // queryClient를 useState로 감싸서 페이지 이동 시 인스턴스가 재생성되는 걸 방지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 전역 설정: 데이터가 상하면(stale) 1분 뒤에 새로고침 가능
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

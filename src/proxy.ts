import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/signin', '/terms', '/privacy']

/**
 * 보호 라우트 진입 게이트키퍼.
 * "복구 가능한 로그인 상태인가?" 만 판단한다.
 *
 * - refreshToken 없음 → /signin 리다이렉트 (복구 불가)
 * - refreshToken 있음 → 통과 (accessToken 만료 여부는 서버 계층에서 처리)
 *
 * 실제 accessToken 재발급은 serverApi(serverFetch)에서 수행한다.
 * proxy에서 매 네비게이션마다 refresh를 호출하면 race condition 및
 * 불필요한 네트워크 비용이 발생하므로 여기서는 하지 않는다.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const refreshToken = request.cookies.get('refreshToken')?.value

  // 로그인 상태에서 /signin 접근 시 대시보드로 이동
  if (pathname === '/signin' && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path)
  if (isPublic) return NextResponse.next()

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}

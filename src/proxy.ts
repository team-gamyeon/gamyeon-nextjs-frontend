import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/signin', '/terms', '/privacy']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path)
  if (isPublic) return NextResponse.next()

  const accessToken = request.cookies.get('accessToken')?.value
  if (accessToken) return NextResponse.next()

  // accessToken 없으면 refreshToken으로 재발급 시도
  const refreshToken = request.cookies.get('refreshToken')?.value
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
    const res = await fetch(`${apiUrl}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await res.json()
    if (!data.success || !data.data?.accessToken) {
      const redirect = NextResponse.redirect(new URL('/signin', request.url))
      redirect.cookies.delete('accessToken')
      redirect.cookies.delete('refreshToken')
      return redirect
    }

    const response = NextResponse.next()
    const isProd = process.env.NODE_ENV === 'production'

    response.cookies.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    })

    if (data.data.refreshToken) {
      response.cookies.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
      })
    }

    return response
  } catch {
    const redirect = NextResponse.redirect(new URL('/signin', request.url))
    redirect.cookies.delete('accessToken')
    redirect.cookies.delete('refreshToken')
    return redirect
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}

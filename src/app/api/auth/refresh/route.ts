import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/refresh
 * 클라이언트에서 401을 받았을 때 호출되는 토큰 갱신 Route Handler.
 * httpOnly 쿠키는 JS에서 직접 읽을 수 없으므로 서버를 경유해 refresh 처리.
 *
 * TODO: 백엔드 refresh 엔드포인트 확정 후 아래 주석 해제 및 구현
 */
export async function POST() {
  try {
    const cookieStore = await cookies()

    const refreshToken = cookieStore.get('refreshToken')?.value
    if (!refreshToken) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
    const res = await fetch(`${apiUrl}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      return NextResponse.json({ success: false }, { status: res.status })
    }

    const data = await res.json()
    if (!data.success || !data.data?.accessToken) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
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
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

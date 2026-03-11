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

    // TODO: 백엔드 refresh 엔드포인트 연동
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    //   method: 'POST',
    //   headers: {
    //     Cookie: cookieStore.toString(),
    //   },
    // })
    //
    // if (!res.ok) {
    //   return NextResponse.json({ success: false }, { status: res.status })
    // }
    //
    // // 백엔드가 내려준 새 쿠키를 클라이언트에 전달
    // const setCookie = res.headers.get('set-cookie')
    // const response = NextResponse.json({ success: true })
    // if (setCookie) {
    //   response.headers.set('set-cookie', setCookie)
    // }
    // return response

    void cookieStore // 사용 예정

    return NextResponse.json(
      { success: false, message: 'refresh 엔드포인트 미구현' },
      { status: 501 },
    )
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

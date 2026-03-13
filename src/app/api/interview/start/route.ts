import { NextRequest, NextResponse } from 'next/server'
import { startInterview } from '@/featured/interview/actions/interview.action'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function PATCH(request: NextRequest) {
  try {
    const { intvId } = await request.json()

    const res = await startInterview(intvId)

    return NextResponse.json(res)
  } catch (error: any) {
    if (isRedirectError(error)) throw error
    console.log('인터뷰 시작 실패:', error)
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        errors: error.errors,
      },
      {
        status: error.status || 400,
      },
    )
  }
}

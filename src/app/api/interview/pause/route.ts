import { NextRequest, NextResponse } from 'next/server'
import { serverApi } from '@/shared/lib/api'

export async function POST(request: NextRequest) {
  try {
    const { intvId } = await request.json()
    await serverApi.patch(`/api/v1/intvs/${intvId}/pause`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 400 },
    )
  }
}

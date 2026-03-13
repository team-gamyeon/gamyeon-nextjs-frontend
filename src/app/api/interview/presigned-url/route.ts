import { NextRequest, NextResponse } from 'next/server'
import { serverApi } from '@/shared/lib/api'

export async function POST(request: NextRequest) {
  try {
    const { intvId, fileName, fileType, fileSize } = await request.json()

    const res = await serverApi.post(`/api/v1/preparations/${intvId}/files/presigned-url`, {
      fileType: fileType,
      originalFileName: fileName,
      contentType: 'application/pdf',
      fileSizeBytes: fileSize,
    })

    return NextResponse.json(res)
  } catch (error: any) {
    console.log('Presigned URL 발급 실패:', error)
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

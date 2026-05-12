'use client'

import clarity from '@microsoft/clarity'
import { useEffect } from 'react'

export default function ClarityProvider() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    if (!projectId) return
    clarity.init(projectId)
  }, [])

  return null
}

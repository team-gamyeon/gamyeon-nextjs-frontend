import { Suspense } from 'react'
import { SigninForm } from '@/featured/auth/components/SigninForm'

export default function SigninPage() {
  return (
    <Suspense>
      <SigninForm />
    </Suspense>
  )
}

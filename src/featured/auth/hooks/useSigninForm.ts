'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/featured/auth/store'

export function useSigninForm() {
  const router = useRouter()
  const { signin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignin = (e: React.FormEvent) => {
    e.preventDefault()
    signin()
    router.push('/dashboard')
  }

  const handleSocialSignin = () => {
    signin()
    router.push('/dashboard')
  }

  return {
    showPassword,
    setShowPassword,
    email,
    setEmail,
    password,
    setPassword,
    handleSignin,
    handleSocialSignin,
  }
}

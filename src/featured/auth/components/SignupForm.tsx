'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react'
import { PasswordStrength } from '@/featured/auth/components/PasswordStrength'
import { useSignupForm } from '@/featured/auth/hooks/useSignupForm'

export function SignupForm() {
  const {
    showPassword,
    setShowPassword,
    formData,
    updateField,
    agreed,
    setAgreed,
    errors,
    setErrors,
    success,
    handleSubmit,
  } = useSignupForm()

  if (success) {
    return (
      <div className="bg-muted/20 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <Card className="border-border/50 shadow-primary/5 py-6 shadow-xl">
            <CardContent className="p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">가입 완료!</h2>
              <p className="text-muted-foreground mb-6">
                환영합니다! 이제 AI 면접 연습을 시작할 수 있습니다.
              </p>
              <Button className="w-full" size="lg" asChild>
                <Link href="/signin">로그인 페이지로 이동</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-muted/20 flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-4 text-center">
          <Link
            href="/dashboard"
            className="text-foreground flex items-center justify-center gap-0.5"
          >
            <Image
              src="/images/Gamyeon_Logo.png"
              alt="Gamyeon logo"
              width={1024}
              height={768}
              style={{ height: '44px', width: 'auto' }}
            />
          </Link>
        </div>

        <Card className="border-border/50 shadow-primary/5 py-6 shadow-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <h1 className="text-2xl font-bold">회원가입</h1>
            <p className="text-muted-foreground text-sm">무료로 가입하고 면접 연습을 시작하세요</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                className="w-full gap-2.5 bg-[#FEE500] font-medium text-[#3C1E1E] hover:bg-[#F0D900]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.617 5.076 4.077 6.54l-.977 3.642a.3.3 0 0 0 .44.327l4.217-2.79A12.2 12.2 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
                </svg>
                카카오
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs">
                또는 이메일로 가입
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="name"
                    placeholder="홍길동"
                    className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    className={`pr-10 pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs"
                  >
                    {errors.password}
                  </motion.p>
                )}
                <PasswordStrength password={formData.password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                  />
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked)
                      if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: '' }))
                    }}
                    className="border-border accent-primary mt-0.5 h-4 w-4 rounded"
                  />
                  <span className="text-muted-foreground">
                    <Link href="#" className="text-primary hover:underline">
                      이용약관
                    </Link>
                    {' 및 '}
                    <Link href="#" className="text-primary hover:underline">
                      개인정보 처리방침
                    </Link>
                    에 동의합니다.
                  </span>
                </label>
                {errors.agreed && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs"
                  >
                    {errors.agreed}
                  </motion.p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg">
                회원가입
              </Button>
            </form>

            <p className="text-muted-foreground text-center text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/signin" className="text-primary font-medium hover:underline">
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

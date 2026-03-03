'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    { label: '8자 이상', pass: password.length >= 8 },
    { label: '영문 포함', pass: /[a-zA-Z]/.test(password) },
    { label: '숫자 포함', pass: /\d/.test(password) },
    { label: '특수문자 포함', pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  const strength = checks.filter((c) => c.pass).length

  const getColor = () => {
    if (strength <= 1) return 'bg-destructive'
    if (strength <= 2) return 'bg-yellow-500'
    if (strength <= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getLabel = () => {
    if (strength <= 1) return '약함'
    if (strength <= 2) return '보통'
    if (strength <= 3) return '강함'
    return '매우 강함'
  }

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < strength ? getColor() : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <span className="text-muted-foreground text-xs">{getLabel()}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check) => (
          <div
            key={check.label}
            className="text-muted-foreground flex items-center gap-1.5 text-xs"
          >
            {check.pass ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="text-muted-foreground/50 h-3 w-3" />
            )}
            {check.label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

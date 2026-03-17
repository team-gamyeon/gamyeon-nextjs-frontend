import type { LucideIcon } from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export interface Step {
  step: string
  title: string
  description: string
}

export interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

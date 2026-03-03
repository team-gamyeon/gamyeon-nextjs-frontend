export interface User {
  name: string
  email: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
  signin: (user?: User) => void
  logout: () => void
}

export interface SigninFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

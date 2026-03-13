export interface User {
  id?: number
  email: string
  nickname: string
  name?: string
  avatar?: string
  provider?: string
  status?: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isLoggedIn: boolean
  signin: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
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

export interface OAuthLoginData {
  accessToken: string
  refreshToken: string
  user: User
}

/** @deprecated use OAuthLoginData */
export type GoogleLoginData = OAuthLoginData

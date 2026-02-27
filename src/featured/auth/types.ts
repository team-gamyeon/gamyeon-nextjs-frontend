export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user?: User) => void;
  logout: () => void;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

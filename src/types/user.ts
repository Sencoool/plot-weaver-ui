export interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export type RegisterDto = LoginDto & { name?: string };

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

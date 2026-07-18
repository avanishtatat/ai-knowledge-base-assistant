import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/api'
import type {
  AuthData,
  CurrentUserData,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth'

export async function login(credentials: LoginCredentials): Promise<AuthData> {
  const response = await apiClient.post<ApiResponse<AuthData>>(
    '/auth/login',
    credentials,
  )

  return response.data.data
}

export async function register(
  credentials: RegisterCredentials,
): Promise<AuthData> {
  const response = await apiClient.post<ApiResponse<AuthData>>(
    '/auth/register',
    credentials,
  )

  return response.data.data
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<CurrentUserData>>('/auth/me')

  return response.data.data.user
}

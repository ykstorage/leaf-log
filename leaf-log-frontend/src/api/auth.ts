import apiClient from './config'
import type { AuthResponse, RegisterDto, LoginDto, User } from '../types'

export const authApi = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async getMe(): Promise<{ user: User }> {
    const response = await apiClient.get<{ user: User }>('/auth/me')
    return response.data
  },
}

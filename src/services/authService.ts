import { apiService } from './api'
import { User, AuthResponse, LoginData, RegisterData } from '../types'

class AuthService {
  async login(credentials: LoginData): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials)
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', userData)
  }

  async getProfile(): Promise<User> {
    return apiService.get<User>('/auth/profile')
  }
}

export const authService = new AuthService()
// Type definitions for the application

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}

export interface AuthPayload {
  id: number
  email: string
  role: 'USER' | 'ADMIN' | 'DOCTOR' | 'NURSE'
}

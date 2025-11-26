import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import type { User, RegisterDto, LoginDto } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Initialize from localStorage
  function initializeAuth() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  async function register(data: RegisterDto) {
    try {
      loading.value = true
      error.value = null
      
      const response = await authApi.register(data)
      
      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || '회원가입에 실패했습니다'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(data: LoginDto) {
    try {
      loading.value = true
      error.value = null
      
      const response = await authApi.login(data)
      
      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || '로그인에 실패했습니다'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  async function fetchCurrentUser() {
    if (!token.value) return false

    try {
      loading.value = true
      error.value = null
      
      const response = await authApi.getMe()
      user.value = response.user
      
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || '사용자 정보를 가져오는데 실패했습니다'
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initializeAuth,
    register,
    login,
    logout,
    fetchCurrentUser,
  }
})

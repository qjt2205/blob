import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isAuthenticated = ref(false)
  const userEmail = ref('')

  // 计算属性
  const isAdmin = computed(() => isAuthenticated.value)

  // 动作
  const login = (email) => {
    isAuthenticated.value = true
    userEmail.value = email

    // 可选：持久化到 localStorage（用于页面刷新后保持状态）
    localStorage.setItem('blog_admin', 'true')
    localStorage.setItem('user_email', email)
  }

  const logout = () => {
    isAuthenticated.value = false
    userEmail.value = ''

    // 清除持久化数据
    localStorage.removeItem('blog_admin')
    localStorage.removeItem('user_email')
  }

  const checkAuthStatus = () => {
    const adminStatus = localStorage.getItem('blog_admin')
    const email = localStorage.getItem('user_email')

    if (adminStatus === 'true' && email) {
      isAuthenticated.value = true
      userEmail.value = email
    }
  }

  // 初始化时检查认证状态
  checkAuthStatus()

  return {
    // 状态
    isAuthenticated,
    userEmail,

    // 计算属性
    isAdmin,

    // 动作
    login,
    logout,
    checkAuthStatus
  }
})
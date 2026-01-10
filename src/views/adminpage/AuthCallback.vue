<template>
  <div class="auth-callback">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const message = ref('正在验证登录...')

onMounted(async () => {
  try {
    // 获取 session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    if (session) {
      // 登录成功，更新 Pinia store
      authStore.login(session.user.email)
      message.value = '登录成功！正在跳转...'
      
      setTimeout(() => {
        router.push('/editor')
      }, 1500)
    } else {
      // 没有 session
      message.value = '登录验证失败，正在跳转到登录页...'
      
      setTimeout(() => {
        router.push('/admin-login')
      }, 1500)
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    message.value = '登录验证失败，正在跳转到登录页...'
    
    setTimeout(() => {
      router.push('/admin-login')
    }, 1500)
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.loading-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #007bff;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  color: #333;
  font-size: 1rem;
}
</style>
<template>
  <div class="reset-password">
    <div class="reset-container">
      <h1 class="reset-title">重置密码</h1>
      
      <form @submit.prevent="handleResetPassword" class="reset-form">
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="请输入您的邮箱地址"
            class="form-input"
            required
          />
        </div>
        
        <button type="submit" class="reset-btn" :disabled="loading">
          {{ loading ? '发送中...' : '发送重置链接' }}
        </button>
      </form>
      
      <!-- 状态提示 -->
      <div v-if="message" class="message" :class="{ error: isError, success: !isError }">
        {{ message }}
      </div>
      
      <div class="reset-actions">
        <router-link to="/admin-login" class="back-link">返回登录</router-link>
        <router-link to="/change-password" class="change-link">修改密码</router-link>
      </div>
      
      <div class="reset-info">
        <p>重置链接将发送到您的邮箱，请检查收件箱（包括垃圾邮件）</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()

const email = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const handleResetPassword = async () => {
  // 重置消息
  message.value = ''
  isError.value = false
  
  // 验证输入
  if (!email.value) {
    message.value = '请输入邮箱地址'
    isError.value = true
    return
  }
  
  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    message.value = '请输入有效的邮箱地址'
    isError.value = true
    return
  }
  
  loading.value = true
  
  try {
    // 使用 Supabase 的 resetPasswordForEmail 方法
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`
    })
    
    if (error) {
      throw error
    }
    
    message.value = '重置链接已发送到您的邮箱，请检查收件箱'
    isError.value = false
    
    // 清空表单
    email.value = ''
    
  } catch (error) {
    console.error('发送重置链接失败:', error)
    
    if (error.message.includes('user not found')) {
      message.value = '该邮箱地址未注册'
    } else {
      message.value = '发送重置链接失败，请稍后重试'
    }
    
    isError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.reset-container {
  background: white;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.reset-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.reset-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.reset-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.reset-btn:hover:not(:disabled) {
  background: #0056b3;
}

.reset-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.message {
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  text-align: center;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.success {
  background: #d1edff;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.reset-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.back-link,
.change-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover,
.change-link:hover {
  text-decoration: underline;
}

.reset-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
  text-align: center;
}

.reset-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .reset-container {
    padding: 2rem 1.5rem;
  }
  
  .reset-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
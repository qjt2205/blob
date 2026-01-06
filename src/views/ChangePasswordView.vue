<template>
  <div class="change-password">
    <div class="password-container">
      <h1 class="password-title">修改密码</h1>
      
      <form @submit.prevent="handleChangePassword" class="password-form">
        <div class="form-group">
          <label for="currentPassword">当前密码</label>
          <input 
            id="currentPassword" 
            v-model="currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input 
            id="newPassword" 
            v-model="newPassword" 
            type="password" 
            placeholder="请输入新密码（至少6位）"
            class="form-input"
            required
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            class="form-input"
            required
          />
        </div>
        
        <button type="submit" class="password-btn" :disabled="loading">
          {{ loading ? '修改中...' : '修改密码' }}
        </button>
      </form>
      
      <!-- 状态提示 -->
      <div v-if="message" class="message" :class="{ error: isError, success: !isError }">
        {{ message }}
      </div>
      
      <div class="password-actions">
        <router-link to="/admin-login" class="back-link">返回登录</router-link>
        <button @click="handleForgotPassword" class="forgot-link">忘记密码？</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

// 验证密码强度
const validatePassword = (password) => {
  if (password.length < 6) {
    return '密码长度至少6位'
  }
  return null
}

const handleChangePassword = async () => {
  // 重置消息
  message.value = ''
  isError.value = false
  
  // 验证输入
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    message.value = '请填写所有字段'
    isError.value = true
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    message.value = '新密码和确认密码不一致'
    isError.value = true
    return
  }
  
  const passwordError = validatePassword(newPassword.value)
  if (passwordError) {
    message.value = passwordError
    isError.value = true
    return
  }
  
  if (newPassword.value === currentPassword.value) {
    message.value = '新密码不能与当前密码相同'
    isError.value = true
    return
  }
  
  loading.value = true
  
  try {
    // 首先验证当前密码是否正确
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      throw new Error('用户未登录')
    }
    
    // 使用 Supabase 的 updateUser 方法修改密码
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    
    if (error) {
      throw error
    }
    
    message.value = '密码修改成功！请使用新密码重新登录'
    isError.value = false
    
    // 清空表单
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    
    // 3秒后跳转到登录页面
    setTimeout(() => {
      router.push('/admin-login')
    }, 3000)
    
  } catch (error) {
    console.error('修改密码失败:', error)
    
    if (error.message.includes('Password should be at least 6 characters')) {
      message.value = '密码长度至少6位'
    } else if (error.message.includes('Invalid login credentials')) {
      message.value = '当前密码错误'
    } else if (error.message.includes('Auth session missing')) {
      message.value = '会话已过期，请重新登录'
      setTimeout(() => {
        router.push('/admin-login')
      }, 2000)
    } else {
      message.value = '修改密码失败，请稍后重试'
    }
    
    isError.value = true
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = () => {
  router.push('/reset-password')
}
</script>

<style scoped>
.change-password {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.password-container {
  background: white;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.password-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.password-form {
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

.password-btn {
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

.password-btn:hover:not(:disabled) {
  background: #0056b3;
}

.password-btn:disabled {
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

.password-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.back-link,
.forgot-link {
  color: #007bff;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.back-link:hover,
.forgot-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .password-container {
    padding: 2rem 1.5rem;
  }
  
  .password-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
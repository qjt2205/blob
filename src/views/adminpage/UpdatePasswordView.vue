<template>
  <div class="update-password">
    <div class="update-container">
      <h1 class="update-title">设置新密码</h1>
      
      <form @submit.prevent="handleUpdatePassword" class="update-form">
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
        
        <button type="submit" class="update-btn" :disabled="loading">
          {{ loading ? '更新中...' : '更新密码' }}
        </button>
      </form>
      
      <!-- 状态提示 -->
      <div v-if="message" class="message" :class="{ error: isError, success: !isError }">
        {{ message }}
      </div>
      
      <div class="update-actions">
        <router-link to="/admin-login" class="back-link">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

// 检查是否在密码重置流程中
onMounted(async () => {
  try {
    // 检查当前会话状态
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      message.value = '链接已过期或无效，请重新申请重置密码'
      isError.value = true
    }
  } catch (error) {
    console.error('检查会话失败:', error)
    message.value = '链接验证失败，请重新申请重置密码'
    isError.value = true
  }
})

// 验证密码强度
const validatePassword = (password) => {
  if (password.length < 6) {
    return '密码长度至少6位'
  }
  return null
}

const handleUpdatePassword = async () => {
  // 重置消息
  message.value = ''
  isError.value = false
  
  // 验证输入
  if (!newPassword.value || !confirmPassword.value) {
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
  
  loading.value = true
  
  try {
    // 使用 Supabase 的 updateUser 方法更新密码
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    
    if (error) {
      throw error
    }
    
    message.value = '密码更新成功！请使用新密码登录'
    isError.value = false
    
    // 清空表单
    newPassword.value = ''
    confirmPassword.value = ''
    
    // 3秒后跳转到登录页面
    setTimeout(() => {
      router.push('/admin-login')
    }, 3000)
    
  } catch (error) {
    console.error('更新密码失败:', error)
    
    if (error.message.includes('Password should be at least 6 characters')) {
      message.value = '密码长度至少6位'
    } else if (error.message.includes('Auth session missing')) {
      message.value = '会话已过期，请重新申请重置密码'
      setTimeout(() => {
        router.push('/reset-password')
      }, 2000)
    } else {
      message.value = '更新密码失败，请稍后重试'
    }
    
    isError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.update-password {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.update-container {
  background: white;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.update-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.update-form {
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

.update-btn {
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

.update-btn:hover:not(:disabled) {
  background: #0056b3;
}

.update-btn:disabled {
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

.update-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.back-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .update-container {
    padding: 2rem 1.5rem;
  }
}
</style>
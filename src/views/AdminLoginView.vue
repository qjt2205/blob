<template>
  <div class="admin-login">
    <div class="login-container">
      <h1 class="login-title">管理员登录</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="请输入管理员邮箱"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            class="form-input"
            required
          />
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <!-- 状态提示 -->
      <div v-if="message" class="message" :class="{ error: isError }">
        {{ message }}
      </div>
      
      <div class="login-hint">
        <p>如果您还没有账户，需要在 Supabase 控制台中创建用户</p>
        <p>前往 Supabase → Authentication → Users → Add User</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithEmail } from '@/config/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    showMessage('请输入邮箱和密码', true)
    return
  }

  try {
    loading.value = true
    const { data, error } = await loginWithEmail(email.value, password.value)
    
    if (error) throw error
    
    // 登录成功
    localStorage.setItem('blog_admin', 'true')
    localStorage.setItem('user_email', data.user.email)
    
    showMessage('登录成功！正在跳转...', false)
    
    setTimeout(() => {
      router.push('/editor')
    }, 1000)
    
  } catch (error) {
    console.error('Login error:', error)
    showMessage(error.message || '登录失败，请检查邮箱和密码', true)
  } finally {
    loading.value = false
  }
}

const showMessage = (msg, error) => {
  message.value = msg
  isError.value = error
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-container {
  background: white;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.login-form {
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

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #0056b3;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  padding: 0.75rem;
  border-radius: 0.375rem;
  text-align: center;
  margin-top: 1rem;
}

.message.error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.message:not(.error) {
  background: #eff;
  color: #33c;
  border: 1px solid #cce;
}

.login-hint {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: #666;
}

.login-hint p {
  margin: 0.5rem 0;
}
</style>
<template>
  <div class="admin-login">
    <div class="admin-part admin-left">
       <div class="tip">
        <h3>生活的全部意义在于无穷地探索尚未知道的东西，在于不断地增加更多的知识。</h3>
        <small>—— 左拉</small>
       </div>
    </div>
    <div class="admin-part admin-right">

      <div class="login-container">
        <h1 class="login-title">时光小筑后台管理</h1>
        <n-form ref="formRef" :model="{ email, password }" :rules="rules" @submit.prevent="handleLogin" class="login-form">
          <n-form-item label="邮箱" path="email" required>
             <n-input
               v-model:value="email"
               type="email"
               placeholder="请输入管理员邮箱"
               class="form-input"
               :disabled="loading"
             />
           </n-form-item>

           <n-form-item label="密码" path="password" required>
             <n-input
               v-model:value="password"
               type="password"
               placeholder="请输入密码"
               class="form-input"
               :disabled="loading"
               show-password-on="mousedown"
             />
           </n-form-item>

          <n-button 
            type="primary" 
            attr-type="submit" 
            class="login-btn" 
            :loading="loading"
            :disabled="loading"
            block
          >
            {{ loading ? '登录中' : '登录' }}
          </n-button>
        </n-form>

        <div class="login-actions">
          <router-link to="/change-password" class="change-link">修改密码</router-link>
          <router-link to="/reset-password" class="forgot-link">忘记密码？</router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithEmail } from '@/config/supabase'
import { createDiscreteApi } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const { message } = createDiscreteApi(
  ['message'],
  {
    messageProviderProps: {
      placement: 'top'
    }
  }
)

// 表单验证规则
const formRef = ref(null)
const rules = {
  email: [
    {
      required: true,
      message: '请输入邮箱地址',
      trigger: ['input', 'blur']
    },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['input', 'blur']
    },
    {
      min: 6,
      message: '密码长度不能少于6位',
      trigger: ['input', 'blur']
    }
  ]
}

const handleLogin = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()
    
    loading.value = true
    const { data, error } = await loginWithEmail(email.value, password.value)

    if (error) throw error

    // 登录成功，更新 Pinia store
    authStore.login(data.user.email)

    message.success('登录成功！正在跳转...')

    setTimeout(() => {
      router.push('/editor')
    }, 1000)

  } catch (error) {
    if (error.errors) {
      // 表单验证错误
      message.error('请检查表单输入')
    } else {
      message.error(error.message || '登录失败，请检查邮箱和密码')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-login {
  height: 100vh;
  display: flex;
  background: #ffffff;

  .admin-part {
    flex: 1;
  }

  .admin-left {
    position: relative;
    background: url('@/assets/img/back.jpg') no-repeat center center;
    background-size: cover;

    .tip {
      position: absolute;
      bottom: 4%;
      width: 100%;
      padding: 0 3rem;
      color: #fff;
      text-align: center;
      font-size: 1.8rem;

      small {
        display: block;
        margin-top: 2rem;
        text-align: right;
        font-size: 1.8rem;
      }
    }
  }

  .admin-right {
    position: relative;

    .login-container {
      padding-top: 20rem;
      width: 40rem;
      margin: 0 auto;
      
      .login-title {
        font-size: 4rem;
        color: var(--color-primary);
        text-align: center;
      }

      .login-form {
        margin-top: 4rem;
      }

      .login-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }
    }
  }
}

/* .admin-login {
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

.login-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.change-link,
.forgot-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
}

.change-link:hover,
.forgot-link:hover {
  text-decoration: underline;
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
} */
</style>

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import naive from 'naive-ui'

// 引入全局样式
import './assets/styles/main.scss'

// 引入 Supabase 初始化
import { supabase } from '@/config/supabase'

const app = createApp(App)

// 初始化 Supabase session
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    // 设置登录状态
    localStorage.setItem('blog_admin', 'true')
  }
})

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event)
  
  if (event === 'SIGNED_IN') {
    localStorage.setItem('blog_admin', 'true')
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('blog_admin')
  }
})

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')

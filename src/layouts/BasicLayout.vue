<template>
  <div class="basic-layout">
    <!-- 简约顶部导航 -->
    <header class="site-header">
      <div class="container">
        <nav class="nav">
          <router-link to="/" class="site-title">
            <span class="title-text">文艺小筑</span>
            <span class="title-sub">Artisan's Corner</span>
          </router-link>
          
          <div class="nav-links">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/articles" class="nav-link">文章</router-link>
            <router-link to="/about" class="nav-link">关于</router-link>
            <router-link to="/archive" class="nav-link">归档</router-link>
            
            <!-- 管理员菜单 -->
            <div v-if="isAdmin" class="admin-menu">
              <router-link to="/editor" class="nav-link">写文章</router-link>
              <button @click="handleLogout" class="nav-link logout-btn">登出</button>
            </div>
            <router-link v-else to="/admin-login" class="nav-link">登录</router-link>
          </div>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- 文艺风格的页脚 -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-text">
            <p>© {{ new Date().getFullYear() }} 文艺小筑</p>
            <p class="footer-quote">「生活不在别处，当下即是全部」</p>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">GitHub</a>
            <a href="#" class="footer-link">Twitter</a>
            <a href="#" class="footer-link">RSS</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout, checkAuth } from '@/config/supabase'

const router = useRouter()
const isAdmin = ref(false)

// 检查登录状态
const checkAdminStatus = async () => {
  isAdmin.value = await checkAuth()
}

// 处理登出
const handleLogout = async () => {
  try {
    await logout()
    localStorage.removeItem('blog_admin')
    isAdmin.value = false
    router.push('/')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 监听认证状态变化
const setupAuthListener = () => {
  import('@/config/supabase').then(({ supabase }) => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        isAdmin.value = true
      } else if (event === 'SIGNED_OUT') {
        isAdmin.value = false
      }
    })
  })
}

onMounted(async () => {
  await checkAdminStatus()
  setupAuthListener()
})

onUnmounted(() => {
  // 清理监听器
})
</script>

<style scoped lang="scss">
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.site-title {
  display: flex;
  flex-direction: column;
  
  .title-text {
    font-size: 24px;
    font-weight: 500;
    letter-spacing: 2px;
    line-height: normal;
  }
  
  .title-sub {
    font-size: 12px;
    color: var(--color-text-lighter);
    font-family: var(--font-sans);
    letter-spacing: 1px;
  }
}

.nav-links {
  display: flex;
  gap: 15px;
  align-items: center;
}

.nav-link {
  font-size: 1rem;
  position: relative;
  padding: var(--space-xs) 0;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  
  &.router-link-active {
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--color-primary);
      transform: scaleX(1);
    }
  }
}

.logout-btn {
  color: var(--color-error);
  
  &:hover {
    color: var(--color-primary);
  }
}

.admin-menu {
  display: flex;
  gap: 15px;
  align-items: center;
  
  &::before {
    content: '|';
    color: var(--color-border);
    margin-right: 5px;
  }
}

.main-content {
  flex: 1;
  padding: var(--space-xxl) 0;
}

.site-footer {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-text {
  p {
    margin-bottom: var(--space-xs);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.footer-quote {
  font-style: italic;
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: var(--space-lg);
}

.footer-link {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--color-text-light);
}
</style>
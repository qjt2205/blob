<template>
  <div class="basic-layout">
    <!-- 简约顶部导航 -->
    <header class="site-header">
      <div class="container">
        <nav class="nav">
          <router-link to="/" class="site-title">
            <span class="title-text">时光小筑🐖</span>
            <span class="title-sub">Artisan's Corner</span>
          </router-link>
          
          <div class="nav-links">
            <router-link to="/" class="nav-link" exact-active-class="router-link-active">首页</router-link>
            <router-link to="/articles" class="nav-link" exact-active-class="router-link-active">文章</router-link>
            <router-link to="/about" class="nav-link" exact-active-class="router-link-active">关于</router-link>
            <router-link to="/archive" class="nav-link" exact-active-class="router-link-active">归档</router-link>
            <router-link v-if="isAdmin" to="/editor" class="nav-link" exact-active-class="router-link-active">写文章</router-link>
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
            <p>© {{ new Date().getFullYear() }} 时光小筑</p>
            <p class="footer-quote">字里行间 · 保持记录，保持思考</p>
          </div>
          <!-- <div class="footer-links">
            <a href="#" class="footer-link">GitHub</a>
            <a href="#" class="footer-link">Twitter</a>
            <a href="#" class="footer-link">RSS</a>
          </div> -->
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

// 使用 Pinia store 管理登录状态
const authStore = useAuthStore()
const isAdmin = authStore.isAdmin
</script>

<style scoped lang="scss">
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  padding: .8rem 0;
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.4rem;
}

.site-title {
  display: flex;
  flex-direction: column;
  
  .title-text {
    font-size: 2.4rem;
    font-weight: 500;
    letter-spacing: 2px;
    line-height: normal;
  }
  
  .title-sub {
    font-size: 1.2rem;
    color: var(--color-text-lighter);
    font-family: var(--font-sans);
    letter-spacing: 1px;
  }
}

.nav-links {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.nav-link {
  font-size: 1.6rem;
  padding: .5rem 0;
  position: relative;
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



.main-content {
  flex: 1;
  padding: 4rem 0;
}

.site-footer {
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);
}


</style>
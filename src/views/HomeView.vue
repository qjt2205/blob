<template>
  <div class="home-view">
    <!-- 文艺风格的英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          时光的<br>
          文艺笔记
        </h1>
        <p class="hero-subtitle">
          记录生活点滴，分享思考感悟，在平凡中发现美
        </p>
        <div class="hero-actions">
          <router-link to="/articles" class="btn btn-primary">
            阅读文章
          </router-link>
          <router-link to="/about" class="btn btn-outline">
            关于我
          </router-link>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="decoration-line"></div>
        <div class="decoration-dot"></div>
      </div>
    </section>

    <!-- 精选文章 -->
    <section class="featured-section">
      <h2 class="section-title">
        <span class="title-number">01</span>
        近期文章
      </h2>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载文章...</p>
      </div>
      
      <!-- 文章列表 -->
      <div v-else class="articles-grid">
        <div v-if="featuredArticles.length === 0" class="empty-state">
          <p>暂无文章，去写一篇吧！</p>
        </div>
        
        <div class="article-card" v-for="article in featuredArticles" :key="article.id">
          <router-link :to="`/articles/${article.id}`" class="article-link">
            <div class="article-meta">
              <span class="article-date">{{ formatDate(article.created_at) }}</span>
              <span class="article-tag">{{ article.tag || '随笔' }}</span>
            </div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.excerpt || article.content.substring(0, 100) + '...' }}</p>
            <div class="article-readmore">
              阅读全文
              <span class="arrow">→</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArticles } from '@/services/api'

const featuredArticles = ref([])
const loading = ref(true)

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// 获取最近文章
const fetchFeaturedArticles = async () => {
  try {
    loading.value = true
    const articles = await getArticles()
    // 只取最新的3篇文章
    featuredArticles.value = articles.slice(0, 3)
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFeaturedArticles()
})
</script>

<style scoped lang="scss">
.home-view {
  padding-top: var(--space-xxl);
}

.hero-section {
  position: relative;
  margin-bottom: var(--space-xxl);
  padding-bottom: var(--space-xxl);
  border-bottom: 1px solid var(--color-border);
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: var(--space-lg);
  
  &::after {
    display: none;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-light);
  margin-bottom: var(--space-xl);
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
}

.btn {
  padding: 4px 30px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &-primary {
    background-color: var(--color-primary);
    color: white;
    
    &:hover {
      background-color: var(--color-text);
      transform: translateY(-2px);
    }
  }
  
  &-outline {
    border-color: var(--color-border);
    background: transparent;
    
    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-2px);
    }
  }
}

.hero-decoration {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 200px;
  
  .decoration-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 1px;
    background: var(--color-border);
    transform: rotate(45deg);
  }
  
  .decoration-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

.featured-section {
  margin-top: var(--space-xxl);
}

.section-title {
  font-size: 1.75rem;
  margin-bottom: var(--space-xl);
  
  .title-number {
    color: var(--color-primary);
    margin-right: var(--space-sm);
    font-family: var(--font-mono);
    font-size: 1rem;
    opacity: 0.6;
  }
}

.loading-container {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  margin: 0 auto var(--space-md);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-text-light);
  grid-column: 1 / -1;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.article-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }
}

.article-link {
  display: block;
  
  &::after {
    display: none;
  }
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-family: var(--font-sans);
  font-size: 0.875rem;
}

.article-date {
  color: var(--color-text-lighter);
}

.article-tag {
  background: var(--color-bg-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
}

.article-title {
  font-size: 18px;
  margin-bottom: var(--space-md);
  
  &::after {
    display: none;
  }
}

.article-excerpt {
  color: var(--color-text-light);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: var(--space-lg);
}

.article-readmore {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-primary);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  
  .arrow {
    transition: transform 0.3s ease;
  }
  
  &:hover .arrow {
    transform: translateX(4px);
  }
}
</style>
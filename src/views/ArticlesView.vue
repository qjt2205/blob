<template>
  <div class="articles-view">
    <div class="page-header">
      <h1 class="page-title">所有文章</h1>
      <p class="page-description">
        在这里，你可以找到所有的文章<br>
        按主题分类，慢慢阅读
      </p>
      <div v-if="isAdmin" class="admin-actions">
        <router-link to="/editor" class="admin-link">写文章</router-link>
      </div>
    </div>

    <div class="filters">
      <button 
        v-for="tag in tags" 
        :key="tag"
        :class="['filter-btn', { active: activeTag === tag }]"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>

    <!-- 文章列表 -->
    <div class="articles-list" v-else>
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <p>暂无文章</p>
      </div>
      
      <div class="article-item" v-for="article in filteredArticles" :key="article.id">
        <div class="article-item-content">
          <router-link :to="`/articles/${article.id}`" class="article-item-title">
            {{ article.title }}
          </router-link>
          <p class="article-item-excerpt">{{ article.excerpt }}</p>
          <div class="article-item-meta">
            <span class="date">{{ formatDate(article.created_at) }}</span>
            <span class="read-time">{{ article.read_time || '5分钟阅读' }}</span>
            <span class="tag">{{ article.tag || '随笔' }}</span>
          </div>
        </div>
        <div class="article-item-decoration">
          <div class="decoration-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getArticles, getArticlesByTag } from '@/services/api'

const activeTag = ref(null)
const isAdmin = ref(false)
const loading = ref(true)
const articles = ref([])

const tags = ['全部', '随笔', '思考', '观察', '技术', '阅读']

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// 获取所有文章
const fetchArticles = async () => {
  try {
    loading.value = true
    articles.value = await getArticles()
  } catch (error) {
    console.error('获取文章失败:', error)
    // 可以添加错误提示
  } finally {
    loading.value = false
  }
}

// 根据标签获取文章
const fetchArticlesByTag = async (tag) => {
  try {
    loading.value = true
    articles.value = await getArticlesByTag(tag)
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

const filteredArticles = computed(() => {
  // 前端过滤，如果需要的话
  if (!activeTag.value || activeTag.value === '全部') {
    return articles.value
  }
  return articles.value.filter(article => article.tag === activeTag.value)
})

const toggleTag = (tag) => {
  if (activeTag.value === tag) {
    activeTag.value = null
    fetchArticles()
  } else {
    activeTag.value = tag
    if (tag === '全部') {
      fetchArticles()
    } else {
      fetchArticlesByTag(tag)
    }
  }
}

onMounted(() => {
  isAdmin.value = localStorage.getItem('blog_admin') === 'true'
  fetchArticles()
})
</script>

<style scoped lang="scss">
.articles-view {
  padding-top: var(--space-xxl);
}

.page-header {
  text-align: center;
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--color-border);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
  
  &::after {
    margin: var(--space-md) auto 0;
  }
}

.page-description {
  color: var(--color-text-light);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 0;
}

.admin-actions {
  margin-top: var(--space-lg);
}

.admin-link {
  display: inline-block;
  padding: 4px 30px;
  background: var(--color-primary);
  color: white;
  border-radius: 2px;
  font-family: var(--font-sans);
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-text);
    transform: translateY(-2px);
  }
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--color-border);
}

.filter-btn {
  padding: 4px 30px;
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: 2px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--color-primary);
    color: #fff;
    background: var(--color-primary)
  }
  
  &.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }
}

.loading-container {
  text-align: center;
  padding: var(--space-xxl) 0;
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
  padding: var(--space-xxl) 0;
  color: var(--color-text-light);
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.article-item {
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.5rem;
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
  }
}

.article-item-content {
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.article-item-title {
  display: block;
  font-size: 1.5rem;
  margin-bottom: var(--space-md);
  
  &:hover {
    color: var(--color-primary);
  }
}

.article-item-excerpt {
  color: var(--color-text-light);
  margin-bottom: var(--space-md);
  line-height: 1.7;
}

.article-item-meta {
  display: flex;
  gap: var(--space-lg);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-text-lighter);
  
  .tag {
    background: var(--color-bg-secondary);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--color-primary);
  }
}

.article-item-decoration {
  position: absolute;
  left: 3px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
  z-index: -1;
}
</style>
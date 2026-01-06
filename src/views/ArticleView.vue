<template>
  <div class="article-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-content-wrapper">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="date">{{ formatDate(article.created_at) }}</span>
          <span class="read-time">{{ article.read_time || '5分钟阅读' }}</span>
          <span class="tag">{{ article.tag || '随笔' }}</span>
        </div>
      </div>

      <div class="article-content">
        <div class="content-text">{{ article.content }}</div>
      </div>

      <div class="article-navigation">
        <router-link v-if="prevArticle" :to="`/articles/${prevArticle.id}`" class="nav-link prev">
          <span class="nav-label">上一篇</span>
          <span class="nav-title">{{ prevArticle.title }}</span>
        </router-link>
        
        <router-link to="/articles" class="back-link">返回文章列表</router-link>
        
        <router-link v-if="nextArticle" :to="`/articles/${nextArticle.id}`" class="nav-link next">
          <span class="nav-label">下一篇</span>
          <span class="nav-title">{{ nextArticle.title }}</span>
        </router-link>
      </div>
    </div>

    <!-- 文章不存在 -->
    <div v-else class="not-found">
      <h2>文章不存在</h2>
      <p>抱歉，您访问的文章可能已被删除或不存在。</p>
      <router-link to="/articles" class="back-link">返回文章列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleById, getArticles } from '@/services/api'

const route = useRoute()
const articleId = parseInt(route.params.id)
const article = ref(null)
const loading = ref(true)
const allArticles = ref([])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取当前文章
const fetchArticle = async () => {
  try {
    loading.value = true
    const data = await getArticleById(articleId)
    article.value = data
  } catch (error) {
    console.error('获取文章失败:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

// 获取所有文章用于导航
const fetchAllArticles = async () => {
  try {
    allArticles.value = await getArticles()
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 上一篇
const prevArticle = computed(() => {
  if (!allArticles.value.length || !article.value) return null
  
  const currentIndex = allArticles.value.findIndex(a => a.id === article.value.id)
  return currentIndex > 0 ? allArticles.value[currentIndex - 1] : null
})

// 下一篇
const nextArticle = computed(() => {
  if (!allArticles.value.length || !article.value) return null
  
  const currentIndex = allArticles.value.findIndex(a => a.id === article.value.id)
  return currentIndex < allArticles.value.length - 1 ? allArticles.value[currentIndex + 1] : null
})

onMounted(async () => {
  await Promise.all([fetchArticle(), fetchAllArticles()])
})
</script>

<style scoped>
.article-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #3498db;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.article-header {
  text-align: center;
  margin-bottom: 3rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.article-meta span {
  padding: 0.25rem 0.75rem;
  background: #f8f9fa;
  border-radius: 1rem;
}

.article-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 4rem;
}

.content-text {
  white-space: pre-line;
}

.content-text p {
  margin-bottom: 1.5rem;
}

.article-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.nav-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #3498db;
  max-width: 200px;
}

.nav-link.prev {
  text-align: left;
}

.nav-link.next {
  text-align: right;
}

.nav-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.nav-title {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.3;
}

.back-link {
  color: #7f8c8d;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.back-link:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.not-found {
  text-align: center;
  padding: 4rem 0;
}

.not-found h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.not-found p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .article-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-link {
    max-width: none;
    width: 100%;
  }
}
</style>
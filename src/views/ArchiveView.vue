<template>
  <div class="archive-view">
    <div class="page-header">
      <h1 class="page-title">归档</h1>
      <p class="page-description">时光的足迹，按时间排列</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载归档数据...</p>
    </div>

    <div v-else class="archive-timeline">
      <div v-if="archiveData.length === 0" class="empty-state">
        <p>暂无文章归档</p>
      </div>
      
      <div class="timeline-year" v-for="year in archiveData" :key="year.year">
        <div class="year-header">
          <div class="year-circle"></div>
          <h2 class="year-title">{{ year.year }}年</h2>
          <span class="year-count">{{ year.count }}篇文章</span>
        </div>
        
        <div class="year-articles">
          <div class="month-section" v-for="month in year.months" :key="month.month">
            <h3 class="month-title">{{ month.month }}月</h3>
            <div class="articles-list">
              <router-link 
                v-for="article in month.articles" 
                :key="article.id"
                :to="`/articles/${article.id}`"
                class="article-link"
              >
                <span class="article-date">{{ article.date }}</span>
                <span class="article-title">{{ article.title }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArchiveData } from '@/services/api'

const archiveData = ref([])
const loading = ref(true)

// 获取归档数据
const fetchArchiveData = async () => {
  try {
    loading.value = true
    archiveData.value = await getArchiveData()
  } catch (error) {
    console.error('获取归档数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArchiveData()
})
</script>

<style scoped lang="scss">
.archive-view {
  padding-top: var(--space-xxl);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-xxl);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: var(--space-sm);
  
  &::after {
    margin: var(--space-md) auto 0;
  }
}

.page-description {
  color: var(--color-text-light);
  font-size: 1.125rem;
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

.archive-timeline {
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      transparent
    );
  }
}

.timeline-year {
  position: relative;
  margin-bottom: var(--space-xxl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.year-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding-left: 1rem;
}

.year-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  position: absolute;
  left: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.year-title {
  font-size: 1.75rem;
  margin: 0;
  
  &::after {
    display: none;
  }
}

.year-count {
  font-family: var(--font-sans);
  color: var(--color-text-lighter);
  font-size: 0.9rem;
  background: var(--color-bg-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.year-articles {
  padding-left: var(--space-xl);
}

.month-section {
  margin-bottom: var(--space-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.month-title {
  font-size: 1.25rem;
  margin-bottom: var(--space-md);
  color: var(--color-text-light);
  
  &::after {
    display: none;
  }
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.article-link {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-bg-secondary);
    transform: translateX(4px);
    
    .article-title {
      color: var(--color-primary);
    }
  }
}

.article-date {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text-lighter);
  min-width: 2.5rem;
}

.article-title {
  flex: 1;
  transition: color 0.3s ease;
}
</style>
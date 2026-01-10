<template>
  <div class="articles-view">
    <!-- 页面头部 -->
    <header class="header">
      <h1 class="site-title">素笺</h1>
      <p class="site-subtitle">文字是时间的琥珀</p>
      <router-link to="/" class="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回首页
      </router-link>
    </header>

    <!-- 筛选功能区 -->
    <div class="filters-section">
      <div class="search-container">

        <n-input
          v-model:value="searchQuery"
          type="text"
          placeholder="搜索文章..."
          @keyup.enter="handleSearch"
          class="search-input">
          <template #prefix>
            <n-icon :component="SearchOutline" />
          </template>
        </n-input>
      </div>

      <div class="filter-controls">
        <div class="filter-group">
          <n-select v-model:value="selectedYear" placeholder="选择年份" :options="availableYears" clearable filterable
            @update:value="handleFilterChange" class="year-select">
          </n-select>
        </div>

        <div class="filter-group">
          <n-select v-model:value="activeTag" placeholder="选择分类" :options="availableTags" clearable filterable
            @update:value="handleFilterChange" class="tag-select">
          </n-select>
        </div>

        <button v-if="hasActiveFilters" @click="clearFilters" class="clear-filters-btn">
          清除筛选
        </button>
      </div>

      <!-- 筛选结果提示 -->
      <div v-if="hasActiveFilters && hasArticles" class="filter-result">
        <span class="result-count">找到 {{ totalArticles }} 篇匹配文章</span>
        <span v-if="selectedYear" class="filter-chip">
          年份：{{ selectedYear }}
          <button @click="selectedYear = ''; fetchArticles()" class="chip-remove">×</button>
        </span>
        <span v-if="activeTag" class="filter-chip">
          分类：{{ tagConfig[activeTag]?.label || activeTag }}
          <button @click="activeTag = ''; fetchArticles()" class="chip-remove">×</button>
        </span>
        <span v-if="searchQuery" class="filter-chip">
          搜索："{{ searchQuery }}"
          <button @click="searchQuery = ''; fetchArticles()" class="chip-remove">×</button>
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载文章...</p>
    </div>

    <!-- 文章列表 -->
    <main v-else>
      <!-- 没有文章 -->
      <div v-if="!hasArticles" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无文章</h3>
        <p>还没有任何文章记录</p>
      </div>

      <!-- 年份分组 -->
      <div v-for="(yearGroup, yearIndex) in groupedArticles" :key="yearGroup.year" class="year-section">
        <h2 class="year-title">{{ yearGroup.year }}年</h2>

        <ul class="article-list">
          <li v-for="(article, articleIndex) in yearGroup.articles" :key="article.id" class="article-item">

            <router-link :to="`/articles/${article.id}`" class="article-title">
              {{ article.title }}
            </router-link>
            <p class="article-excerpt">{{ getPreview(article.excerpt) }}</p>
            <div class="article-meta">
              <div class="article-date">{{ formatChineseDate(article.created_at) }}</div>
              <span v-if="article.tag" class="article-tag">{{ article.tag }}</span>
              <span class="read-time">{{ article.read_time || '5分钟阅读' }}</span>
            </div>

            <!-- 管理员操作按钮 -->
            <div v-if="authStore.isAdmin" class="admin-actions">
              <n-button @click="editArticle(article)" type="primary" size="small" title="编辑文章" class="edit-btn">
                编辑
              </n-button>
              <n-button @click="deleteArticles(article)" type="primary" ghost size="small" title="删除文章" class="delete-btn">
                删除
              </n-button>
            </div>
          </li>
        </ul>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1 || loading" class="pagination-btn">
          上一页
        </button>

        <div class="page-numbers">
          <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]" :disabled="loading">
            {{ page }}
          </button>
        </div>

        <button @click="nextPage" :disabled="currentPage === totalPages || loading" class="pagination-btn">
          下一页
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPaginatedArticles, getAllArticlesForFilter, deleteArticle } from '@/services/api'
import { SearchOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { createDiscreteApi } from 'naive-ui'
import { createRouterHelper } from '@/utils/routerlink'
// 响应式数据
const loading = ref(true)
const articles = ref([])
const totalArticlesCount = ref(0)
const searchQuery = ref('')
const activeTag = ref('')
const selectedYear = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 认证状态
const authStore = useAuthStore()

const { message } = createDiscreteApi(
  ['message'],
  {
    messageProviderProps: {
      placement: 'top'
    }
  }
)

const { dialog } = createDiscreteApi(
  ['dialog'],
  {
    messageProviderProps: {
      placement: 'top'
    }
  }
)

// 路由助手
const routerHelper = createRouterHelper()

// 标签配置
const tagConfig = {
  '随笔': { label: '随笔' },
  '思考': { label: '思考' },
  '观察': { label: '观察' },
  '技术': { label: '技术' },
  '阅读': { label: '阅读' },
  '生活': { label: '生活' },
  '读书': { label: '读书' }
}

// 筛选选项数据
const filterOptions = ref({
  years: [],
  tags: []
})

// 计算属性
const totalArticles = computed(() => totalArticlesCount.value)

const availableYears = computed(() => {
  const years = filterOptions.value.years.map(tag => ({
    value: tag,
    label: `${tag}`
  }))

  return [
    { value: '', label: '全部年份' },
    ...years
  ]
})

const availableTags = computed(() => {
  const tags = filterOptions.value.tags.map(tag => ({
    value: tag.value,
    label: `${tag.label} (${tag.count})`
  }))

  return [
    { value: '', label: '全部分类' },
    ...tags
  ]
})

const hasActiveFilters = computed(() => {
  return activeTag.value !== '' || selectedYear.value !== '' || searchQuery.value.trim() !== ''
})

const hasArticles = computed(() => {
  return articles.value.length > 0
})

// 按年份分组（显示当前页面的数据）
const groupedArticles = computed(() => {
  if (!articles.value.length) return []

  const grouped = {}

  // 按年份分组
  articles.value.forEach(article => {
    const year = new Date(article.created_at).getFullYear()

    if (!grouped[year]) {
      grouped[year] = {
        year,
        articles: []
      }
    }

    grouped[year].articles.push(article)
  })

  // 转换为数组并按年份排序
  return Object.values(grouped)
    .sort((a, b) => b.year - a.year)
    .map(yearGroup => ({
      ...yearGroup,
      articles: yearGroup.articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }))
})

// 分页相关计算属性
const totalPages = computed(() => {
  return Math.ceil(totalArticlesCount.value / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, currentPage.value - 2)
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 方法
const formatChineseDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const getPreview = (content, maxLength = 120) => {
  if (!content) return ''
  const text = content.replace(/[#*`\[\]]/g, '').trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const clearFilters = () => {
  activeTag.value = ''
  selectedYear.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  fetchArticles()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchArticles()
}

const handleFilterChange = (e) => {
  currentPage.value = 1
  fetchArticles()
}

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await fetchArticles()
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await fetchArticles()
  }
}

const goToPage = async (page) => {
  currentPage.value = page
  await fetchArticles()
}

// 获取筛选选项
const fetchFilterOptions = async () => {
  try {
    const articlesForFilter = await getAllArticlesForFilter()

    // 提取年份
    const years = new Set()
    const tagCounts = {}

    articlesForFilter.forEach(article => {
      const year = new Date(article.created_at).getFullYear()
      years.add(year)

      if (article.tag) {
        tagCounts[article.tag] = (tagCounts[article.tag] || 0) + 1
      }
    })

    // 设置筛选选项
    filterOptions.value = {
      years: Array.from(years).sort((a, b) => b - a),
      tags: Object.entries(tagCounts)
        .map(([value, count]) => ({
          value,
          label: tagConfig[value]?.label || value,
          count
        }))
        .sort((a, b) => b.count - a.count)
    }
  } catch (error) {
    console.error('获取筛选选项失败:', error)
  }
}

// 获取文章数据
const fetchArticles = async () => {
  try {
    loading.value = true

    const filters = {}
    if (selectedYear.value) filters.year = selectedYear.value
    if (activeTag.value) filters.tag = activeTag.value
    if (searchQuery.value.trim()) filters.search = searchQuery.value.trim()



    const { data, total } = await getPaginatedArticles(
      currentPage.value,
      itemsPerPage.value,
      filters
    )

    articles.value = data
    totalArticlesCount.value = total

  } catch (error) {
    console.error('获取文章失败:', error)
    articles.value = []
    totalArticlesCount.value = 0
  } finally {
    loading.value = false
  }
}

// 初始化
const initialize = async () => {
  await fetchFilterOptions()
  await fetchArticles()
}

// 编辑文章
const editArticle = (article) => {
  // 跳转到编辑页面
  routerHelper.replace(`/editor/${article.id}`)
}

// 删除文章
const deleteArticles = async (article) => {
  dialog.info({
    title: '确认删除',
    content: `确定要删除文章"${article.title}"吗？此操作不可撤销。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      // 立即关闭对话框
      dialog.destroyAll()

      // 使用 loading 消息提示
      const loadingMessage = message.loading('正在删除文章...', {
        duration: 0 // 持续显示
      })

      try {
        await deleteArticle(article.id)
        await fetchArticles()
        loadingMessage.destroy()
        message.success(`文章"${article.title}"删除成功`)
      } catch (error) {
        loadingMessage.destroy()
        message.error('删除文章失败，请重试')
      }
    }
  })
}

// 生命周期
onMounted(() => {
  initialize()
})
</script>

<style scoped>
/* 基础样式 */
.articles-view {}

/* 页面头部 */
.header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eaeaea;
}

.site-title {
  font-size: 5.6rem;
  font-weight: 300;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.site-subtitle {
  color: #7f8c8d;
  font-weight: 300;
  font-size: 2rem;
}

.back-link {
  color: #95a5a6;
  text-decoration: none;
  font-size: 1.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #3498db;
}

/* 筛选功能区 */
.filters-section {
  margin-bottom: 3rem;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  border-radius: 4px;
  font-size: 1.4rem;
  font-family: 'Noto Serif SC', serif;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #95a5a6;
  box-shadow: 0 0 0 2px rgba(149, 165, 166, 0.1);
}

.search-container svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}



.clear-filters-btn {
  padding: .75rem 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: var(--color-primary);
  font-size: 1.2rem;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  border-color: var(--color-primary);
  color: #fff;
  background-color: var(--color-primary);
}

/* 筛选结果提示 */
.filter-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #5d6d7e;
}

.result-count {
  font-weight: 500;
  color: #2c3e50;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #5d6d7e;
}

.chip-remove {
  background: transparent;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 0.25rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.chip-remove:hover {
  opacity: 1;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f5f5f5;
  border-top-color: #95a5a6;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #95a5a6;
}

/* 年份分组 */
.year-section {
  margin-bottom: 4rem;
}

.year-title {
  font-size: 1.8rem;
  font-weight: 300;
  color: #34495e;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #ddd;
}

/* 文章列表 */
.article-list {
  list-style: none;
}

.article-item {
  margin-bottom: 2.5rem;
  padding-left: 1.5rem;
  padding-bottom: 2.5rem;
  position: relative;
  border-bottom: 1px solid var(--color-border);
}


.article-date {
  color: #95a5a6;
  font-size: 1.4rem;
  margin-bottom: 0.3rem;
  font-family: 'Inter', sans-serif;
}

.article-title {
  font-size: 2.4rem;
  color: #2c3e50;
  font-weight: 600;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-excerpt {
  color: #5d6d7e;
  font-size: 1.6rem;
  line-height: 1.7;
  margin: 1rem 0 1.4rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.8rem;
  color: #7f8c8d;
}

.article-tag {
  background: #999;
  padding: .2rem 1rem;
  border-radius: 2px;
  color: #fff;
  font-size: 1rem;
}

.read-time {
  font-size: 1.2rem;
  font-family: var(--font-sans);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #95a5a6;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #eaeaea;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #95a5a6;
  background-color: #f8f9fa;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  min-width: 4rem;
  height: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  border-color: #95a5a6;
  background-color: #f8f9fa;
}

.page-btn.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .articles-view {
    padding: 1.5rem;
  }

  .site-title {
    font-size: 2rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .clear-filters-btn {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* 管理员操作按钮 */
.admin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #eaeaea;
}

.edit-btn,
.delete-btn {
  font-family: 'Noto Serif SC', serif;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .admin-actions {
    flex-direction: column;
    gap: 0.3rem;
  }

  .edit-btn,
  .delete-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
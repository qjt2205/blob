<template>
  <div class="article-view">
    <!-- 返回导航 -->
    <div class="back-nav">
      <router-link to="/articles" class="back-link">
        <n-icon :component="ArrowBackOutline" />
        返回文章列表
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>

    <!-- 文章内容 -->
    <article v-else-if="article" class="article-content">
      <!-- 文章头部 -->
      <header class="article-header">

        <h1 class="article-title">{{ article.title }}</h1>

        <div class="article-meta">
          <span class="article-date">{{ formatChineseDate(article.created_at) }}</span>
          <span v-if="article.tag" class="article-tag">{{ article.tag }}</span>
          <span class="read-time">{{ article.read_time || '5分钟阅读' }}</span>
        </div>
        <!-- 文章摘要 -->
        <div v-if="article.excerpt" class="article-excerpt">
          {{ article.excerpt }}
        </div>
      </header>

      <!-- 文章内容 -->
      <div class="article-body">
        <div class="content markdown-body" v-html="renderedContent"></div>

        <!-- 文章信息 -->
        <div class="article-info">
          <div class="info-item">
            <span class="info-label">字数统计</span>
            <span class="info-value">{{ wordCount }} 字</span>
          </div>
          <div class="info-item">
            <span class="info-label">阅读时长</span>
            <span class="info-value">{{ estimatedReadTime }} 分钟</span>
          </div>
          <div class="info-item">
            <span class="info-label">最后更新</span>
            <span class="info-value">{{ formatChineseDate(article.updated_at || article.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 文章导航 -->
      <div class="article-navigation">
        <div v-if="prevArticle" class="nav-item prev">
          <router-link :to="`/articles/${prevArticle.id}`" class="nav-link">
            <div class="nav-label">上一篇</div>
            <div class="nav-title">{{ prevArticle.title }}</div>
          </router-link>
        </div>

        <div class="nav-center">
          <router-link to="/articles" class="nav-action">
            所有文章
          </router-link>
          <button @click="copyLink" class="nav-action">
            分享文章
          </button>
        </div>

        <div v-if="nextArticle" class="nav-item next">
          <router-link :to="`/articles/${nextArticle.id}`" class="nav-link">
            <div class="nav-label">下一篇</div>
            <div class="nav-title">{{ nextArticle.title }}</div>
          </router-link>
        </div>
      </div>
    </article>

    <!-- 文章不存在 -->
    <div v-else class="not-found">
      <div class="not-found-content">
        <h2>文章不存在</h2>
        <p>抱歉，您访问的文章可能已被删除或不存在。</p>
        <div class="not-found-actions">
          <router-link to="/articles" class="btn">
            返回文章列表
          </router-link>
          <router-link to="/" class="btn btn-outline">
            返回首页
          </router-link>
        </div>
      </div>
    </div>

    <!-- 分享成功提示
    <div v-if="showCopySuccess" class="copy-success">
      链接已复制到剪贴板！
    </div> -->

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleById, getArticles } from '@/services/api'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { createDiscreteApi } from 'naive-ui'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

import 'highlight.js/styles/atom-one-dark.min.css'

const route = useRoute()
const articleId = parseInt(route.params.id)
const article = ref(null)
const loading = ref(true)
const allArticles = ref([])
const { message } = createDiscreteApi(
  ['message'],
  {
    messageProviderProps: {
      placement: 'top-right'
    }
  }
)

// 配置 marked
marked.setOptions({
  highlight: function (code, language) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    }
    return hljs.highlightAuto(code).value
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
})

// 格式化中文日期
const formatChineseDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
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
    const data = await getArticles()
    allArticles.value = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!article.value?.content) return ''

  try {
    const rawHtml = marked(article.value.content)

    // 安全过滤
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr', 'span',
        'strong', 'em', 'code', 'pre', 'blockquote',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target']
    })

    return cleanHtml
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return '<p class="text-red-500">渲染出错，请检查内容格式</p>'
  }
})

// 计算属性
const wordCount = computed(() => {
  return article.value?.content?.replace(/\s+/g, '').length || 0
})

const estimatedReadTime = computed(() => {
  if (!article.value?.content) return 0
  const words = article.value.content.split(/\s+/).length
  return Math.ceil(words / 300)
})

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

// 复制文章链接
const copyLink = async () => {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    message.success('链接已复制到剪贴板！')

  } catch (err) {
    message.error('复制失败，请手动复制链接')
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = window.location.href
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    message.success('链接已复制到剪贴板！')
  }
}

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    loading.value = true
    await fetchArticle()
  }
})

onMounted(async () => {
  await Promise.all([fetchArticle(), fetchAllArticles()])

  // 代码高亮
  setTimeout(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block)
    })
  }, 200)
})
</script>

<style scoped>
/* 基础样式 */
.article-view {}

/* 返回导航 */
.back-nav {
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.back-link {
  color: var(--color-primary);
  font-size: 1.4rem;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  transition: transform 0.2s ease;
}

.back-link:hover {
  transform: translateX(-3px);
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 6rem 0;
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

.loading-container p {
  color: #95a5a6;
  font-size: 1.4rem;
}

/* 文章头部 */
.article-header {
  margin-bottom: 3rem;
  text-align: center;
}

.article-meta {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
  font-size: 1.2rem;
  color: #65737e;
  align-items: center;
}

.article-date {
  font-family: 'Inter', sans-serif;
}

.article-tag {
  background: #f5f7fa;
  padding: 0.2rem 0.8rem;
  color: #65737e;
}

.read-time {
  font-family: var(--font-serif);
}

.article-title {
  font-size: 4rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.article-excerpt {
  color: #5d6d7e;
  font-size: 1.4rem;
  line-height: 1.7;
  padding-left: 1.5rem;
  border-left: 2px solid var(--color-border);
  margin-bottom: 2rem;
}

/* 文章内容 */
.article-body {}

/* 文章信息 */
.article-info {
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
  padding: 2rem 0;
  border-top: 1px solid #eaeaea;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 1.2rem;
  color: #95a5a6;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

/* 文章导航 */
.article-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  align-items: center;
  padding-top: 3rem;
  border-top: 1px solid #eaeaea;
}

.nav-item {
  min-width: 0;
  flex: 1;
  max-width: 30rem;
}

.nav-link {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: #f8f9fa;
}

.nav-label {
  font-size: 1.2rem;
  color: #95a5a6;
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.nav-title {
  font-size: 1.2rem;
  color: var(--color-text);
  font-weight: 400;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prev .nav-title {
  text-align: left;
}

.next .nav-title {
  text-align: right;
}

.next .nav-label {
  text-align: right;
}

.nav-center {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-action {
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: #2c3e50;
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.nav-action:hover {
  border-color: #95a5a6;
  background-color: #f8f9fa;
}

/* 文章不存在 */
.not-found {
  text-align: center;
  padding: 4rem 0;
}

.not-found-content h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 300;
}

.not-found-content p {
  color: #718096;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  border-color: #95a5a6;
  background-color: #f8f9fa;
}

.btn-outline {
  background: transparent;
}

/* 复制成功提示 */
.copy-success {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.25rem;
  background: #2c3e50;
  color: white;
  border-radius: 4px;
  font-size: 0.9rem;
  animation: fadeInOut 2s ease-in-out;
  z-index: 1000;
}

@keyframes fadeInOut {

  0%,
  100% {
    opacity: 0;
    transform: translateY(10px);
  }

  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }
}


/* 响应式设计 */
@media (max-width: 768px) {
  .article-view {
    padding: 1.5rem;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-navigation {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .nav-center {
    order: -1;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-item {
    width: 100%;
  }

  .prev .nav-title,
  .next .nav-title {
    text-align: center;
  }

  .article-info {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .not-found-actions {
    flex-direction: column;
  }

  .copy-success {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.5rem;
  }

  .article-meta {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  :deep(.markdown-body h1) {
    font-size: 1.5rem;
  }

  :deep(.markdown-body h2) {
    font-size: 1.3rem;
  }
}

.markdown-body :deep(pre code.hljs) {
    display: block;
    overflow-x: auto;
    padding: 1em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.markdown-body :deep(p) {
  font-size: 1.6rem;
  margin-bottom: 1rem;
}

.markdown-body :deep(pre) {
  margin-bottom: 1rem;
}
.markdown-body :deep(h3) {
  margin-top: 3rem;
  margin-bottom: 1rem;
}

.markdown-body :deep(ul) {
  margin-top: 2rem;
}

.markdown-body :deep(ol) {
  margin-left: 2rem;
}

.markdown-body :deep(a) {
  color: #d03050;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(li) {
  margin-bottom: 1rem;
}
</style>

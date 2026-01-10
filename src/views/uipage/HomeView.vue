<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">时光笔记</h1>
        <p class="hero-subtitle">把“为什么是我”换成“这要教我什么”，整个世界都会改变。</p>
        <div class="hero-actions">
          <n-space align="center">
            <n-button color="#2c3e50" size="large" tag="a" href="/articles" class="btn-primary">
              阅读文章
            </n-button>
            <n-button color="#2c3e50" ghost size="large" tag="a" href="/about" class="btn-outline">
              关于我
            </n-button>
          </n-space>
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
          <div class="article-link">
            <div class="article-meta">
              <span class="article-date">{{ formatDate(article.created_at) }}</span>
              <span class="article-tag">{{ article.tag || '随笔' }}</span>
            </div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.excerpt || article.content.substring(0, 100) + '...' }}</p>
            <n-button color="#2c3e50" text tag="a" :href="`/articles/${article.id}`" class="article-readmore">
              阅读全文
              <span class="arrow">→</span>
            </n-button>
          </div>
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
    featuredArticles.value = articles.slice(0, 5)
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
  padding-top: 4rem;
}

.hero-section {
  position: relative;
  margin-bottom: 4rem;
  padding-bottom: 4rem;
  border-bottom: 1px solid var(--color-border);
}

.hero-content {
  max-width: 60rem;

  .hero-title {
    font-size: 5.6rem;
    line-height: 1.2;
    margin-bottom: 2.4rem;

    &::after {
      display: none;
    }
  }

  .hero-subtitle {
    font-size: 2rem;
    color: var(--color-text-light);
    margin-bottom: 3rem;
  }
}

.hero-decoration {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20rem;
  height: 20rem;

  .decoration-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10rem;
    height: 1px;
    background: var(--color-border);
    transform: rotate(45deg);
  }

  .decoration-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: .8rem;
    height: .8rem;
    background: var(--color-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

.featured-section {
  margin-top: 4rem;

  .section-title {
    font-size: 2.4rem;
    margin-bottom: 3rem;

    .title-number {
      color: var(--color-primary);
      font-family: var(--font-mono);
      font-size: 1.4rem;
      opacity: .6;
    }
  }
}

.loading-container {
  text-align: center;
}

.articles-grid {

  .empty-state {
    text-align: center;
    font-size: 1.6rem;
    color: var(--color-text-lighter);
  }

  .article-link {
    transition: transform .2s ease;
    padding-bottom: 2.4rem;
    border-bottom: 1px solid var(--color-border);

    &:hover {
      transform: translateX(-1rem);
    }
  }

  .article-card {
    margin-bottom: 3rem;

    .article-meta {
      font-size: 1.4rem;
      color: var(--color-text-lighter);

      .article-tag {
        margin-left: .5rem;
      }
    }

    .article-title {
      font-size: 2.2rem;
      color: var(--color-text);
      margin: 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-excerpt {
      font-size: 1.6rem;
      margin-bottom: 2rem;
    }
  }
}



// <div class="article-card" v-for="article in featuredArticles" :key="article.id">
//           <div class="article-link">
//             <div class="article-meta">
//               <span class="article-date">{{ formatDate(article.created_at) }}</span>
//               <span class="article-tag">{{ article.tag || '随笔' }}</span>
//             </div>
//             <h3 class="article-title">{{ article.title }}</h3>
//             <p class="article-excerpt">{{ article.excerpt || article.content.substring(0, 100) + '...' }}</p>
//             <n-button type="default" text tag="a" :href="`/articles/${article.id}`" class="article-readmore">
//               阅读全文
//               <span class="arrow">→</span>
//             </n-button>
//           </div>
//         </div></style>
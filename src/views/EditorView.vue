<template>
  <div class="editor-view">
    <div class="editor-header">
      <h1 class="editor-title">文章编辑器</h1>
      <div class="editor-actions">
        <button @click="saveDraft" class="btn btn-secondary">保存草稿</button>
        <button @click="publishArticle" class="btn btn-primary">发布文章</button>
        <button @click="clearEditor" class="btn btn-outline">清空</button>
      </div>
    </div>

    <div class="editor-form">
      <div class="form-group">
        <label for="title">文章标题</label>
        <input 
          id="title" 
          v-model="article.title" 
          type="text" 
          placeholder="请输入文章标题"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="excerpt">文章摘要</label>
        <textarea 
          id="excerpt" 
          v-model="article.excerpt" 
          placeholder="请输入文章摘要"
          rows="3"
          class="form-textarea"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="content">文章内容</label>
        <textarea 
          id="content" 
          v-model="article.content" 
          placeholder="请输入文章内容"
          rows="15"
          class="form-textarea"
          required
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="tag">标签</label>
          <select id="tag" v-model="article.tag" class="form-select">
            <option value="随笔">随笔</option>
            <option value="思考">思考</option>
            <option value="观察">观察</option>
            <option value="技术">技术</option>
            <option value="阅读">阅读</option>
          </select>
        </div>

        <div class="form-group">
          <label for="readTime">阅读时间</label>
          <input 
            id="readTime" 
            v-model="article.readTime" 
            type="text" 
            placeholder="如：5分钟阅读"
            class="form-input"
          />
        </div>
      </div>
    </div>

    <div class="preview-section" v-if="article.content">
      <h3>预览</h3>
      <div class="preview-content">
        <h4>{{ article.title || '无标题' }}</h4>
        <p>{{ article.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createArticle } from '@/services/api'

const router = useRouter()
const publishing = ref(false)

const article = ref({
  title: '',
  excerpt: '',
  content: '',
  tag: '随笔',
  readTime: '',
  is_published: true
})

// 检查是否是管理员
const isAdmin = () => {
  return localStorage.getItem('blog_admin') === 'true'
}

// 初始化时检查权限
onMounted(() => {
  if (!isAdmin()) {
    router.push('/')
    return
  }
  
  // 加载草稿
  const draft = localStorage.getItem('article_draft')
  if (draft) {
    article.value = { ...article.value, ...JSON.parse(draft) }
  }
})

const saveDraft = () => {
  localStorage.setItem('article_draft', JSON.stringify(article.value))
  alert('草稿已保存')
}

const publishArticle = async () => {
  if (!article.value.title || !article.value.content) {
    alert('请填写标题和内容')
    return
  }

  if (publishing.value) return
  
  try {
    publishing.value = true
    
    // 准备文章数据
    const articleData = {
      title: article.value.title,
      excerpt: article.value.excerpt,
      content: article.value.content,
      tag: article.value.tag,
      read_time: article.value.readTime || '5分钟阅读',
      is_published: true
    }
    
    // 调用 API 创建文章
    const newArticle = await createArticle(articleData)
    
    // 清除草稿
    localStorage.removeItem('article_draft')
    
    alert('文章发布成功！')
    clearEditor()
    
    // 跳转到新文章
    router.push(`/articles/${newArticle.id}`)
    
  } catch (error) {
    console.error('发布文章失败:', error)
    alert('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

const clearEditor = () => {
  article.value = {
    title: '',
    excerpt: '',
    content: '',
    tag: '随笔',
    readTime: '',
    is_published: true
  }
  localStorage.removeItem('article_draft')
}
</script>

<style scoped>
.editor-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.editor-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
}

.editor-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.btn-outline:hover {
  background: #dc3545;
  color: white;
}

.editor-form {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.preview-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 2rem;
}

.preview-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.preview-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
}

.preview-content h4 {
  margin-bottom: 1rem;
  color: #333;
}

.preview-content p {
  line-height: 1.6;
  color: #666;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .editor-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
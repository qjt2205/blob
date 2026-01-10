<template>
  <div class="editor-view">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <div class="header-left">
        <n-button quaternary @click="goBack">
          <template #icon>
            <n-icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </n-icon>
          </template>
          返回
        </n-button>
        <h1 class="editor-title">{{ article.id ? '编辑文章' : '创作新文章' }}</h1>
      </div>
      <div class="editor-actions">
        <n-button 
          secondary 
          @click="saveDraft" 
          :loading="saving"
          :disabled="publishing"
        >
          保存草稿
        </n-button>
        <n-button 
          @click="showClearConfirm = true"
          :disabled="publishing || saving"
        >
          清空
        </n-button>
        <n-button 
          type="primary" 
          @click="publishArticle" 
          :loading="publishing"
          :disabled="saving"
        >
          {{ article.id ? '更新文章' : '发布文章' }}
        </n-button>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <n-grid cols="1 s:2" :x-gap="24" :y-gap="24" responsive="screen">
      <!-- 左侧：编辑器表单 -->
      <n-grid-item>
        <div class="editor-form">
          <!-- 标题 -->
          <n-form-item label="文章标题" required :feedback="titleError" :validation-status="titleError ? 'error' : null">
            <n-input
              v-model:value="article.title"
              placeholder="请输入文章标题"
              clearable
              :maxlength="100"
              @input="onTitleInput"
            />
          </n-form-item>

          <!-- 摘要 -->
          <n-form-item label="文章摘要">
            <n-input
              v-model:value="article.excerpt"
              type="textarea"
              placeholder="请输入文章摘要（可选）"
              :rows="3"
              clearable
              :maxlength="200"
              show-count
            />
          </n-form-item>

          <!-- 标签 -->
          <n-form-item label="文章标签">
            <n-space>
              <n-tag
                v-for="tag in availableTags"
                :key="tag"
                :type="article.tag === tag ? 'primary' : 'default'"
                checkable
                @click="article.tag = article.tag === tag ? '' : tag"
              >
                {{ tag }}
              </n-tag>
            </n-space>
            <div style="margin-top: 8px;">
              <n-select
                v-model:value="article.tag"
                :options="tagOptions"
                placeholder="选择标签或自定义"
                filterable
                clearable
                tag
              />
            </div>
          </n-form-item>

          <!-- 阅读时间 -->
          <n-form-item label="阅读时间">
            <n-space>
              <n-tag
                v-for="time in readTimeOptions"
                :key="time"
                :type="article.read_time === time ? 'primary' : 'default'"
                checkable
                @click="article.read_time = article.read_time === time ? '' : time"
              >
                {{ time }}
              </n-tag>
            </n-space>
            <div style="margin-top: 8px;">
              <n-input
                v-model:value="article.read_time"
                placeholder="自定义阅读时间..."
                clearable
                :maxlength="20"
              />
            </div>
          </n-form-item>

          <!-- 内容编辑器 -->
          <n-form-item label="文章内容" required :feedback="contentError" :validation-status="contentError ? 'error' : null">
            <div class="editor-toolbar">
              <n-space>
                <n-button size="small" @click="insertHeading(1)" title="一级标题">
                  H1
                </n-button>
                <n-button size="small" @click="insertHeading(2)" title="二级标题">
                  H2
                </n-button>
                <n-button size="small" @click="insertHeading(3)" title="三级标题">
                  H3
                </n-button>
                <n-button size="small" @click="insertBold" title="粗体">
                  <n-text strong>B</n-text>
                </n-button>
                <n-button size="small" @click="insertItalic" title="斜体">
                  <n-text italic>I</n-text>
                </n-button>
                <n-button size="small" @click="insertLink" title="链接">
                  链接
                </n-button>
                <n-button size="small" @click="insertImage" title="插入图片">
                  图片
                </n-button>
                <n-button size="small" @click="insertCodeBlock" title="代码块">
                  代码块
                </n-button>
                <n-button size="small" @click="insertList('unordered')" title="无序列表">
                  无序列表
                </n-button>
                <n-button size="small" @click="insertList('ordered')" title="有序列表">
                  有序列表
                </n-button>
                <n-button size="small" @click="insertBlockquote" title="引用">
                  引用
                </n-button>
                <n-button size="small" @click="insertHorizontalRule" title="分割线">
                  分割线
                </n-button>
              </n-space>
            </div>
            
            <n-input
              v-model:value="article.content"
              type="textarea"
              placeholder="请输入文章内容，支持 Markdown 语法..."
              :rows="15"
              :autosize="{ minRows: 15, maxRows: 25 }"
              class="code-editor"
              ref="contentTextareaRef"
              @input="onContentInput"
            />
            
            <div class="editor-info">
              <n-space justify="space-between">
                <div class="markdown-hint">
                  <n-text depth="3" size="small">支持 Markdown 语法</n-text>
                </div>
                <div>
                  <n-text depth="3" size="small">{{ wordCount }} 字 • 约 {{ estimatedReadTime }} 分钟阅读</n-text>
                </div>
              </n-space>
            </div>
          </n-form-item>
        </div>
      </n-grid-item>

      <!-- 右侧：预览区域 -->
      <n-grid-item>
        <div class="preview-section" v-if="article.content">
          <div class="preview-header">
            <h3>实时预览</h3>
            <div class="preview-info">
              <n-text depth="3" size="small">{{ wordCount }} 字 • 约 {{ estimatedReadTime }} 分钟阅读</n-text>
            </div>
          </div>
          <div class="preview-content markdown-body" ref="previewRef" v-html="renderedContent"></div>
        </div>
        <div class="empty-preview" v-else>
          <n-result
            status="info"
            title="开始创作"
            description="在左侧编辑内容后，这里会显示实时预览"
          >
            <template #icon>
              <n-icon size="60">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </n-icon>
            </template>
          </n-result>
        </div>
      </n-grid-item>
    </n-grid>

    <!-- 清空确认对话框 -->
    <n-modal v-model:show="showClearConfirm" preset="dialog" title="确认清空">
      <template #header>
        <div>确认清空</div>
      </template>
      <div style="padding: 20px 0;">
        <p>确定要清空当前编辑的内容吗？此操作无法撤销。</p>
      </div>
      <template #action>
        <n-button @click="showClearConfirm = false">取消</n-button>
        <n-button type="error" @click="confirmClear">确认清空</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDiscreteApi } from 'naive-ui'
import { createArticle, updateArticle, getArticleById } from '@/services/api'

import { createRouterHelper } from '@/utils/routerlink'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.min.css'

const router = useRouter()
const route = useRoute()
// 路由助手
const routerHelper = createRouterHelper()
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

const articleId = route.params.id ? parseInt(route.params.id) : null
const article = ref({
  title: '',
  excerpt: '',
  content: '',
  tag: '随笔',
  read_time: '5分钟阅读',
  is_published: true
})

const saving = ref(false)
const publishing = ref(false)
const contentTextareaRef = ref(null)
const submitted = ref(false)
const showClearConfirm = ref(false)

// 配置 marked
marked.setOptions({
  highlight: function(code, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value
      } catch (err) {
        return hljs.highlightAuto(code).value
      }
    }
    return code
  },
  langPrefix: 'language-',
  breaks: true,  // 将单个换行符转为 <br>
  gfm: true      // 使用 GitHub Flavored Markdown
})



// 更简单的预处理函数版本
const preprocessMarkdownSimple = (markdown) => {
  if (!markdown) return ''
  
  // 直接在每个代码块前后添加空行
  let processed = markdown
  
  // 匹配所有代码块
  const codeBlockRegex = /(\s*```\w*\n[\s\S]*?\n```\s*)/g
  
  // 使用替换函数
  processed = processed.replace(codeBlockRegex, (match) => {
    // 确保代码块前后都有换行符
    if (!match.startsWith('\n')) {
      match = '\n' + match
    }
    if (!match.endsWith('\n')) {
      match = match + '\n'
    }
    return match
  })
  
  // 确保标题后面有空行
  processed = processed.replace(/^(#{1,6}.*)$/gm, '$1\n')
  
  return processed
}

// 修改 renderedContent 函数
const renderedContent = computed(() => {
  if (!article.value.content) return ''
  
  try {
    // 1. 预处理 Markdown 内容（确保代码块前后有空行）
    let contentToRender = article.value.content
    
    // 如果内容中有代码块，进行预处理
    if (contentToRender.includes('```')) {
      contentToRender = preprocessMarkdownSimple(contentToRender)
    }
    
    // 2. 让 marked 处理所有格式
    const rawHtml = marked(contentToRender)
    
    // 3. 创建临时容器用于处理代码高亮
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = rawHtml
    
    // 4. 专门处理代码块的高亮
    const codeBlocks = tempDiv.querySelectorAll('pre code[class^="language-"]')
    codeBlocks.forEach((codeBlock) => {
      const language = codeBlock.className.replace('language-', '')
      if (language && hljs.getLanguage(language)) {
        // 如果代码块没有内容，跳过
        if (!codeBlock.textContent.trim()) return
        
        try {
          // 对所有语言都进行高亮处理
          codeBlock.innerHTML = hljs.highlight(codeBlock.textContent, { language }).value
          codeBlock.className = `hljs ${codeBlock.className}`
          
          // 添加父元素 pre 的类
          const preElement = codeBlock.closest('pre')
          if (preElement) {
            preElement.className = 'code-block hljs'
            // 确保代码块有足够的间距
            preElement.style.marginTop = '1.5em'
            preElement.style.marginBottom = '1.5em'
            preElement.style.padding = '1em'
            preElement.style.backgroundColor = '#f6f8fa'
            preElement.style.borderRadius = '8px'
            preElement.style.overflowX = 'auto'
          }
        } catch (error) {
          console.warn('代码高亮失败:', error)
          // 保留原始代码
        }
      }
    })
    
    // 5. 处理段落和换行 - 确保更好的间距
    // 为所有段落添加合适的 margin
    const paragraphs = tempDiv.querySelectorAll('p')
    paragraphs.forEach((p) => {
      // 确保段落之间有空行
      if (p.previousElementSibling && p.previousElementSibling.tagName !== 'P') {
        p.style.marginTop = '1em'
      }
      p.style.marginBottom = '1em'
      p.style.lineHeight = '1.6'
    })
    
    // 6. 处理列表的间距
    const lists = tempDiv.querySelectorAll('ul, ol')
    lists.forEach((list) => {
      list.style.marginTop = '1em'
      list.style.marginBottom = '1em'
      list.style.paddingLeft = '2em'
    })
    
    // 7. 处理标题的间距
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => {
      heading.style.marginTop = '1.5em'
      heading.style.marginBottom = '0.75em'
      heading.style.fontWeight = '600'
      heading.style.lineHeight = '1.25'
    })
    
    // 8. 处理 h3 标题（针对你的示例）
    const h3Elements = tempDiv.querySelectorAll('h3')
    h3Elements.forEach((h3) => {
      h3.style.fontSize = '1.25em'
      h3.style.marginTop = '1.5em'
      h3.style.marginBottom = '0.75em'
    })
    
    // 9. 处理所有元素的换行和间距问题
    // 查找所有文本节点，处理换行
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )
    
    const textNodes = []
    let node
    while ((node = walker.nextNode())) {
      textNodes.push(node)
    }
    
    textNodes.forEach((textNode) => {
      // 跳过代码块内的文本
      if (textNode.parentElement.closest('pre, code')) {
        return
      }
      
      const content = textNode.textContent
      // 将单个换行符替换为 <br>
      if (content.includes('\n') && !content.includes('\n\n')) {
        const parts = content.split('\n')
        const fragment = document.createDocumentFragment()
        
        parts.forEach((part, index) => {
          if (part) {
            fragment.appendChild(document.createTextNode(part))
          }
          if (index < parts.length - 1 && parts[index + 1]) {
            const br = document.createElement('br')
            fragment.appendChild(br)
          }
        })
        
        textNode.parentNode.replaceChild(fragment, textNode)
      }
    })
    
    // 10. 清理和净化 HTML
    const cleanHtml = DOMPurify.sanitize(tempDiv.innerHTML, {
      ADD_TAGS: ['pre', 'code', 'span', 'div', 'br'],  // 允许这些标签
      ADD_ATTR: ['class', 'style']  // 允许 class 和 style 属性
    })
    
    return cleanHtml
    
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return '<div class="error-message" style="color: #f56c6c; padding: 20px; text-align: center;">渲染错误，请检查内容格式</div>'
  }
})


// 可用标签
const availableTags = ['技术', '随笔', '思考', '阅读', '观察', '生活', '旅行', '美食']
const tagOptions = availableTags.map(tag => ({
  label: tag,
  value: tag
}))

// 阅读时间选项
const readTimeOptions = ['3分钟阅读', '5分钟阅读', '8分钟阅读', '10分钟阅读', '15分钟阅读']

// 计算属性
const wordCount = computed(() => {
  return article.value.content.replace(/\s+/g, '').length
})

const estimatedReadTime = computed(() => {
  const words = article.value.content.split(/\s+/).length
  return Math.ceil(words / 200)
})



const titleError = computed(() => {
  return submitted.value && !article.value.title ? '请输入文章标题' : ''
})

const contentError = computed(() => {
  return submitted.value && !article.value.content ? '请输入文章内容' : ''
})


// 检查权限
const isAdmin = () => {
  return localStorage.getItem('blog_admin') === 'true'
}

// 初始化
onMounted(async () => {
  if (!isAdmin()) {
    message.error('您没有编辑权限')
    routerHelper.replace('/')
    return
  }
  
  // 如果是编辑模式，加载文章数据
  if (articleId) {
    try {
      const data = await getArticleById(articleId)
      article.value = { ...article.value, ...data }
    } catch (error) {
      message.error('加载文章失败')
    }
  } else {
    // 新建模式，加载草稿
    const draft = localStorage.getItem('article_draft')
    if (draft) {
      try {
        article.value = { ...article.value, ...JSON.parse(draft) }
      } catch (e) {
        localStorage.removeItem('article_draft')
      }
    }
  }
  
  // 自动保存草稿
  startAutoSave()
})

// 自动保存草稿
let autoSaveTimer = null
const startAutoSave = () => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  autoSaveTimer = setInterval(() => {
    if (article.value.title || article.value.content) {
      localStorage.setItem('article_draft', JSON.stringify(article.value))
    }
  }, 30000)
}

// 事件处理函数
const goBack = () => {
  if (article.value.title || article.value.content) {
    dialog.warning({
      title: '确认离开',
      content: '您有未保存的内容，确定要离开吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        router.back()
      }
    })
  } else {
    router.back()
  }
}

// 输入处理
const onTitleInput = () => {
  submitted.value = false
}

const onContentInput = () => {
  submitted.value = false
}

// 插入工具函数
const getTextarea = () => {
  const component = contentTextareaRef.value
  if (!component) {
    return null
  }
  
  // 直接查找 textarea 元素
  if (component.$el) {
    const textarea = component.$el.querySelector('textarea')
    return textarea
  }
  
  return null
}

const insertText = (text) => {
  const textarea = getTextarea()
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const content = article.value.content
  
  const newContent = content.substring(0, start) + text + content.substring(end)
  article.value.content = newContent
  
  // 更新光标位置
  nextTick(() => {
    const newCursorPos = start + text.length
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const wrapSelection = (before, after, placeholder) => {
  const textarea = getTextarea()
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = article.value.content.substring(start, end)
  
  const wrappedText = selectedText 
    ? `${before}${selectedText}${after}`
    : `${before}${placeholder}${after}`
  
  insertText(wrappedText)
}

// 工具栏功能
const insertHeading = (level) => {
  const hashes = '#'.repeat(level)
  wrapSelection(`${hashes} `, '', '标题')
}

const insertBold = () => {
  wrapSelection('**', '**', '粗体文字')
}

const insertItalic = () => {
  wrapSelection('*', '*', '斜体文字')
}

const insertLink = () => {
  const textarea = getTextarea()
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = article.value.content.substring(start, end)
  
  let linkHtml = '<a href="https://example.com" target="_blank">链接文字</a>'
  if (selectedText) {
    // 如果选中了文本，将其作为链接文字
    linkHtml = `<a href="https://example.com" target="_blank">${selectedText}</a>`
  }
  
  insertText(linkHtml)
  
  // 设置光标位置到链接文字位置
  nextTick(() => {
    const hrefPos = linkHtml.indexOf('>') + 1
    const newCursorPos = start + hrefPos
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const insertImage = () => {
  // 创建文件输入元素
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.multiple = false
  
  fileInput.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件')
      return
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过5MB')
      return
    }
    
    // 读取文件并转换为Data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      
      const textarea = getTextarea()
      if (!textarea) return
      
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = article.value.content.substring(start, end)
      
      // 使用Data URL插入图片
      let imageMarkdown = `![${file.name}](${dataUrl})`
      if (selectedText) {
        // 如果选中了文本，将其作为图片描述
        imageMarkdown = `![${selectedText}](${dataUrl})`
      }
      
      insertText(imageMarkdown)
      
      // 设置光标位置到图片URL位置，方便修改
      nextTick(() => {
        const descriptionLength = imageMarkdown.indexOf('](') + 2
        const newCursorPos = start + descriptionLength
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      })
    }
    
    reader.onerror = () => {
      message.error('图片读取失败，请重试')
    }
    
    reader.readAsDataURL(file)
  }
  
  // 触发文件选择
  fileInput.click()
}

const insertCodeBlock = () => {
  const textarea = getTextarea()
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = article.value.content.substring(start, end)
  
  // 总是使用 javascript 作为默认语言
  const language = 'javascript'
  
  let codeBlock = `\`\`\`${language}\n// 在这里写你的代码\n\`\`\``
  if (selectedText) {
    codeBlock = `\`\`\`${language}\n${selectedText}\n\`\`\``
  }
  
  insertText(codeBlock)
}

const insertList = (type) => {
  const prefix = type === 'ordered' ? '1. ' : '- '
  wrapSelection(prefix, '', '列表项')
}

const insertBlockquote = () => {
  wrapSelection('> ', '', '引用内容')
}

const insertHorizontalRule = () => {
  insertText('\n\n---\n\n')
}

// 保存草稿
const saveDraft = async () => {
  try {
    saving.value = true
    
    if (!article.value.title) {
      message.warning('请输入文章标题')
      return
    }
    
    localStorage.setItem('article_draft', JSON.stringify(article.value))
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    message.success('草稿已保存')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 清空编辑器
const confirmClear = () => {
  article.value = {
    title: '',
    excerpt: '',
    content: '',
    tag: '随笔',
    read_time: '5分钟阅读',
    is_published: true
  }
  localStorage.removeItem('article_draft')
  showClearConfirm.value = false
  submitted.value = false
  message.info('编辑器已清空')
}

// 发布文章
const publishArticle = async () => {
  submitted.value = true
  
  if (!article.value.title || !article.value.content) {
    message.warning('请填写标题和内容')
    return
  }

  if (publishing.value) return
  
  try {
    publishing.value = true
    
    const articleData = {
      title: article.value.title,
      excerpt: article.value.excerpt || article.value.content.substring(0, 100) + '...',
      content: article.value.content,
      tag: article.value.tag,
      read_time: article.value.read_time,
      is_published: true
    }
    
    let newArticle
    
    if (articleId) {
      // 更新文章
      newArticle = await updateArticle(articleId, articleData)
      message.success('文章更新成功！')
    } else {
      // 创建新文章
      newArticle = await createArticle(articleData)
      message.success('文章发布成功！')
    }
    
    localStorage.removeItem('article_draft')
    
    // 延迟跳转以便用户看到成功消息
    setTimeout(() => {
      routerHelper.replace(`/articles/${newArticle.id}`)
    }, 1000)
    
  } catch (error) {
    message.error('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

// 组件卸载前清理
onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>

<style scoped>
  :deep(.n-form-item-blank) {
    display: block;
  }
/* 基础样式 */
.editor-view {
  font-family: 'Noto Serif SC', serif;
  background: #fefefe;
  color: #333;
  line-height: 1.6;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

/* 编辑器头部 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eaeaea;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.editor-title {
  font-size: 1.8rem;
  font-weight: 300;
  color: #2c3e50;
  margin: 0;
}

.editor-actions {
  display: flex;
  gap: 1rem;
}

:deep(.n-input__textarea-el) {
  font-size: 1.4rem;
}
/* 编辑器表单 */
.editor-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

/* 工具栏 */
.editor-toolbar {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #eaeaea;
  overflow-x: auto;
}

/* 代码编辑器样式 */
.code-editor {
  font-size: 0.95rem;
  line-height: 1.6;
}

.code-editor textarea {
  font-family: inherit;
  line-height: 1.6;
}

/* 编辑器信息 */
.editor-info {
  margin-top: 0.5rem;
}

.markdown-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 预览区域 */
.preview-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.empty-preview {
  background: white;
  padding: 3rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  text-align: center;
  height: fit-content;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.preview-header h3 {
  font-size: 1.3rem;
  font-weight: 300;
  color: #2c3e50;
  margin: 0;
}

.preview-info {
  font-size: 0.9rem;
  color: #95a5a6;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .editor-view {
    padding: 1rem;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .editor-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .editor-title {
    font-size: 1.5rem;
  }
  
  .editor-form,
  .preview-section,
  .empty-preview {
    padding: 1rem;
  }
  
  .editor-toolbar {
    overflow-x: auto;
    white-space: nowrap;
  }
}

.markdown-body :deep(pre code.hljs) {
    display: block;
    overflow-x: auto;
    padding: 1em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

</style>

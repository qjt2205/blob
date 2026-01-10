// api.js
import { supabase, getCurrentUser } from '@/config/supabase'

// 获取分页文章
export async function getPaginatedArticles(page = 1, itemsPerPage = 10, filters = {}) {
  const startIndex = (page - 1) * itemsPerPage
  
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // 应用筛选条件
  if (filters.tag) {
    query = query.eq('tag', filters.tag)
  }
  
  if (filters.year) {
    const startDate = new Date(filters.year, 0, 1).toISOString()
    const endDate = new Date(filters.year, 11, 31, 23, 59, 59).toISOString()
    query = query.gte('created_at', startDate).lte('created_at', endDate)
  }
  
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
  }

  // 分页
  const { data, error, count } = await query
    .range(startIndex, startIndex + itemsPerPage - 1)

  if (error) throw error
  return { data, total: count || 0 }
}

// 获取所有文章（用于筛选选项）
export async function getAllArticlesForFilter() {
  const { data, error } = await supabase
    .from('articles')
    .select('created_at, tag')
    .eq('is_published', true)

  if (error) throw error
  return data
}

// 获取单篇文章
export async function getArticleById(id) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// 创建文章
export async function createArticle(article) {
  // 获取当前用户
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('用户未登录')
  }
  
  const articleData = {
    ...article,
    user_id: user.id
  }
  
  const { data, error } = await supabase
    .from('articles')
    .insert([articleData])
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新文章
export async function updateArticle(id, updates) {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 删除文章
export async function deleteArticle(id) {
  try {
    // 获取当前用户
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('用户未登录')
    }
    
    // 首先检查用户是否有权限删除这篇文章
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw new Error('文章不存在或无法访问')
    }
    
    // 检查用户是否是文章的作者（或者如果是管理员）
    const isAdminUser = localStorage.getItem('blog_admin') === 'true'
    if (article.user_id !== user.id && !isAdminUser) {
      throw new Error('您没有权限删除此文章')
    }
    
    // 执行删除操作
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('删除失败详情:', deleteError)
      throw new Error(`删除失败: ${deleteError.message}`)
    }
    
    // 返回删除成功的标志
    return { success: true, message: '文章删除成功' }
    
  } catch (error) {
    console.error('删除文章过程中出错:', error)
    throw error
  }
}

// 获取归档数据
export async function getArchiveData() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  // 按年份和月份组织数据
  const archiveByYear = {}
  
  data.forEach(article => {
    const date = new Date(article.created_at)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    
    if (!archiveByYear[year]) {
      archiveByYear[year] = {}
    }
    
    if (!archiveByYear[year][month]) {
      archiveByYear[year][month] = []
    }
    
    archiveByYear[year][month].push({
      id: article.id,
      date: `${date.getDate()}日`,
      title: article.title
    })
  })

  // 转换为需要的格式
  return Object.keys(archiveByYear).map(year => {
    const months = Object.keys(archiveByYear[year]).map(month => ({
      month: parseInt(month),
      articles: archiveByYear[year][month]
    })).sort((a, b) => b.month - a.month)
    
    const totalCount = months.reduce((sum, m) => sum + m.articles.length, 0)
    
    return {
      year: parseInt(year),
      count: totalCount,
      months
    }
  }).sort((a, b) => b.year - a.year)
}

// 检查是否管理员
export async function isAdmin() {
  const user = await getCurrentUser()
  return !! user
}

// 获取所有已发布文章
export async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
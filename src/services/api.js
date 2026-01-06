import { supabase, getCurrentUser } from '@/config/supabase'

// 获取所有文章
export async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 根据标签获取文章
export async function getArticlesByTag(tag) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('tag', tag)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

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
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) throw error
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
  return !!user
}
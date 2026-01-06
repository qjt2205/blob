
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // 保持登录状态
    autoRefreshToken: true, // 自动刷新 token
    detectSessionInUrl: true // 检测 URL 中的 session
  }
})

// 获取当前用户
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

// 邮箱密码登录
export const loginWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// 发送免密登录链接
export const loginWithMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// 登出
export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 注册用户
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

// 检查登录状态
export const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}
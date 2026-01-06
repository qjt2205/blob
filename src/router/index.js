import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { checkAuth } from '@/config/supabase'

// 路由守卫 - 检查管理员权限
const requireAdmin = async (to, from, next) => {
  const isAuthenticated = await checkAuth()
  if (isAuthenticated) {
    next()
  } else {
    next('/admin-login')
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BasicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('@/views/ArticlesView.vue')
        },
        {
          path: 'articles/:id',
          name: 'article',
          component: () => import('@/views/ArticleView.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue')
        },
        {
          path: 'archive',
          name: 'archive',
          component: () => import('@/views/ArchiveView.vue')
        }
      ]
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
      beforeEnter: requireAdmin
    },
    {
      path: '/admin-login',
      name: 'admin-login',
      component: () => import('@/views/AdminLoginView.vue')
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallback.vue')
    }
  ]
})

export default router
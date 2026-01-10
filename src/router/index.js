import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

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
          component: () => import('@/views/uipage/HomeView.vue')
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('@/views/uipage/ArticlesView.vue')
        },
        {
          path: 'articles/:id',
          name: 'article',
          component: () => import('@/views/uipage/ArticleView.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/uipage/AboutView.vue')
        },
        {
          path: 'archive',
          name: 'archive',
          component: () => import('@/views/uipage/ArchiveView.vue')
        }
      ]
    },
    {
      path: '/editor',
      name: 'editor-create',
      component: () => import('@/views/adminpage/EditorView.vue')
    },
    {
      path: '/editor/:id',
      name: 'editor-edit',
      component: () => import('@/views/adminpage/EditorView.vue')
    },
    {
      path: '/admin-login',
      name: 'admin-login',
      component: () => import('@/views/adminpage/AdminLoginView.vue')
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('@/views/adminpage/ChangePasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/adminpage/ResetPasswordView.vue')
    },
    {
      path: '/update-password',
      name: 'update-password',
      component: () => import('@/views/adminpage/UpdatePasswordView.vue')
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/adminpage/AuthCallback.vue')
    }
  ]
})

export default router
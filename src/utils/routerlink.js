// plugins/auto-router.js

import { useRouter, useRoute } from 'vue-router'

/**
 * 创建路由助手实例的工厂函数
 * 封装了常用的路由操作方法
 * @returns {Object} 路由助手对象，包含各种路由操作方法
 */
export const createRouterHelper = () => {
  // 注意：这个方法只能在setup函数或生命周期钩子中调用
  // 因为 useRouter 和 useRoute 必须在 setup 上下文中使用
  
  const router = useRouter()  // 获取 Vue Router 实例
  const route = useRoute()    // 获取当前路由信息（响应式）
  
  /**
   * 核心路由跳转方法
   * @param {string|Object} target - 跳转目标
   *   - 字符串类型：路由路径，如 '/user/profile'
   *   - 对象类型：完整路由配置，如 { name: 'User', params: { id: 1 } }
   * @param {Object} params - 查询参数（仅在target为字符串时生效）
   * @param {string} method - 路由跳转方式：'push' | 'replace'
   * @returns {Promise} 路由跳转的Promise
   */
  const to = (target, params = {}, method = 'push') => {
    // 根据target类型构造路由配置
    const routeConfig = typeof target === 'string' 
      ? { path: target, query: params }  // 路径字符串 + 查询参数
      : target                            // 直接使用路由配置对象
    
    // 调用路由实例的对应方法
    return router[method](routeConfig)
  }
  
  // 返回路由助手对象
  return {
    to,  // 跳转方法
    
    /**
     * 替换当前路由（不添加历史记录）
     * @param {string|Object} target - 跳转目标
     * @param {Object} params - 查询参数
     */
    replace: (target, params = {}) => to(target, params, 'replace'),
    
    /**
     * 路由历史导航
     * @param {number} delta - 前进/后退步数
     *   -1: 返回上一页
     *   1: 前进一页
     *   -2: 返回前两页
     */
    back: (delta = -1) => router.go(delta),
    
    /**
     * 跳转到首页
     * @returns {Promise}
     */
    home: () => to('/'),
    
    /**
     * 跳转到登录页
     * @param {string} redirectPath - 登录后重定向的路径
     * @returns {Promise}
     */
    toLogin: (redirectPath = '') => {
      const query = redirectPath ? { redirect: redirectPath } : {}
      return to({ path: '/login', query })
    },
    
    route,  // 当前路由对象（响应式）
    params: route.params,  // 当前路由的params参数
    query: route.query,    // 当前路由的query参数
    
    /**
     * 获取当前路由信息
     * @returns {Object} 当前路由对象
     */
    getRoute: () => route
  }
}

/**
 * 自动注入路由助手的Vue插件
 * 安装后，所有组件自动获得 routerHelper 实例
 */
export const autoRouterPlugin = {
  /**
   * Vue插件安装方法
   * @param {Object} app - Vue应用实例
   * @param {Object} options - 插件选项
   */
  install(app, options) {
    // 使用全局混入，为所有组件添加功能
    app.mixin({
      /**
       * 组件创建前的生命周期钩子
       * 在这里处理使用 Composition API (setup) 的组件
       */
      beforeCreate() {
        // 检查组件是否使用 setup 函数
        if (this.$options.setup) {
          // 保存原始的 setup 函数
          const originalSetup = this.$options.setup
          
          /**
           * 包装原始的 setup 函数
           * 在组件 setup 执行时自动注入 routerHelper
           */
          this.$options.setup = (props, ctx) => {
            // 1. 调用原始 setup 函数，获取其返回值
            const setupResult = originalSetup(props, ctx)
            
            // 2. 创建路由助手实例
            const routerHelper = createRouterHelper()
            
            // 3. 将 routerHelper 合并到 setup 的返回值中
            // 这样在组件模板和 setup 中就可以直接使用 routerHelper 了
            return {
              ...setupResult,   // 原始 setup 的返回值
              routerHelper      // 注入的路由助手
            }
          }
        }
      },
      
      /**
       * 组件创建后的生命周期钩子
       * 在这里处理使用 Options API 的组件
       */
      created() {
        // 如果不是使用 setup 的组件（即使用 Options API）
        if (!this.$options.setup) {
          // 将路由助手挂载到组件实例上
          this.$routerHelper = createRouterHelper()
        }
      }
    })
  }
}
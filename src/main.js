
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import naive from 'naive-ui'

// 引入全局样式
import './assets/styles/main.scss'


const app = createApp(App)

import { autoRouterPlugin } from '@/utils/routerlink'

app.use(createPinia())
app.use(autoRouterPlugin)
app.use(router)
app.use(naive)

app.mount('#app')

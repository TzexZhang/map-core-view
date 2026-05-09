/**
 * @file Vue 应用入口
 * @description MapCoreView SPA 入口，创建 Vue 3 应用并注册路由。
 *              SDK 的 CSS 由引擎内部自动注入（Plan C），无需手动 import。
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

/**
 * @file 路由配置
 * @description SPA 内部路由（HTML5 History 模式）。
 *              Qt 入口不在 SPA 路由内，而是独立的 HTML 文件（public/qt/*.html），
 *              通过侧边栏的 "Qt 专用页面" 按钮以 window.open() 方式打开。
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/2d/web' },

    // ==================== 2D 地图（OpenLayers）====================
    { path: '/2d/web', name: '2D-Web', component: () => import('@/views/2d/WebVue.vue') },
    { path: '/2d/html', name: '2D-HTML', component: () => import('@/views/2d/HtmlPage.vue') },

    // ==================== 3D 地球（Cesium）====================
    { path: '/3d/web', name: '3D-Web', component: () => import('@/views/3d/WebVue.vue') },
    { path: '/3d/html', name: '3D-HTML', component: () => import('@/views/3d/HtmlPage.vue') },

    // ==================== API 专题 ====================
    { path: '/api/layers', name: 'Layers', component: () => import('@/views/api/LayerPage.vue') },
    { path: '/api/events', name: 'Events', component: () => import('@/views/api/EventPage.vue') },
    { path: '/api/datasource', name: 'DataSource', component: () => import('@/views/api/DataSourcePage.vue') },
    { path: '/api/plugins', name: 'Plugins', component: () => import('@/views/api/PluginPage.vue') },
    { path: '/api/bridge', name: 'Bridge', component: () => import('@/views/api/BridgePage.vue') },
    { path: '/api/utils', name: 'Utils', component: () => import('@/views/api/UtilsPage.vue') },
  ],
})

export default router

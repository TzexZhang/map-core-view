<!--
  @file 应用根组件
  @description MapCoreView SPA 根布局。左侧导航栏 + 右侧路由视图。
               导航分为：2D / 3D / API 专题 / Qt 专用页面。
               Qt 页面以 window.open() 新窗口打开，不在 SPA 路由内。
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

interface NavSection {
  title: string
  items: { path?: string; label: string; icon: string; action?: () => void }[]
}

/** 打开 Qt 专用页面（新窗口） */
function openQt2D() {
  window.open('/qt/2d-qt.html', '_blank', 'width=1200,height=800')
}

function openQt3D() {
  window.open('/qt/3d-qt.html', '_blank', 'width=1200,height=800')
}

const navSections: NavSection[] = [
  {
    title: '2D 地图 (OpenLayers)',
    items: [
      { path: '/2d/web', label: 'Vue 3 框架', icon: '🟢' },
      { path: '/2d/html', label: '原生 HTML/JS', icon: '📄' },
      { label: 'Qt 专用页面 ↗', icon: '🖥️', action: openQt2D },
    ],
  },
  {
    title: '3D 地球 (Cesium)',
    items: [
      { path: '/3d/web', label: 'Vue 3 框架', icon: '🔵' },
      { path: '/3d/html', label: '原生 HTML/JS', icon: '📄' },
      { label: 'Qt 专用页面 ↗', icon: '🖥️', action: openQt3D },
    ],
  },
  {
    title: 'API 专题',
    items: [
      { path: '/api/layers', label: '图层管理', icon: '📚' },
      { path: '/api/events', label: '事件系统', icon: '⚡' },
      { path: '/api/datasource', label: '自定义数据源', icon: '💾' },
      { path: '/api/plugins', label: '插件系统', icon: '🔌' },
      { path: '/api/bridge', label: '跨端通信桥', icon: '🌉' },
      { path: '/api/utils', label: '工具函数', icon: '🔧' },
    ],
  },
]

function handleNav(item: { path?: string; action?: () => void }) {
  if (item.action) {
    item.action()
  } else if (item.path) {
    router.push(item.path)
  }
}

function isActive(path?: string): boolean {
  return !!path && route.path === path
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-header">
        <h2 v-if="sidebarOpen">MapCore View</h2>
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          {{ sidebarOpen ? '◀' : '▶' }}
        </button>
      </div>
      <nav class="nav-scroll">
        <div v-for="section in navSections" :key="section.title" class="nav-section">
          <div v-if="sidebarOpen" class="nav-section-title">{{ section.title }}</div>
          <div v-else class="nav-section-divider"></div>
          <button
            v-for="item in section.items"
            :key="item.label"
            class="nav-item"
            :class="{ active: isActive(item.path), 'qt-link': !!item.action }"
            @click="handleNav(item)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="sidebarOpen" class="nav-label">{{ item.label }}</span>
          </button>
        </div>
      </nav>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; color: #2c3e50; }
.app-layout { display: flex; height: 100vh; width: 100vw; }
.sidebar { width: 240px; background: #1a1a2e; color: #fff; display: flex; flex-direction: column; transition: width 0.3s ease; flex-shrink: 0; overflow: hidden; }
.sidebar.collapsed { width: 56px; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.sidebar-header h2 { font-size: 16px; white-space: nowrap; color: #00d2ff; }
.toggle-btn { background: none; border: none; color: #aaa; cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
.toggle-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-scroll { flex: 1; overflow-y: auto; padding: 4px 0; }
.nav-section { margin-bottom: 4px; }
.nav-section-title { font-size: 11px; color: #666; padding: 8px 16px 4px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.nav-section-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 6px 12px; }
.nav-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: none; background: transparent; color: #b0b0c0; cursor: pointer; font-size: 13px; text-align: left; white-space: nowrap; transition: all 0.2s; }
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(0, 210, 255, 0.15); color: #00d2ff; }
.nav-item.qt-link { color: #ff9f43; }
.nav-item.qt-link:hover { color: #ffc048; }
.nav-icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.nav-label { overflow: hidden; text-overflow: ellipsis; }
.main-content { flex: 1; overflow: auto; }
</style>

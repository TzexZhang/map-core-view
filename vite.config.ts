/**
 * @file Vite 构建配置
 * @description MapCoreView 项目构建配置。
 *              @geomapcore/sdk 通过 file: 协议安装，Vite 直接解析包的 dist 产物，
 *              无需手动配置路径别名。
 *              使用 SDK 内置的 mapEngineSetup() 插件自动处理 Cesium 静态资源。
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    /** Vue 3 SFC 编译支持 */
    vue(),
    /**
     * SDK 内置 Vite 插件 — 自动处理 Cesium 静态资源
     * @description 自动完成：
     *   1. 复制 Cesium Workers/Assets/ThirdParty/Widgets 到输出目录
     *   2. 定义 CESIUM_BASE_URL 全局变量
     *   3. 无需手动安装 vite-plugin-static-copy
     *
     * 注意：vite.config.ts 中别名尚未生效，必须直接从 node_modules 导入
     */
    (await import("@geomapcore/sdk/vite")).mapEngineSetup(),
  ],

  /** 路径别名 — 仅保留项目内部路径 */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  /** 开发服务器配置 */
  server: {
    port: 3000,
    open: true,
  },
});

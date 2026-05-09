# MapCore View

MapCore SDK 全平台示例项目，按 2D/3D × 平台维度组织，覆盖 SDK 全部公共 API。

## 架构

项目采用 **混合 MPA + SPA** 方案：

| 部分 | 技术实现 | 说明 |
|------|---------|------|
| **SPA 主应用** | Vue 3 + Vue Router（History 模式）+ 左侧导航栏 | 覆盖 2D/3D Web 框架、HTML 原生、API 专题 |
| **Qt 独立页面** | 纯 HTML（`public/qt/*.html`），不经过 Vite 构建 | Qt 通过 `QWebEngineView::load(QUrl)` 直接加载 |

SPA 侧边栏中的 **Qt 专用页面** 按钮以 `window.open()` 新窗口打开 Qt HTML。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认端口 3000）
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 项目结构

```
MapCoreView/
├── index.html                         # SPA 入口
├── package.json
├── vite.config.ts                     # mapEngineSetup() 自动处理 Cesium 资源
├── tsconfig.json
├── public/qt/
│   ├── 2d-qt.html                     # Qt 2D 独立页面（纯 HTML，覆盖全部 SDK API）
│   └── 3d-qt.html                     # Qt 3D 独立页面（纯 HTML，覆盖全部 SDK API）
└── src/
    ├── main.ts                        # Vue 应用入口
    ├── App.vue                        # 根布局（侧边栏 + router-view + Qt 入口按钮）
    ├── router/index.ts                # SPA 路由配置
    ├── shared/sampleData.ts           # GeoJSON 示例数据
    └── views/
        ├── 2d/
        │   ├── WebVue.vue             # 2D Vue 3 框架（覆盖全部 SDK API）
        │   └── HtmlPage.vue           # 2D 原生 HTML/JS（getElementById）
        ├── 3d/
        │   ├── WebVue.vue             # 3D Vue 3 框架（覆盖全部 SDK API）
        │   └── HtmlPage.vue           # 3D 原生 HTML/JS（getElementById）
        └── api/
            ├── LayerPage.vue          # 图层管理（全类型 CRUD + 分组 + 导出导入）
            ├── EventPage.vue          # 事件系统（on/once/off + 11 个事件常量）
            ├── DataSourcePage.vue     # 自定义数据源（ICustomDataSource 全生命周期）
            ├── PluginPage.vue         # 插件系统（IPlugin + PluginContext + 依赖校验）
            ├── BridgePage.vue         # 跨端通信桥（BridgeFactory 全部 API）
            └── UtilsPage.vue          # 工具函数（坐标/颜色/日志）
```

## 路由

### SPA 路由

| 路径 | 说明 |
|------|------|
| `/` | 重定向到 `/2d/web` |
| `/2d/web` | 2D Vue 3 框架集成（覆盖全部 SDK API） |
| `/2d/html` | 2D 原生 HTML/JS |
| `/3d/web` | 3D Vue 3 框架集成（覆盖全部 SDK API） |
| `/3d/html` | 3D 原生 HTML/JS |
| `/api/layers` | 图层管理专题 |
| `/api/events` | 事件系统专题 |
| `/api/datasource` | 自定义数据源专题 |
| `/api/plugins` | 插件系统专题 |
| `/api/bridge` | 跨端通信桥专题 |
| `/api/utils` | 工具函数专题 |

### Qt 独立页面

| URL | 说明 |
|-----|------|
| `/qt/2d-qt.html` | Qt 2D（纯 HTML，覆盖全部 SDK API + Bridge 通信） |
| `/qt/3d-qt.html` | Qt 3D（纯 HTML，覆盖全部 SDK API + Bridge 通信） |

## SDK API 覆盖

### 生命周期

- `MapController.create(options)` — 创建地图实例
- `MapController.destroy()` — 销毁地图实例

### 图层操作

- `addLayer(config, groupId?)` — 添加单个图层
- `addLayers(configs, groupId)` — 批量添加图层（支持分组）
- `removeLayer(layerId)` — 移除图层
- `setLayerVisible(layerId, visible)` — 设置可见性
- `setLayerOpacity(layerId, opacity)` — 设置透明度（0~1）
- `updateLayerData(layerId, geoJSON)` — 更新矢量图层数据
- `setGroupVisible(groupId, visible)` — 按分组批量控制可见性
- `getLayerState(layerId)` — 获取单个图层状态
- `getLayerStates()` — 获取所有图层状态
- `exportLayerConfigs()` — 导出图层配置（持久化）
- `importLayerConfigs(configs)` — 从配置恢复图层

### 视图控制

- `setView(options)` — 设置视图（center / zoom / rotation / pitch / heading）
- `getView()` — 获取当前视图
- `flyTo(options)` — 飞行动画（center / zoom / duration）
- `getBounds()` — 获取可视范围

### 事件系统

- `on(event, handler)` — 订阅事件，返回取消订阅函数
- `once(event, handler)` — 订阅一次性事件
- 事件常量：`MAP_CLICK` / `MAP_DBLCLICK` / `MAP_POINTERMOVE` / `MAP_MOVEEND` / `MAP_CONTEXTMENU` / `FEATURE_CLICK` / `FEATURE_HOVER` / `LAYER_ADD` / `LAYER_REMOVE` / `datasource:update` / `system:ready`

### 自定义数据源

- `registerCustomDataSource(source)` — 注册（实现 `ICustomDataSource` 接口）
- `fetchFromCustomSource(sourceId)` — 手动拉取数据
- `startCustomDataSource(id, interval)` — 启动定时自动拉取
- `stopCustomDataSource(id)` — 停止定时拉取
- `unregisterCustomDataSource(id)` — 注销数据源

### 插件系统

- `use(plugin)` — 安装插件（实现 `IPlugin` 接口，支持异步 + 依赖校验）
- `unuse(pluginName)` — 卸载插件
- `PluginContext` 提供 `logger` / `eventBus` / `map`

### 跨端通信桥

- `BridgeFactory.detectEnvironment()` — 检测运行环境
- `BridgeFactory.detect()` — 创建对应环境的通信桥
- `bridge.send(method, params)` — 向宿主端发送消息
- `bridge.receive(callback)` — 接收宿主端消息
- `bridge.destroy()` — 销毁通信桥
- 环境枚举：`QtWebChannel` / `Android` / `IOS` / `PostMessage` / `Browser`

### 工具函数

- `isValidLngLat(lngLat)` — 校验经纬度有效性
- `distance(from, to)` — 两点间距离（米）
- `bearing(from, to)` — 两点间方位角（度）
- `parseColor(colorStr)` — 解析颜色为 RGBA
- `withAlpha(colorStr, alpha)` — 设置颜色透明度

### 底层访问

- `getNativeInstance()` — 获取底层引擎实例（OL Map / Cesium Viewer）
- `getEventBus()` — 获取事件总线实例

## Qt 集成

Qt 通过 `QWebEngineView` 加载独立 HTML 文件：

```cpp
// 加载线上部署的 HTML
webView->load(QUrl("http://192.168.10.5:3000/qt/2d-qt.html"));

// 加载本地构建产物
webView->load(QUrl::fromLocalFile("C:/app/web/qt/2d-qt.html"));
```

Qt 页面特点：
- 纯 HTML，无框架依赖，首屏加载快
- SDK 通过 CDN 或内网服务器加载
- `BridgeFactory.detectEnvironment()` 自动识别 Qt 环境
- Cesium 静态资源通过 CDN 加载（生产环境建议部署到内网）

## 依赖说明

| 包 | 说明 |
|----|------|
| `@geomapcore/sdk` | MapCore SDK 聚合包，导出全部公共 API |
| `ol` | OpenLayers（2D 地图引擎），SDK 的 peerDependency |
| `cesium` | CesiumJS（3D 地球引擎），SDK 的 peerDependency |
| `vue` / `vue-router` | SPA 框架 |
| `vite` + `@vitejs/plugin-vue` | 构建工具 |

SDK 的 CSS 由引擎内部自动注入（Plan C），无需手动引入 `ol/ol.css` 或 `cesium/widgets.css`。

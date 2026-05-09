<!--
  @file 2D 地图 - Vue 3 框架集成
  @description 在 Vue 3 中使用 @geomapcore/sdk 的 OpenLayers 2D 全部 API。
               覆盖：生命周期、图层操作、视图控制、事件系统、自定义数据源、插件系统、工具函数、底层访问。
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import {
  MapController,
  EngineType,
  LayerType,
  MapEvents,
  isValidLngLat,
  distance,
  bearing,
  parseColor,
  withAlpha,
  BridgeFactory,
} from '@geomapcore/sdk'
import type { IPlugin, PluginContext, ICustomDataSource, GeoJSONFeatureCollection } from '@geomapcore/sdk'
import { SAMPLE_GEOJSON_POINTS, SAMPLE_GEOJSON_LINES, SAMPLE_GEOJSON_POLYGONS } from '@/shared/sampleData'

/** 地图容器 DOM 引用 */
const mapContainer = ref<HTMLDivElement>()
/** 状态栏文本 */
const status = ref('未创建')
/** 地图控制器实例 */
let map: MapController | null = null

/** 日志输出：控制台 + 状态栏 */
const log = (...args: unknown[]) => {
  console.log('[2D-Web]', ...args)
  status.value = args.map(String).join(' ')
}

/** 创建 2D 地图 */
async function handleCreate() {
  try {
    log('正在创建 2D 地图...')
    map = await MapController.create({
      container: mapContainer.value!,
      engine: EngineType.OpenLayers,
      initialView: { center: [116.397428, 39.90923], zoom: 10 },
      debug: { enabled: true, logLevel: 'DEBUG', logAllEvents: false },
    })
    log('2D 地图创建成功')
  } catch (e) { log('创建失败:', e) }
}

/** 销毁地图 */
function handleDestroy() { map?.destroy(); map = null; log('已销毁') }

/** 添加矢量点图层 */
function handleAddVector() {
  if (!map) return
  map.addLayer({ id: 'points', type: LayerType.Vector })
  map.updateLayerData('points', SAMPLE_GEOJSON_POINTS)
  log('矢量点图层已添加')
}

/** 添加矢量线图层 */
function handleAddLine() {
  if (!map) return
  map.addLayer({ id: 'lines', type: LayerType.Vector })
  map.updateLayerData('lines', SAMPLE_GEOJSON_LINES)
  log('矢量线图层已添加')
}

/** 添加矢量面图层 */
function handleAddPolygon() {
  if (!map) return
  map.addLayer({ id: 'polygons', type: LayerType.Vector })
  map.updateLayerData('polygons', SAMPLE_GEOJSON_POLYGONS)
  log('矢量面图层已添加')
}

/** 添加热力图 */
function handleAddHeatmap() {
  if (!map) return
  map.addLayer({ id: 'heatmap', type: LayerType.Heatmap })
  map.updateLayerData('heatmap', SAMPLE_GEOJSON_POINTS)
  log('热力图已添加')
}

/** 添加瓦片图层 */
function handleAddTile() {
  if (!map) return
  map.addLayer({ id: 'custom-tile', type: LayerType.Tile, url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' })
  log('瓦片图层已添加')
}

/** 移除 points 图层 */
function handleRemoveLayer() { if (!map) return; map.removeLayer('points'); log('points 已移除') }

/** 切换可见性 */
function handleToggleVisible() {
  if (!map) return
  const s = map.getLayerState('points')
  if (s) { map.setLayerVisible('points', !s.visible); log('points 可见:', !s.visible) }
}

/** 设置透明度 */
function handleSetOpacity() { if (!map) return; map.setLayerOpacity('points', 0.5); log('points 透明度: 0.5') }

/** 获取全部图层状态 */
function handleGetLayerStates() {
  if (!map) return
  const states = map.getLayerStates()
  log('图层:', JSON.stringify(states.map(s => ({ id: s.config.id, visible: s.visible, opacity: s.opacity }))))
}

/** 导出图层配置 */
function handleExportConfigs() {
  if (!map) return
  const configs = map.exportLayerConfigs()
  log('导出:', JSON.stringify(configs.map(c => ({ id: c.id, type: c.type }))))
}

/** 飞行到上海 */
function handleFlyTo() { if (!map) return; map.flyTo({ center: [121.473, 31.23], zoom: 12, duration: 2000 }); log('飞行到上海') }

/** 跳转到成都（带旋转） */
function handleSetView() { if (!map) return; map.setView({ center: [104.066, 30.572], zoom: 8, rotation: 0.5 }); log('跳转到成都') }

/** 获取当前视图 */
function handleGetView() { if (!map) return; log('视图:', JSON.stringify(map.getView())) }

/** 获取可视范围 */
function handleGetBounds() { if (!map) return; log('范围:', JSON.stringify(map.getBounds())) }

/** 订阅事件 */
function handleSubscribeEvents() {
  if (!map) return
  map.on(MapEvents.MAP_CLICK, (p: any) => log('地图点击:', p))
  map.on(MapEvents.MAP_MOVEEND, (p: any) => log('视图变化:', p))
  map.on(MapEvents.FEATURE_CLICK, (p: any) => log('要素点击:', p))
  map.on(MapEvents.LAYER_ADD, (p: any) => log('图层添加:', p))
  log('已订阅 map:click / moveend / feature:click / layer:add')
}

/** 注册自定义数据源 */
function handleRegisterDataSource() {
  if (!map) return
  let counter = 0
  const source: ICustomDataSource = {
    id: 'mock-targets',
    async fetch(): Promise<GeoJSONFeatureCollection> {
      counter++
      return { type: 'FeatureCollection', features: SAMPLE_GEOJSON_POINTS.features.map((f: any) => ({ ...f, properties: { ...f.properties, counter } })) }
    },
    dispose() {},
  }
  map.registerCustomDataSource(source)
  log('自定义数据源已注册')
}

/** 拉取数据 */
async function handleFetchFromSource() {
  if (!map) return
  const data = await map.fetchFromCustomSource('mock-targets')
  log('拉取到:', data.features.length, '个要素')
}

/** 启动定时刷新 */
function handleStartDataSource() { if (!map) return; map.startCustomDataSource('mock-targets', 3000); log('定时刷新已启动 (3s)') }

/** 停止定时刷新 */
function handleStopDataSource() { if (!map) return; map.stopCustomDataSource('mock-targets'); log('定时刷新已停止') }

/** 注销数据源 */
function handleUnregisterDataSource() { if (!map) return; map.unregisterCustomDataSource('mock-targets'); log('数据源已注销') }

/** 安装示例插件 */
function handleUsePlugin() {
  if (!map) return
  const plugin: IPlugin = {
    name: 'DemoPlugin', version: '1.0.0',
    install(ctx: PluginContext) {
      ctx.logger.info('DemoPlugin', '插件已安装')
      ctx.eventBus.on(MapEvents.MAP_CLICK, (p: any) => ctx.logger.info('DemoPlugin', '点击:', p))
    },
    uninstall() {},
  }
  map.use(plugin)
  log('DemoPlugin 已安装')
}

/** 卸载插件 */
function handleUnusePlugin() { if (!map) return; map.unuse('DemoPlugin'); log('DemoPlugin 已卸载') }

/** 工具函数演示 */
function handleUtils() {
  const v = isValidLngLat([116.397, 39.909])
  const d = distance([116.397, 39.909], [121.473, 31.23])
  const b = bearing([116.397, 39.909], [121.473, 31.23])
  const c = parseColor('#ff0000')
  const a = withAlpha('#ff0000', 0.5)
  const env = BridgeFactory.detectEnvironment()
  log(`valid=${v} dist=${(d/1000).toFixed(2)}km bearing=${b.toFixed(2)}° color=${JSON.stringify(c)} alpha=${a} env=${env}`)
}

/** 获取底层引擎实例 */
function handleGetNative() { if (!map) return; const ol = map.getNativeInstance(); log('OL Map:', ol?.constructor?.name ?? typeof ol) }

/** 获取事件总线 */
function handleGetEventBus() { if (!map) return; const bus = map.getEventBus(); log('EventBus:', bus?.constructor?.name ?? typeof bus) }

onBeforeUnmount(() => { map?.destroy(); map = null })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header">
      <h2>2D 地图 - Vue 3 框架集成</h2>
      <p class="desc">在 Vue 3 中使用 @geomapcore/sdk 的 OpenLayers 2D 全部 API</p>
    </div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>生命周期</legend>
          <button @click="handleCreate">create()</button>
          <button @click="handleDestroy">destroy()</button>
        </fieldset>
        <fieldset><legend>图层操作</legend>
          <button @click="handleAddVector">矢量点</button>
          <button @click="handleAddLine">矢量线</button>
          <button @click="handleAddPolygon">矢量面</button>
          <button @click="handleAddHeatmap">热力图</button>
          <button @click="handleAddTile">瓦片图层</button>
          <button @click="handleRemoveLayer">移除 points</button>
          <button @click="handleToggleVisible">切换可见性</button>
          <button @click="handleSetOpacity">透明度 0.5</button>
          <button @click="handleGetLayerStates">获取所有状态</button>
          <button @click="handleExportConfigs">导出配置</button>
        </fieldset>
        <fieldset><legend>视图控制</legend>
          <button @click="handleFlyTo">flyTo 上海</button>
          <button @click="handleSetView">setView 成都</button>
          <button @click="handleGetView">getView()</button>
          <button @click="handleGetBounds">getBounds()</button>
        </fieldset>
        <fieldset><legend>事件系统</legend>
          <button @click="handleSubscribeEvents">订阅事件</button>
        </fieldset>
        <fieldset><legend>自定义数据源</legend>
          <button @click="handleRegisterDataSource">注册</button>
          <button @click="handleFetchFromSource">拉取数据</button>
          <button @click="handleStartDataSource">启动定时 3s</button>
          <button @click="handleStopDataSource">停止定时</button>
          <button @click="handleUnregisterDataSource">注销</button>
        </fieldset>
        <fieldset><legend>插件系统</legend>
          <button @click="handleUsePlugin">安装 DemoPlugin</button>
          <button @click="handleUnusePlugin">卸载 DemoPlugin</button>
        </fieldset>
        <fieldset><legend>工具函数 / 底层</legend>
          <button @click="handleUtils">工具函数</button>
          <button @click="handleGetNative">getNativeInstance()</button>
          <button @click="handleGetEventBus">getEventBus()</button>
        </fieldset>
      </div>
      <div class="map-area">
        <div ref="mapContainer" class="map-container"></div>
        <div class="status-bar">{{ status }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-page { display: flex; flex-direction: column; height: 100%; padding: 12px; }
.demo-header h2 { font-size: 18px; margin-bottom: 4px; }
.desc { font-size: 13px; color: #666; margin-bottom: 12px; }
.demo-body { display: flex; gap: 12px; flex: 1; min-height: 0; }
.control-panel { width: 280px; overflow-y: auto; flex-shrink: 0; }
.control-panel fieldset { border: 1px solid #ddd; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
.control-panel legend { font-size: 13px; font-weight: bold; padding: 0 4px; color: #333; }
.control-panel button { display: inline-block; margin: 3px; padding: 4px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; }
.control-panel button:hover { background: #e8f0fe; border-color: #4285f4; }
.map-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid #ddd; border-radius: 6px; min-height: 400px; }
.status-bar { padding: 6px 10px; font-size: 12px; color: #555; background: #f8f9fa; border-top: 1px solid #eee; border-radius: 0 0 6px 6px; max-height: 60px; overflow-y: auto; word-break: break-all; }
</style>

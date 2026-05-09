<!--
  @file 3D 地球 - Vue 3 框架集成
  @description 在 Vue 3 中使用 @geomapcore/sdk 的 Cesium 3D 全部 API。
               含 pitch/heading 3D 专属视图参数。
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import {
  MapController, EngineType, LayerType, MapEvents,
  isValidLngLat, distance, bearing, parseColor, withAlpha, BridgeFactory,
} from '@geomapcore/sdk'
import type { IPlugin, PluginContext, ICustomDataSource, GeoJSONFeatureCollection } from '@geomapcore/sdk'
import { SAMPLE_GEOJSON_POINTS, SAMPLE_GEOJSON_LINES, SAMPLE_GEOJSON_POLYGONS } from '@/shared/sampleData'

const mapContainer = ref<HTMLDivElement>()
const status = ref('未创建')
let map: MapController | null = null

const log = (...args: unknown[]) => { console.log('[3D-Web]', ...args); status.value = args.map(String).join(' ') }

/** 创建 3D 地球 */
async function handleCreate() {
  try {
    log('正在创建 3D 地球...')
    map = await MapController.create({
      container: mapContainer.value!,
      engine: EngineType.Cesium,
      initialView: { center: [116.397428, 39.90923], zoom: 10, pitch: -45, heading: 0 },
      debug: { enabled: true, logLevel: 'DEBUG', logAllEvents: false },
    })
    log('3D 地球创建成功')
  } catch (e) { log('创建失败:', e) }
}

function handleDestroy() { map?.destroy(); map = null; log('已销毁') }

function handleAddVector() {
  if (!map) return
  map.addLayer({ id: 'points-3d', type: LayerType.Vector })
  map.updateLayerData('points-3d', SAMPLE_GEOJSON_POINTS)
  log('3D 矢量点已添加')
}

function handleAddLine() {
  if (!map) return
  map.addLayer({ id: 'lines-3d', type: LayerType.Vector })
  map.updateLayerData('lines-3d', SAMPLE_GEOJSON_LINES)
  log('3D 矢量线已添加')
}

function handleAddPolygon() {
  if (!map) return
  map.addLayer({ id: 'polygons-3d', type: LayerType.Vector })
  map.updateLayerData('polygons-3d', SAMPLE_GEOJSON_POLYGONS)
  log('3D 矢量面已添加')
}

function handleRemoveLayer() { if (!map) return; map.removeLayer('points-3d'); log('points-3d 已移除') }
function handleToggleVisible() { if (!map) return; const s = map.getLayerState('points-3d'); if (s) { map.setLayerVisible('points-3d', !s.visible); log('可见:', !s.visible) } }
function handleSetOpacity() { if (!map) return; map.setLayerOpacity('points-3d', 0.5); log('透明度: 0.5') }
function handleGetLayerStates() { if (!map) return; const s = map.getLayerStates(); log('图层:', JSON.stringify(s.map(x => ({ id: x.config.id, visible: x.visible })))) }
function handleFlyTo() { if (!map) return; map.flyTo({ center: [121.473, 31.23], zoom: 12, duration: 2000 }); log('飞行到上海') }
function handleSetView() { if (!map) return; map.setView({ center: [104.066, 30.572], zoom: 8, pitch: -60, heading: 30 }); log('跳转成都 (pitch=-60, heading=30)') }
function handleGetView() { if (!map) return; log('视图:', JSON.stringify(map.getView())) }
function handleGetBounds() { if (!map) return; log('范围:', JSON.stringify(map.getBounds())) }

function handleSubscribeEvents() {
  if (!map) return
  map.on(MapEvents.MAP_CLICK, p => log('点击:', p))
  map.on(MapEvents.MAP_MOVEEND, () => log('视图变化'))
  map.on(MapEvents.FEATURE_CLICK, p => log('要素点击:', p))
  log('已订阅 click / moveend / feature:click')
}

function handleRegisterDataSource() {
  if (!map) return
  let counter = 0
  map.registerCustomDataSource({
    id: 'mock-3d',
    async fetch(): Promise<GeoJSONFeatureCollection> { counter++; return { type: 'FeatureCollection', features: SAMPLE_GEOJSON_POINTS.features.map(f => ({ ...f, properties: { ...f.properties, counter } })) } },
    dispose() {},
  })
  log('3D 数据源已注册')
}

function handleStartDataSource() { if (!map) return; map.startCustomDataSource('mock-3d', 3000); log('定时 3s 已启动') }
function handleStopDataSource() { if (!map) return; map.stopCustomDataSource('mock-3d'); log('定时已停止') }

function handleUsePlugin() {
  if (!map) return
  map.use({ name: 'Demo3DPlugin', version: '1.0.0', install(ctx: PluginContext) { ctx.logger.info('Demo3D', '已安装'); ctx.eventBus.on(MapEvents.MAP_CLICK, p => ctx.logger.info('Demo3D', p)) }, uninstall() {} })
  log('Demo3DPlugin 已安装')
}

function handleUnusePlugin() { if (!map) return; map.unuse('Demo3DPlugin'); log('已卸载') }

function handleUtils() {
  const v = isValidLngLat([116.397, 39.909])
  const d = distance([116.397, 39.909], [121.473, 31.23])
  const b = bearing([116.397, 39.909], [121.473, 31.23])
  log(`valid=${v} dist=${(d/1000).toFixed(2)}km bearing=${b.toFixed(2)}°`)
}

function handleGetNative() { if (!map) return; const v = map.getNativeInstance(); log('Viewer:', v?.constructor?.name ?? typeof v) }

onBeforeUnmount(() => { map?.destroy() })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header">
      <h2>3D 地球 - Vue 3 框架集成</h2>
      <p class="desc">在 Vue 3 中使用 @geomapcore/sdk 的 Cesium 3D 全部 API</p>
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
          <button @click="handleRemoveLayer">移除 points-3d</button>
          <button @click="handleToggleVisible">切换可见性</button>
          <button @click="handleSetOpacity">透明度 0.5</button>
          <button @click="handleGetLayerStates">获取所有状态</button>
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
          <button @click="handleStartDataSource">启动定时 3s</button>
          <button @click="handleStopDataSource">停止定时</button>
        </fieldset>
        <fieldset><legend>插件系统</legend>
          <button @click="handleUsePlugin">安装 Demo3DPlugin</button>
          <button @click="handleUnusePlugin">卸载</button>
        </fieldset>
        <fieldset><legend>工具函数 / 底层</legend>
          <button @click="handleUtils">工具函数</button>
          <button @click="handleGetNative">getNativeInstance()</button>
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

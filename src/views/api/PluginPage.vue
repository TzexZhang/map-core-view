<!--
  @file 插件系统 API 专题
  @description 演示 IPlugin 接口 / use / unuse / 依赖校验 / PluginContext 能力
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { MapController, EngineType, LayerType, MapEvents, distance } from '@geomapcore/sdk'
import type { IPlugin, PluginContext } from '@geomapcore/sdk'
import { SAMPLE_GEOJSON_POINTS } from '@/shared/sampleData'

const mapContainer = ref<HTMLDivElement>()
const status = ref('未创建')
const pluginStatus = ref('')
let map: MapController | null = null

const log = (...args: unknown[]) => { console.log('[Plugin]', ...args); status.value = args.map(String).join(' ') }

async function handleCreate() {
  map = await MapController.create({ container: mapContainer.value!, engine: EngineType.OpenLayers, initialView: { center: [116.397428, 39.90923], zoom: 10 } })
  map.addLayer({ id: 'targets', type: LayerType.Vector }); map.updateLayerData('targets', SAMPLE_GEOJSON_POINTS)
  log('地图已创建')
}

function handleInstallMeasure() {
  if (!map) return
  let points: [number, number][] = []
  map.use({ name: 'MeasureTool', version: '1.0.0', install(ctx: PluginContext) { ctx.eventBus.on(MapEvents.MAP_CLICK, (p: any) => { points.push(p.lngLat); pluginStatus.value = `MeasureTool: 已采集 ${points.length} 个点`; if (points.length === 2) { const d = distance(points[0], points[1]); pluginStatus.value = `MeasureTool: 距离 = ${(d/1000).toFixed(2)} km`; points = [] } }) }, uninstall() {} })
  log('MeasureTool 已安装 - 点击两点测量距离')
}

function handleInstallLogger() {
  if (!map) return
  map.use({ name: 'EventLogger', version: '1.0.0', install(ctx: PluginContext) { ctx.eventBus.on(MapEvents.MAP_CLICK, p => ctx.logger.info('Logger', p)); pluginStatus.value = 'EventLogger: 已订阅 click' }, uninstall() {} })
  log('EventLogger 已安装')
}

function handleInstallDependent() {
  if (!map) return
  map.use({ name: 'AdvancedMeasure', version: '1.0.0', dependencies: ['MeasureTool'], install() { pluginStatus.value = 'AdvancedMeasure: 安装成功' }, uninstall() {} })
    .then(() => log('AdvancedMeasure 已安装')).catch(e => log('安装失败:', e.message))
}

function handleUnuseMeasure() { if (!map) return; map.unuse('MeasureTool'); log('MeasureTool 已卸载') }
function handleUnuseLogger() { if (!map) return; map.unuse('EventLogger'); log('EventLogger 已卸载') }
function handleDestroy() { map?.destroy(); map = null; pluginStatus.value = ''; log('已销毁') }

onBeforeUnmount(() => { map?.destroy() })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header"><h2>插件系统</h2><p class="desc">IPlugin / use / unuse / 依赖校验</p></div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>创建</legend><button @click="handleCreate">create()</button><button @click="handleDestroy">destroy()</button></fieldset>
        <fieldset><legend>插件管理</legend>
          <button @click="handleInstallMeasure">安装 MeasureTool</button><button @click="handleInstallLogger">安装 EventLogger</button>
          <button @click="handleInstallDependent">安装 AdvancedMeasure (依赖 MeasureTool)</button>
          <button @click="handleUnuseMeasure">卸载 MeasureTool</button><button @click="handleUnuseLogger">卸载 EventLogger</button>
        </fieldset>
        <fieldset><legend>插件状态</legend><p class="info">{{ pluginStatus || '无插件运行' }}</p></fieldset>
      </div>
      <div class="map-area"><div ref="mapContainer" class="map-container"></div><div class="status-bar">{{ status }}</div></div>
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
.info { font-size: 12px; color: #333; margin-top: 4px; word-break: break-all; }
.map-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid #ddd; border-radius: 6px; min-height: 400px; }
.status-bar { padding: 6px 10px; font-size: 12px; color: #555; background: #f8f9fa; border-top: 1px solid #eee; border-radius: 0 0 6px 6px; max-height: 60px; overflow-y: auto; word-break: break-all; }
</style>

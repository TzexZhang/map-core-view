<!--
  @file 自定义数据源 API 专题
  @description 演示 ICustomDataSource 全部 API：registerCustomDataSource/fetchFromCustomSource/startCustomDataSource/stopCustomDataSource/unregisterCustomDataSource
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { MapController, EngineType, LayerType } from '@geomapcore/sdk'
import type { ICustomDataSource, GeoJSONFeatureCollection } from '@geomapcore/sdk'
import { SAMPLE_GEOJSON_POINTS } from '@/shared/sampleData'

const mapContainer = ref<HTMLDivElement>()
const status = ref('未创建')
let map: MapController | null = null

const log = (...args: unknown[]) => { console.log('[DataSource]', ...args); status.value = args.map(String).join(' ') }

async function handleCreate() {
  map = await MapController.create({ container: mapContainer.value!, engine: EngineType.OpenLayers, initialView: { center: [116.397428, 39.90923], zoom: 10 } })
  map.addLayer({ id: 'ds-targets', type: LayerType.Vector })
  map.on('datasource:update', (payload: any) => log('datasource:update:', payload.sourceId, payload.data?.features?.length, '个要素'))
  log('地图已创建，ds-targets 图层已添加')
}

function handleRegister() {
  if (!map) return
  let counter = 0
  const source: ICustomDataSource = {
    id: 'mock-api',
    async fetch(): Promise<GeoJSONFeatureCollection> { counter++; return { type: 'FeatureCollection', features: SAMPLE_GEOJSON_POINTS.features.map((f: any) => ({ ...f, properties: { ...f.properties, counter, timestamp: Date.now() } })) } },
    dispose() {},
  }
  map.registerCustomDataSource(source)
  log('数据源 mock-api 已注册')
}

async function handleFetch() { if (!map) return; const d = await map.fetchFromCustomSource('mock-api'); map.updateLayerData('ds-targets', d); log('拉取成功:', d.features.length, '个要素') }
function handleStart() { if (!map) return; map.startCustomDataSource('mock-api', 2000); log('定时刷新已启动 (2s)') }
function handleStop() { if (!map) return; map.stopCustomDataSource('mock-api'); log('定时刷新已停止') }
function handleUnregister() { if (!map) return; map.unregisterCustomDataSource('mock-api'); log('数据源已注销') }
function handleDestroy() { map?.destroy(); map = null; log('已销毁') }

onBeforeUnmount(() => { map?.destroy() })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header"><h2>自定义数据源</h2><p class="desc">ICustomDataSource 全部 API</p></div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>创建</legend><button @click="handleCreate">create() + 添加图层</button><button @click="handleDestroy">destroy()</button></fieldset>
        <fieldset><legend>数据源操作</legend>
          <button @click="handleRegister">registerCustomDataSource</button><button @click="handleFetch">fetchFromCustomSource</button>
          <button @click="handleStart">startCustomDataSource (2s)</button><button @click="handleStop">stopCustomDataSource</button>
          <button @click="handleUnregister">unregisterCustomDataSource</button>
        </fieldset>
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
.map-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid #ddd; border-radius: 6px; min-height: 400px; }
.status-bar { padding: 6px 10px; font-size: 12px; color: #555; background: #f8f9fa; border-top: 1px solid #eee; border-radius: 0 0 6px 6px; max-height: 60px; overflow-y: auto; word-break: break-all; }
</style>

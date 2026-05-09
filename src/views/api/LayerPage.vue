<!--
  @file 图层管理 API 专题
  @description 演示全部图层 CRUD API：addLayer/addLayers/removeLayer/setLayerVisible/setLayerOpacity/updateLayerData/setGroupVisible/getLayerState/getLayerStates/exportLayerConfigs/importLayerConfigs
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { MapController, EngineType, LayerType, MapEvents } from '@geomapcore/sdk'
import { SAMPLE_GEOJSON_POINTS, SAMPLE_GEOJSON_LINES, SAMPLE_GEOJSON_POLYGONS } from '@/shared/sampleData'

const mapContainer = ref<HTMLDivElement>()
const status = ref('未创建')
const layerList = ref('')
let map: MapController | null = null

const log = (...args: unknown[]) => { console.log('[Layer]', ...args); status.value = args.map(String).join(' ') }

function refreshList() {
  if (!map) return
  const states = map.getLayerStates()
  layerList.value = states.map(s => `${s.config.id} (${s.config.type}) vis=${s.visible} op=${s.opacity}`).join('\n')
}

async function handleCreate() {
  map = await MapController.create({ container: mapContainer.value!, engine: EngineType.OpenLayers, initialView: { center: [116.397428, 39.90923], zoom: 10 } })
  map.on(MapEvents.LAYER_ADD, refreshList); map.on(MapEvents.LAYER_REMOVE, refreshList)
  log('地图已创建')
}

function handleAddTile() { if (!map) return; map.addLayer({ id: 'osm-tile', type: LayerType.Tile, url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }); log('Tile 已添加') }
function handleAddVector() { if (!map) return; map.addLayer({ id: 'vec-points', type: LayerType.Vector }); map.updateLayerData('vec-points', SAMPLE_GEOJSON_POINTS); log('Vector 点已添加') }
function handleAddLine() { if (!map) return; map.addLayer({ id: 'vec-lines', type: LayerType.Vector }); map.updateLayerData('vec-lines', SAMPLE_GEOJSON_LINES); log('Vector 线已添加') }
function handleAddPolygon() { if (!map) return; map.addLayer({ id: 'vec-polygons', type: LayerType.Vector }); map.updateLayerData('vec-polygons', SAMPLE_GEOJSON_POLYGONS); log('Vector 面已添加') }
function handleAddHeatmap() { if (!map) return; map.addLayer({ id: 'heatmap', type: LayerType.Heatmap }); map.updateLayerData('heatmap', SAMPLE_GEOJSON_POINTS); log('Heatmap 已添加') }

function handleBatchAdd() {
  if (!map) return
  const ids = map.addLayers([{ id: 'batch-1', type: LayerType.Vector }, { id: 'batch-2', type: LayerType.Vector }], 'batch-group')
  map.updateLayerData('batch-1', SAMPLE_GEOJSON_POINTS); map.updateLayerData('batch-2', SAMPLE_GEOJSON_LINES)
  log('批量添加:', ids.join(', '))
}

function handleRemove() { if (!map) return; map.removeLayer('vec-points'); log('vec-points 已移除') }
function handleToggleVisible() { if (!map) return; const s = map.getLayerState('vec-points'); if (s) { map.setLayerVisible('vec-points', !s.visible); log('visible:', !s.visible) } }
function handleSetOpacity() { if (!map) return; map.setLayerOpacity('vec-points', 0.3); log('opacity: 0.3') }
function handleGroupVisible() { if (!map) return; map.setGroupVisible('batch-group', false); log('batch-group 已隐藏'); refreshList() }
function handleExport() { if (!map) return; log('导出:', JSON.stringify(map.exportLayerConfigs().map(c => c.id))) }
function handleImport() { if (!map) return; map.importLayerConfigs([{ id: 'imported-1', type: LayerType.Vector }]); log('已导入'); refreshList() }
function handleGetState() { if (!map) return; const s = map.getLayerState('vec-points'); log('状态:', s ? JSON.stringify({ visible: s.visible, opacity: s.opacity }) : '不存在') }
function handleDestroy() { map?.destroy(); map = null; layerList.value = ''; log('已销毁') }

onBeforeUnmount(() => { map?.destroy() })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header"><h2>图层管理</h2><p class="desc">全部图层 CRUD API</p></div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>创建</legend><button @click="handleCreate">create()</button><button @click="handleDestroy">destroy()</button></fieldset>
        <fieldset><legend>添加图层</legend>
          <button @click="handleAddTile">Tile 瓦片</button><button @click="handleAddVector">Vector 点</button>
          <button @click="handleAddLine">Vector 线</button><button @click="handleAddPolygon">Vector 面</button>
          <button @click="handleAddHeatmap">Heatmap</button><button @click="handleBatchAdd">批量添加 (分组)</button>
        </fieldset>
        <fieldset><legend>图层操作</legend>
          <button @click="handleRemove">移除 vec-points</button><button @click="handleToggleVisible">切换可见性</button>
          <button @click="handleSetOpacity">透明度 0.3</button><button @click="handleGroupVisible">隐藏 batch-group</button>
          <button @click="handleGetState">获取状态</button><button @click="handleExport">导出配置</button>
          <button @click="handleImport">导入配置</button>
        </fieldset>
        <fieldset><legend>当前图层</legend><pre class="layer-list">{{ layerList || '无图层' }}</pre></fieldset>
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
.layer-list { font-size: 11px; color: #333; background: #f8f9fa; padding: 6px; border-radius: 4px; max-height: 120px; overflow-y: auto; white-space: pre-wrap; }
.map-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid #ddd; border-radius: 6px; min-height: 400px; }
.status-bar { padding: 6px 10px; font-size: 12px; color: #555; background: #f8f9fa; border-top: 1px solid #eee; border-radius: 0 0 6px 6px; max-height: 60px; overflow-y: auto; word-break: break-all; }
</style>

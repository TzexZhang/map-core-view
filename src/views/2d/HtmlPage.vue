<!--
  @file 2D 地图 - 原生 HTML/JS 模式
  @description 模拟纯 HTML 场景下通过 document.getElementById 使用 SDK。
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { MapController, EngineType, LayerType } from '@geomapcore/sdk'
import { SAMPLE_GEOJSON_POINTS } from '@/shared/sampleData'

const status = ref('点击按钮创建地图')
let map: MapController | null = null

const log = (...args: unknown[]) => {
  console.log('[2D-HTML]', ...args)
  status.value = args.map(String).join(' ')
}

/** 通过 getElementById 获取容器并创建地图 */
function handleCreate() {
  const el = document.getElementById('html-map')
  if (!el) { log('找不到容器'); return }
  MapController.create({ container: el, engine: EngineType.OpenLayers, initialView: { center: [116.397428, 39.90923], zoom: 10 } })
    .then(m => { map = m; log('2D 地图创建成功（HTML 模式）') })
    .catch(e => log('创建失败:', e))
}

/** 添加矢量图层 */
function handleAddLayer() {
  if (!map) return
  map.addLayer({ id: 'html-points', type: LayerType.Vector })
  map.updateLayerData('html-points', SAMPLE_GEOJSON_POINTS)
  log('矢量图层已添加')
}

/** 销毁地图 */
function handleDestroy() { map?.destroy(); map = null; log('已销毁') }

onBeforeUnmount(() => { map?.destroy() })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header">
      <h2>2D 地图 - 原生 HTML/JS</h2>
      <p class="desc">通过 document.getElementById 使用 SDK</p>
    </div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>HTML 模式</legend>
          <button @click="handleCreate">create() — getElementById</button>
          <button @click="handleAddLayer">添加矢量图层</button>
          <button @click="handleDestroy">destroy()</button>
        </fieldset>
      </div>
      <div class="map-area">
        <div id="html-map" class="map-container"></div>
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

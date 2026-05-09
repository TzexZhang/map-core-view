<!--
  @file 事件系统 API 专题
  @description 演示 on/once/off + 全部 11 个 MapEvents 常量
-->
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { MapController, EngineType, MapEvents } from '@geomapcore/sdk'

const mapContainer = ref<HTMLDivElement>()
const status = ref('未创建')
const eventLog = ref<string[]>([])
let map: MapController | null = null
let unsubs: (() => void)[] = []

const log = (...args: unknown[]) => { console.log('[Event]', ...args); status.value = args.map(String).join(' ') }
function addLog(name: string, detail: string) { const t = new Date().toLocaleTimeString(); eventLog.value.unshift(`[${t}] ${name}: ${detail}`); if (eventLog.value.length > 50) eventLog.value.pop() }

async function handleCreate() { map = await MapController.create({ container: mapContainer.value!, engine: EngineType.OpenLayers, initialView: { center: [116.397428, 39.90923], zoom: 10 } }); log('地图已创建') }

function handleSubscribeAll() {
  if (!map) return
  unsubs.forEach(fn => fn()); unsubs = []
  const events = [
    { name: MapEvents.MAP_CLICK, label: 'map:click' }, { name: MapEvents.MAP_DBLCLICK, label: 'map:dblclick' },
    { name: MapEvents.MAP_POINTERMOVE, label: 'map:pointermove' }, { name: MapEvents.MAP_MOVEEND, label: 'map:moveend' },
    { name: MapEvents.MAP_CONTEXTMENU, label: 'map:contextmenu' }, { name: MapEvents.FEATURE_CLICK, label: 'feature:click' },
    { name: MapEvents.FEATURE_HOVER, label: 'feature:hover' }, { name: MapEvents.LAYER_ADD, label: 'layer:add' },
    { name: MapEvents.LAYER_REMOVE, label: 'layer:remove' }, { name: 'datasource:update', label: 'datasource:update' },
    { name: 'system:ready', label: 'system:ready' },
  ]
  for (const evt of events) {
    const unsub = map.on(evt.name, (payload: any) => {
      const d = payload?.lngLat ? `lngLat=[${payload.lngLat.map((v: number) => v.toFixed(4)).join(',')}]` : payload?.layerId ? `layerId=${payload.layerId}` : JSON.stringify(payload).slice(0, 80)
      addLog(evt.label, d)
    })
    unsubs.push(unsub)
  }
  log(`已订阅 ${events.length} 个事件`)
}

function handleOnce() { if (!map) return; map.once(MapEvents.MAP_CLICK, (p: any) => { addLog('once:click', `lngLat=[${p?.lngLat?.map((v: number) => v.toFixed(4)).join(',')}]`); log('一次性事件触发') }); log('已订阅一次性 map:click') }
function handleUnsubAll() { unsubs.forEach(fn => fn()); unsubs = []; log('已取消所有订阅') }
function handleClearLog() { eventLog.value = [] }
function handleDestroy() { unsubs.forEach(fn => fn()); unsubs = []; map?.destroy(); map = null; eventLog.value = []; log('已销毁') }

onBeforeUnmount(() => { unsubs.forEach(fn => fn()); map?.destroy() })
</script>

<template>
  <div class="demo-page">
    <div class="demo-header"><h2>事件系统</h2><p class="desc">on / once / off + 11 个事件常量</p></div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>创建</legend><button @click="handleCreate">create()</button><button @click="handleDestroy">destroy()</button></fieldset>
        <fieldset><legend>事件订阅</legend>
          <button @click="handleSubscribeAll">订阅全部事件</button><button @click="handleOnce">once(map:click)</button>
          <button @click="handleUnsubAll">取消所有订阅</button><button @click="handleClearLog">清空日志</button>
        </fieldset>
        <fieldset><legend>事件日志</legend>
          <div class="event-log">
            <div v-for="(line, i) in eventLog" :key="i" class="log-line">{{ line }}</div>
            <div v-if="eventLog.length === 0" class="log-empty">暂无事件</div>
          </div>
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
.control-panel { width: 320px; overflow-y: auto; flex-shrink: 0; }
.control-panel fieldset { border: 1px solid #ddd; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
.control-panel legend { font-size: 13px; font-weight: bold; padding: 0 4px; color: #333; }
.control-panel button { display: inline-block; margin: 3px; padding: 4px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; }
.control-panel button:hover { background: #e8f0fe; border-color: #4285f4; }
.event-log { max-height: 300px; overflow-y: auto; background: #1a1a2e; border-radius: 4px; padding: 6px; }
.log-line { font-size: 11px; color: #00ff88; font-family: monospace; padding: 1px 0; word-break: break-all; }
.log-empty { font-size: 11px; color: #666; }
.map-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid #ddd; border-radius: 6px; min-height: 400px; }
.status-bar { padding: 6px 10px; font-size: 12px; color: #555; background: #f8f9fa; border-top: 1px solid #eee; border-radius: 0 0 6px 6px; max-height: 60px; overflow-y: auto; word-break: break-all; }
</style>

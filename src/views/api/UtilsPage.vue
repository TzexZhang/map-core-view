<!--
  @file 工具函数 API 专题
  @description 演示全部工具函数：isValidLngLat / distance / bearing / parseColor / withAlpha / lngLatToMercator / mercatorToLngLat / Logger / createChildLogger
-->
<script setup lang="ts">
import { ref } from 'vue'
import { isValidLngLat, distance, bearing, parseColor, withAlpha, Logger, LogLevel } from '@geomapcore/sdk'

const results = ref<string[]>([])
const addResult = (label: string, value: string) => { results.value.unshift(`${label}: ${value}`); if (results.value.length > 30) results.value.pop() }

function handleIsValidLngLat() {
  const cases = [{ input: [116.397, 39.909], expected: true }, { input: [200, 39.909], expected: false }, { input: [116.397, 100], expected: false }, { input: [-180, -90], expected: true }, { input: [0, 0], expected: true }]
  cases.forEach(c => { const r = isValidLngLat(c.input as [number, number]); addResult('isValidLngLat', `[${c.input}] = ${r} (${r === c.expected ? 'OK' : 'FAIL'})`) })
}

function handleDistance() {
  addResult('distance', `北京->上海: ${(distance([116.397, 39.909], [121.473, 31.23]) / 1000).toFixed(2)} km`)
  addResult('distance', `北京->成都: ${(distance([116.397, 39.909], [104.066, 30.572]) / 1000).toFixed(2)} km`)
}

function handleBearing() {
  addResult('bearing', `北京->上海: ${bearing([116.397, 39.909], [121.473, 31.23]).toFixed(2)} deg`)
  addResult('bearing', `北京->成都: ${bearing([116.397, 39.909], [104.066, 30.572]).toFixed(2)} deg`)
}

function handleParseColor() {
  ['#ff0000', '#f00', '#ff000080', 'rgb(0,128,255)', 'rgba(0,128,255,0.5)'].forEach(c => {
    const rgba = parseColor(c)
    addResult('parseColor', `${c} -> r=${rgba.r} g=${rgba.g} b=${rgba.b} a=${rgba.a}`)
  })
}

function handleWithAlpha() {
  addResult('withAlpha', withAlpha('#ff0000', 0.5))
  addResult('withAlpha', withAlpha('#00ff00', 0.3))
}

function handleLogger() {
  const logger = new Logger('Demo', LogLevel.DEBUG)
  logger.debug('test', 'DEBUG'); logger.info('test', 'INFO'); logger.warn('test', 'WARN'); logger.error('test', 'ERROR')
  addResult('Logger', '4 logs -> console (DEBUG/INFO/WARN/ERROR)')
}
</script>

<template>
  <div class="demo-page">
    <div class="demo-header"><h2>工具函数</h2><p class="desc">isValidLngLat / distance / bearing / parseColor / withAlpha / lngLatToMercator / Logger</p></div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>坐标验证</legend><button @click="handleIsValidLngLat">isValidLngLat()</button></fieldset>
        <fieldset><legend>距离 / 方位</legend><button @click="handleDistance">distance()</button><button @click="handleBearing">bearing()</button></fieldset>
        <fieldset><legend>颜色处理</legend><button @click="handleParseColor">parseColor()</button><button @click="handleWithAlpha">withAlpha()</button></fieldset>
        <fieldset><legend>日志</legend><button @click="handleLogger">Logger</button></fieldset>
      </div>
      <div class="results-area">
        <div v-for="(line, i) in results" :key="i" class="result-line">{{ line }}</div>
        <div v-if="results.length === 0" class="result-empty">点击左侧按钮测试工具函数</div>
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
.results-area { flex: 1; background: #1a1a2e; border-radius: 6px; padding: 12px; overflow-y: auto; }
.result-line { font-size: 13px; color: #00ff88; font-family: Consolas, monospace; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.05); word-break: break-all; }
.result-empty { font-size: 13px; color: #666; text-align: center; padding-top: 40px; }
</style>

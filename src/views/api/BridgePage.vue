<!--
  @file 跨端通信桥 API 专题
  @description 演示 BridgeFactory.detect/detectEnvironment/send/receive/destroy + 全部 BridgeEnvironment 枚举
-->
<script setup lang="ts">
import { ref } from 'vue'
import { BridgeFactory, BridgeEnvironment } from '@geomapcore/sdk'

const status = ref('点击按钮测试')
const envResult = ref('')
const bridgeLog = ref<string[]>([])

const log = (...args: unknown[]) => { console.log('[Bridge]', ...args); status.value = args.map(String).join(' ') }
function addLog(msg: string) { bridgeLog.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`); if (bridgeLog.value.length > 30) bridgeLog.value.pop() }

function handleDetectEnv() { const env = BridgeFactory.detectEnvironment(); const labels: Record<string, string> = { [BridgeEnvironment.QtWebChannel]: 'Qt WebChannel', [BridgeEnvironment.Android]: 'Android WebView', [BridgeEnvironment.IOS]: 'iOS WKWebView', [BridgeEnvironment.PostMessage]: 'iframe/PostMessage', [BridgeEnvironment.Browser]: '纯浏览器' }; envResult.value = `当前环境: ${env} -> ${labels[env] || env}`; log(envResult.value) }

function handleDetect() { const b = BridgeFactory.detect(); addLog(`Bridge 实例: ${b.constructor.name}`); log('Bridge:', b.constructor.name) }

async function handleSend() { const b = BridgeFactory.detect(); try { await b.send('test.method', { foo: 'bar', ts: Date.now() }); addLog('send() -> 成功'); log('send 成功') } catch (e) { addLog(`send 失败: ${e}`); log('send 失败:', e) } }

function handleReceive() { const b = BridgeFactory.detect(); b.receive((m, p) => { addLog(`receive: ${m} ${JSON.stringify(p)}`); log('收到:', m, p) }); addLog('receive() 已注册'); log('receive 已注册') }

function handleDestroy() { const b = BridgeFactory.detect(); b.destroy(); addLog('Bridge 已销毁'); log('destroy') }
</script>

<template>
  <div class="demo-page">
    <div class="demo-header"><h2>跨端通信桥</h2><p class="desc">BridgeFactory.detect / detectEnvironment / send / receive / destroy</p></div>
    <div class="demo-body">
      <div class="control-panel">
        <fieldset><legend>环境检测</legend><button @click="handleDetectEnv">detectEnvironment()</button><p class="info">{{ envResult || '未检测' }}</p></fieldset>
        <fieldset><legend>Bridge 操作</legend>
          <button @click="handleDetect">detect()</button><button @click="handleSend">bridge.send()</button>
          <button @click="handleReceive">bridge.receive()</button><button @click="handleDestroy">bridge.destroy()</button>
        </fieldset>
        <fieldset><legend>通信日志</legend><div class="bridge-log"><div v-for="(line, i) in bridgeLog" :key="i" class="log-line">{{ line }}</div><div v-if="bridgeLog.length === 0" class="log-empty">暂无日志</div></div></fieldset>
      </div>
      <div class="info-area">
        <h3>BridgeEnvironment 枚举值</h3>
        <table class="enum-table">
          <tr><td>QtWebChannel</td><td>{{ BridgeEnvironment.QtWebChannel }}</td></tr>
          <tr><td>Android</td><td>{{ BridgeEnvironment.Android }}</td></tr>
          <tr><td>IOS</td><td>{{ BridgeEnvironment.IOS }}</td></tr>
          <tr><td>PostMessage</td><td>{{ BridgeEnvironment.PostMessage }}</td></tr>
          <tr><td>Browser</td><td>{{ BridgeEnvironment.Browser }}</td></tr>
        </table>
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
.control-panel { width: 320px; overflow-y: auto; flex-shrink: 0; }
.control-panel fieldset { border: 1px solid #ddd; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
.control-panel legend { font-size: 13px; font-weight: bold; padding: 0 4px; color: #333; }
.control-panel button { display: inline-block; margin: 3px; padding: 4px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; }
.control-panel button:hover { background: #e8f0fe; border-color: #4285f4; }
.info { font-size: 12px; color: #333; margin-top: 4px; word-break: break-all; }
.bridge-log { max-height: 200px; overflow-y: auto; background: #1a1a2e; border-radius: 4px; padding: 6px; margin-top: 6px; }
.log-line { font-size: 11px; color: #00ff88; font-family: monospace; padding: 1px 0; word-break: break-all; }
.log-empty { font-size: 11px; color: #666; }
.info-area { flex: 1; display: flex; flex-direction: column; }
.info-area h3 { font-size: 15px; margin-bottom: 10px; }
.enum-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
.enum-table td { padding: 6px 12px; border: 1px solid #ddd; font-size: 13px; }
.enum-table td:first-child { font-weight: bold; background: #f8f9fa; }
.status-bar { padding: 6px 10px; font-size: 12px; color: #555; background: #f8f9fa; border-top: 1px solid #eee; border-radius: 6px; max-height: 60px; overflow-y: auto; word-break: break-all; margin-top: auto; }
</style>

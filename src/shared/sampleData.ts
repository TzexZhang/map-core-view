/**
 * @file 示例 GeoJSON 数据
 * @description 提供 SDK API 演示用的 GeoJSON 示例数据集。
 */
import type { GeoJSONFeatureCollection } from '@geomapcore/sdk'

/** 示例点要素（北京地标/商圈），用于 Vector 图层和 Heatmap */
export const SAMPLE_GEOJSON_POINTS: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397428, 39.90923] }, properties: { name: '天安门', category: 'landmark', value: 100 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.407428, 39.91923] }, properties: { name: '王府井', category: 'commercial', value: 80 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.387428, 39.89923] }, properties: { name: '前门', category: 'landmark', value: 60 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.417428, 39.89923] }, properties: { name: '建国门', category: 'transport', value: 45 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.377428, 39.91923] }, properties: { name: '西单', category: 'commercial', value: 90 } },
  ],
}

/** 示例线要素（路线） */
export const SAMPLE_GEOJSON_LINES: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[116.38, 39.90], [116.39, 39.91], [116.40, 39.91], [116.41, 39.90]] }, properties: { name: '路线A', color: '#ff0000' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[116.39, 39.89], [116.40, 39.90], [116.41, 39.90], [116.42, 39.91]] }, properties: { name: '路线B', color: '#0000ff' } },
  ],
}

/** 示例面要素（区域） */
export const SAMPLE_GEOJSON_POLYGONS: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[116.39, 39.91], [116.41, 39.91], [116.41, 39.90], [116.39, 39.90], [116.39, 39.91]]] }, properties: { name: '区域A', type: 'zone' } },
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[116.38, 39.90], [116.39, 39.92], [116.40, 39.90], [116.38, 39.90]]] }, properties: { name: '区域B', type: 'warning' } },
  ],
}

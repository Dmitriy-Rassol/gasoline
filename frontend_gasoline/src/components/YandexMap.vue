<script setup lang="ts">
import { ref } from 'vue'
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapMarker,
  YandexMapControls,
  YandexMapControl,
  YandexMapControlButton,
  YandexMapZoomControl,
  YandexMapListener,
} from 'vue-yandex-maps'
import { Navigation } from '@lucide/vue';

import type { GasStation, FuelType } from '../types/station'
import { FUEL_LABELS, FUEL_MAX, getFuelStatus, STATUS_COLORS } from '../types/station'

const props = defineProps<{
  stations: GasStation[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  (e: 'select', station: GasStation): void
  (e: 'deselect'): void
}>()

const mapRef = ref<any>(null)

const CENTER = [37.9094, 59.1319] as [number, number]
const ZOOM = 12

const fuelKeys: FuelType[] = ['ai92', 'ai95', 'ai98', 'diesel']

const toLngLat = (coords: [number, number]): [number, number] => [coords[1], coords[0]]

const getStationColor = (s: GasStation): string => {
  return s.hasFuel ? '#22C55E' : '#EF4444'
}

const buildSvg = (color: string, selected: boolean) => {
  const fill = selected ? '#2563EB' : color
  const shadow = selected ? 'rgba(37,99,235,0.5)' : 'rgba(0,0,0,0.25)'
  return `data:image/svg+xml,${encodeURIComponent(`<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><filter id="d" x="-3" y="0" width="34" height="40" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${shadow}" flood-opacity="0.5"/></filter></defs><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${fill}" filter="url(#d)"/><circle cx="14" cy="13" r="6" fill="white" opacity="0.15"/><text x="14" y="16.5" text-anchor="middle" font-size="11" fill="white">⛽</text></svg>`)}`
}

const selectStation = (station: GasStation) => {
  emit('select', station)
}

const deselectAll = () => {
  emit('deselect')
}

const geolocate = () => {
  if (!navigator.geolocation || !mapRef.value) return
  navigator.geolocation.getCurrentPosition((pos) => {
    const coords = [pos.coords.longitude, pos.coords.latitude] as [number, number]
    mapRef.value.setLocation({ center: coords, zoom: 14, duration: 300 })
  })
}
</script>

<template>
  <yandex-map
    ref="mapRef"
    :settings="{
      location: {
        center: CENTER,
        zoom: ZOOM,
      },
      showScaleInCopyrights: true,
    }"
    width="100%"
    height="100%"
  >
    <yandex-map-default-scheme-layer />
    <yandex-map-default-features-layer />

    <yandex-map-controls :settings="{ position: 'right' }">
      <yandex-map-zoom-control />
      <yandex-map-control>
        <yandex-map-control-button :settings="{ onClick: geolocate }">
          <div class="geo-btn">
              <Navigation :size="20"/>
          </div>
        </yandex-map-control-button>
      </yandex-map-control>
    </yandex-map-controls>

    <yandex-map-listener :settings="{ onClick: deselectAll }" />

    <yandex-map-marker
      v-for="station in stations"
      :key="station.id"
      :settings="{
        coordinates: toLngLat(station.coordinates),
        onClick: () => selectStation(station),
        zIndex: station.id === selectedId ? 1 : 0,
      }"
      position="top left-center"
    >
      <div class="marker-wrapper">
        <img
          :src="buildSvg(getStationColor(station), station.id === selectedId)"
          :width="28"
          :height="36"
          class="marker-img"
        />
        <div
          v-if="station.id === selectedId"
          class="marker-popup"
        >
          <div class="popup-header">
            <div class="popup-icon">⛽</div>
            <div>
              <div class="popup-name">{{ station.name }}</div>
              <div class="popup-addr">{{ station.address }}</div>
            </div>
          </div>
          <div class="popup-fuel">
            <div v-if="!station.hasFuel" class="popup-no-fuel">
              Топливо отсутствует
            </div>
            <div
              v-for="key in fuelKeys"
              :key="key"
              v-show="station.hasFuel && station.fuel[key] !== undefined"
              class="popup-fuel-item"
            >
              <div class="popup-fuel-head">
                <span class="fuel-label">{{ FUEL_LABELS[key] }}</span>
                <span class="fuel-val">{{ (station.fuel[key] ?? 0).toLocaleString('ru-RU') }} л</span>
              </div>
              <div class="fuel-bar-track">
                <div
                  class="fuel-bar-fill"
                  :style="{
                    width: Math.min(100, Math.round(((station.fuel[key] ?? 0) / FUEL_MAX[key]) * 100)) + '%',
                    background: STATUS_COLORS[getFuelStatus(station.fuel[key] ?? 0, key)],
                  }"
                ></div>
              </div>
            </div>
          </div>
          <div class="popup-delivery">
            🚚 Следующая поставка: <strong>{{ station.nextDelivery }}</strong>
          </div>
        </div>
      </div>
    </yandex-map-marker>
  </yandex-map>
</template>

<style scoped lang="scss">
.geo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--gray-600);
}

.marker-wrapper {
  position: relative;
  cursor: pointer;
}

.marker-img {
  display: block;
}

.marker-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  padding: 14px;
  animation: popIn 0.2s ease;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.popup-icon {
  font-size: 24px;
}

.popup-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.popup-addr {
  font-size: 11px;
  color: #6b7280;
}

.popup-fuel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.popup-fuel-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popup-fuel-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.popup-no-fuel {
  font-size: 12px;
  color: #EF4444;
  padding: 8px;
  background: #FEF2F2;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.fuel-label {
  font-weight: 600;
  color: #374151;
}

.fuel-val {
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

.fuel-bar-track {
  height: 5px;
  background: #f3f4f6;
  border-radius: 100px;
  overflow: hidden;
}

.fuel-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
  min-width: 2px;
}

.popup-delivery {
  font-size: 11px;
  color: #6b7280;
  padding: 8px;
  background: #eff6ff;
  border-radius: 8px;

  strong {
    color: #1d4ed8;
  }
}
</style>

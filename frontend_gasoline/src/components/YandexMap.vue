<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue'
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapMarker,
  YandexMapControls,
  YandexMapZoomControl,
  YandexMapListener,
} from 'vue-yandex-maps'
import { Fuel, X, MapPin } from '@lucide/vue'

import type { GasStation, FuelType } from '../types/station'
import { FUEL_LABELS } from '../types/station'
import { useTheme } from '../composables/useTheme'

import lukoilLogo from '../assets/lukoil.webp'
import gazpromLogo from '../assets/gazprom.webp'
import tatneftLogo from '../assets/tatneft.webp'
import teboilLogo from '../assets/teboil.webp'
import enticomLogo from '../assets/enticom.webp'

const brandLogos: Record<string, string> = {
  lukoil: lukoilLogo,
  gazprom: gazpromLogo,
  tatneft: tatneftLogo,
  teboil: teboilLogo,
  enticom: enticomLogo,
}

const getBrandLogo = (brand: string) => brandLogos[brand] || ''

const { theme } = useTheme()

const props = defineProps<{
  stations: GasStation[]
  selectedId: number | null
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'select', station: GasStation): void
  (e: 'deselect'): void
  (e: 'mapClick'): void
}>()

const selectedStation = computed(() => {
  if (props.selectedId === null) return null
  return props.stations.find(s => s.id === props.selectedId) || null
})

const map = shallowRef<any>(null)

const CENTER = [37.9094, 59.1319] as [number, number]
const ZOOM = 12

const fuelKeys: FuelType[] = ['ai92', 'ai95', 'ai98', 'diesel']

const toLngLat = (coords: [number, number]): [number, number] => [coords[1], coords[0]]

const getStationColor = (s: GasStation): string => {
  return s.hasFuel ? '#22C55E' : '#EF4444'
}

let markerJustClicked = false

const selectStation = (station: GasStation) => {
  markerJustClicked = true
  emit('select', station)
  moveToStation(station)
  setTimeout(() => { markerJustClicked = false }, 100)
}

const deselectAll = () => {
  if (markerJustClicked) return
  emit('deselect')
  emit('mapClick')
}

const moveToStation = (station: GasStation) => {
  if (!map.value) return
  const coords = toLngLat(station.coordinates)
  map.value.setLocation({ center: coords, zoom: 15, duration: 500 })
}

const resetZoom = () => {
  if (!map.value) return
  map.value.setLocation({ center: CENTER, zoom: ZOOM, duration: 500 })
}

const sheetContent = ref<HTMLElement | null>(null)
const touchStartY = ref(0)
const touchDeltaY = ref(0)
const isDragging = ref(false)
const isClosing = ref(false)
const canDrag = ref(false)

const onTouchStart = (e: TouchEvent) => {
  const el = sheetContent.value
  canDrag.value = !el || el.scrollTop <= 0
  touchStartY.value = e.touches[0].clientY
  touchDeltaY.value = 0
  isDragging.value = false
}

const onTouchMove = (e: TouchEvent) => {
  const dy = e.touches[0].clientY - touchStartY.value
  if (!canDrag.value) return
  if (!isDragging.value && dy > 0) {
    isDragging.value = true
  }
  if (isDragging.value) {
    touchDeltaY.value = Math.max(0, dy)
  }
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  if (touchDeltaY.value > 100) {
    isClosing.value = true
    touchDeltaY.value = window.innerHeight
    setTimeout(() => {
      emit('deselect')
      isClosing.value = false
      touchDeltaY.value = 0
    }, 350)
  } else {
    touchDeltaY.value = 0
  }
}

const sheetStyle = computed(() => {
  if (isClosing.value) {
    return {
      transform: `translateY(${touchDeltaY.value}px)`,
      transition: 'transform 0.3s ease',
    }
  }
  if (isDragging.value) {
    return {
      transform: `translateY(${touchDeltaY.value}px)`,
      transition: 'none',
    }
  }
  return {}
})

defineExpose({ moveToStation, resetZoom })
</script>

<template>
  <yandex-map v-model="map" :settings="{
    location: {
      center: CENTER,
      zoom: ZOOM,
    },
    showScaleInCopyrights: true,
    theme: theme === 'dark' ? 'dark' : undefined,
  }" width="100%" height="100%">
    <yandex-map-default-scheme-layer :settings="{
      theme: theme === 'dark' ? 'dark' : 'light',
    }" />
    <yandex-map-default-features-layer />

    <yandex-map-controls :settings="{ position: 'right top', orientation: 'vertical' }">
      <yandex-map-zoom-control />
    </yandex-map-controls>

    <yandex-map-listener :settings="{ onClick: deselectAll }" />

    <yandex-map-marker v-for="station in stations" :key="station.id" :settings="{
      coordinates: toLngLat(station.coordinates),
      onClick: () => selectStation(station),
      zIndex: station.id === selectedId ? 1 : 0,
    }" position="top left-center">
      <div class="marker-wrapper">
        <div :class="['marker-circle', { selected: station.id === selectedId }]"
          :style="{ background: getStationColor(station) }">
          <Fuel :size="14" color="white" />
        </div>
        <div v-if="station.id === selectedId && !isMobile" class="marker-popup" @wheel.stop>
          <button class="popup-close" @click.stop="deselectAll">
            <X :size="16" />
          </button>
          <div class="popup-header">
            <div v-if="station.image" class="popup-icon"><img width="48" :src="getBrandLogo(station.image)"
                :alt="station.name"></div>
            <div v-else class="popup-icon">
              <Fuel :size="32" />
            </div>
            <div>
              <div class="popup-name">{{ station.name }}</div>
              <div class="popup-addr">{{ station.address }}</div>
              <div :class="['popup-status', { available: station.hasFuel, empty: !station.hasFuel }]">
                {{ station.hasFuel ? 'Есть топливо' : 'Нет топлива' }}
              </div>
            </div>
          </div>
          <div class="popup-fuel">
            <div v-for="key in fuelKeys" :key="key"
              :class="['popup-fuel-row', { available: (station.fuel[key] ?? 0) > 0, empty: (station.fuel[key] ?? 0) === 0 }]">
              <span class="fuel-label">{{ FUEL_LABELS[key] }}</span>
              <span class="fuel-val">{{ (station.fuel[key] ?? 0).toLocaleString('ru-RU') }} л</span>
              <span class="fuel-val">~{{ ((station.fuel[key] ?? 0) / 20).toLocaleString('ru-RU') }} машин</span>
            </div>
            <div class="comment-label">Последний комментарий</div>
            <div class="comment-text">{{ station.lastComment }}</div>
          </div>
          <div class="popup-history">
            <div class="history-label">История</div>
            <div class="history-list">
              <div v-for="(comment, idx) in station.comments" :key="idx" class="history-item">
                <span class="history-time">{{ comment.time }}</span>
                <span class="history-text">{{ comment.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </yandex-map-marker>
  </yandex-map>

  <Transition name="slide-up">
    <div v-if="selectedStation && isMobile" class="mobile-sheet" :style="sheetStyle"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="sheet-handle">
        <div class="handle-bar"></div>
      </div>
      <div class="sheet-header">
        <div v-if="selectedStation.image" class="sheet-icon">
          <img width="40" :src="getBrandLogo(selectedStation.image)" :alt="selectedStation.name">
        </div>
        <div v-else class="sheet-icon">
          <Fuel :size="24" />
        </div>
        <div class="sheet-info">
          <div class="sheet-name">{{ selectedStation.name }}</div>
          <div class="sheet-addr">
            <MapPin :size="12" />
            {{ selectedStation.address }}
          </div>
        </div>
      </div>

      <div :class="['sheet-status', { available: selectedStation.hasFuel, empty: !selectedStation.hasFuel }]">
        {{ selectedStation.hasFuel ? 'Есть топливо' : 'Нет топлива' }}
      </div>

      <div ref="sheetContent" class="sheet-content">
        <div class="sheet-fuel">
          <div v-for="key in fuelKeys" :key="key"
            :class="['sheet-fuel-row', { available: (selectedStation.fuel[key] ?? 0) > 0, empty: (selectedStation.fuel[key] ?? 0) === 0 }]">
            <span class="fuel-label">{{ FUEL_LABELS[key] }}</span>
            <span class="fuel-val">{{ (selectedStation.fuel[key] ?? 0).toLocaleString('ru-RU') }} л</span>.
            <span class="fuel-val">~{{ ((selectedStation.fuel[key] ?? 0) / 20).toLocaleString('ru-RU') }} машин</span>
          </div>
        </div>

        <div class="sheet-comment">
          <div class="comment-label">Последний комментарий</div>
          <div class="comment-text">{{ selectedStation.lastComment }}</div>
        </div>

        <div class="sheet-history">
          <div class="history-label">История</div>
          <div v-for="(comment, idx) in selectedStation.comments" :key="idx" class="history-item">
            <span class="history-time">{{ comment.time }}</span>
            <span class="history-text">{{ comment.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
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

:deep(.ymaps3--controls-default) {
  @media (max-width: 767px) {
    transform: scale(0.7);
    transform-origin: top right;
  }
}

.marker-wrapper {
  position: relative;
  cursor: pointer;
}

.marker-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid white;

  &.selected {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  }
}

.marker-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  background: var(--card-bg);
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
    border-top: 8px solid var(--card-bg);
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

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: var(--popup-close-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: var(--popup-close-hover);
    color: var(--gray-900);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.popup-icon {
  width: 48px;
  height: 48px;
  background: var(--popup-close-bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.popup-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-900);
}

.popup-addr {
  font-size: 11px;
  color: var(--gray-500);
  margin-bottom: 4px;
}

.popup-status {
  font-size: 11px;
  font-weight: 600;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 100px;

  &.available {
    background: var(--badge-green-bg);
    color: #22C55E;
  }

  &.empty {
    background: var(--badge-red-bg);
    color: #EF4444;
  }
}

.popup-fuel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}

.popup-fuel-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--fuel-row-bg);

  &.available {
    background: var(--badge-green-bg);
    border: 1px solid var(--badge-green-border);
  }

  &.empty {
    background: var(--badge-red-bg);
    border: 1px solid var(--badge-red-border);
  }
}

.fuel-label {
  font-weight: 600;
  color: var(--gray-700);
  margin-right: auto;
}

.fuel-val {
  font-weight: 600;
  color: var(--gray-500);
  font-variant-numeric: tabular-nums;

  & + & {
    margin-left: 8px;
  }
}

.popup-comment {
  background: var(--comment-bg);
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
}

.comment-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gray-400);
  margin-bottom: 4px;
}

.comment-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-700);
}

.popup-history {
  margin-top: 10px;
}

.history-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gray-400);
  margin-bottom: 6px;
}

.history-list {
  max-height: 100px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 8px;
  font-size: 11px;
  padding: 4px 0;
  border-bottom: 1px solid var(--gray-100);

  &:last-child {
    border-bottom: none;
  }
}

.history-time {
  color: var(--gray-400);
  white-space: nowrap;
  min-width: 50px;
}

.history-text {
  color: var(--gray-500);
}

.mobile-sheet {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 40;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sheet-handle {
  padding: 12px 0 8px;
  touch-action: none;
  cursor: grab;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: var(--gray-300);
  border-radius: 2px;
  margin: 0 auto;
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 12px;
}

.sheet-icon {
  width: 44px;
  height: 44px;
  background: var(--popup-close-bg);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.sheet-info {
  flex: 1;
  min-width: 0;
}

.sheet-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
}

.sheet-addr {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--gray-500);
}

.sheet-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--popup-close-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  flex-shrink: 0;
}

.sheet-status {
  margin: 0 16px 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;

  &.available {
    background: var(--badge-green-bg);
    color: #22C55E;
  }

  &.empty {
    background: var(--badge-red-bg);
    color: #EF4444;
  }
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.sheet-fuel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px 12px;
}

.sheet-fuel-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--fuel-row-bg);

  &.available {
    background: var(--badge-green-bg);
    border: 1px solid var(--badge-green-border);
  }

  &.empty {
    background: var(--badge-red-bg);
    border: 1px solid var(--badge-red-border);
  }
}

.sheet-comment {
  margin: 0 16px 12px;
  padding: 12px;
  background: var(--comment-bg);
  border-radius: 10px;
}

.sheet-history {
  padding: 0 16px 16px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>

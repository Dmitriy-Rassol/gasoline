<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, MapPin, Fuel, X } from '@lucide/vue'
import { FUEL_LABELS, getFuelStatus, STATUS_COLORS, STATUS_BG } from '../types/station'
import type { GasStation, FuelType } from '../types/station'

const props = defineProps<{
  stations: GasStation[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  (e: 'select', station: GasStation): void
  (e: 'close'): void
}>()

const searchQuery = ref('')

const fuelKeys: FuelType[] = ['ai92', 'ai95', 'ai98', 'diesel']

const filtered = computed(() => {
  if (!searchQuery.value) return props.stations
  const q = searchQuery.value.toLowerCase()
  return props.stations.filter(
    (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
  )
})

const getBadgeStyle = (station: GasStation, key: FuelType) => {
  const val = station.fuel[key] ?? 0
  const status = getFuelStatus(val, key)
  return {
    background: STATUS_BG[status],
    color: STATUS_COLORS[status],
  }
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">АЗС Череповца</h2>
      <button class="close-btn" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <div class="sidebar-search">
      <Search :size="15" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по названию или адресу..."
        class="search-input"
      />
    </div>

    <div class="sidebar-list">
      <button
        v-for="station in filtered"
        :key="station.id"
        :class="['station-item', { selected: station.id === selectedId }]"
        @click="emit('select', station)"
      >
        <div class="station-icon">
          <Fuel :size="16" />
        </div>
        <div class="station-info">
          <span class="station-name">{{ station.name }}</span>
          <span class="station-address">
            <MapPin :size="11" />
            {{ station.address }}
          </span>
          <div class="station-fuels">
            <span v-if="!station.hasFuel" class="fuel-badge no-fuel">
              Нет бензина
            </span>
            <span
              v-for="key in fuelKeys"
              :key="key"
              v-show="station.hasFuel"
              class="fuel-badge"
              :style="getBadgeStyle(station, key)"
            >
              {{ FUEL_LABELS[key] }}
            </span>
          </div>
        </div>
      </button>

      <div v-if="filtered.length === 0" class="empty">
        Ничего не найдено
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 340px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--gray-200);
  z-index: 30;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
}

.close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: var(--gray-100);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  transition: all var(--transition);

  &:hover {
    background: var(--gray-200);
    color: var(--gray-700);
  }
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 12px;
  padding: 8px 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  flex-shrink: 0;

  &:focus-within {
    border-color: var(--blue-light);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  .search-icon {
    color: var(--gray-400);
    flex-shrink: 0;
  }
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--gray-800);

  &::placeholder {
    color: var(--gray-400);
  }
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 100px;
  }
}

.station-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border: none;
  background: transparent;
  border-radius: 10px;
  text-align: left;
  transition: all var(--transition);
  cursor: pointer;

  &:hover {
    background: var(--gray-50);
  }

  &.selected {
    background: rgba(37, 99, 235, 0.06);

    .station-icon {
      background: var(--blue);
      color: white;
    }
  }
}

.station-icon {
  width: 32px;
  height: 32px;
  background: var(--gray-100);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  flex-shrink: 0;
  transition: all var(--transition);
}

.station-info {
  flex: 1;
  min-width: 0;
}

.station-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-address {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--gray-500);
  margin-bottom: 6px;
}

.station-fuels {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.fuel-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;

  &.no-fuel {
    background: #FEF2F2;
    color: #EF4444;
  }
}

.empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--gray-400);
  font-size: 13px;
}
</style>

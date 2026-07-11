<script setup lang="ts">
import { ref, computed } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import FuelFilters from './components/FuelFilters.vue'
import StationList from './components/StationList.vue'
import YandexMap from './components/YandexMap.vue'
import { gasStations } from './data/stations'
import type { GasStation, FuelType } from './types/station'

const showFilters = ref(true)
const showList = ref(true)
const activeFilters = ref<FuelType[]>([])
const availability = ref<'all' | 'available' | 'empty'>('all')
const selectedStation = ref<GasStation | null>(null)
const mapRef = ref<InstanceType<typeof YandexMap> | null>(null)

const filteredStations = computed(() => {
  let result = gasStations

  if (availability.value === 'available') {
    result = result.filter((s) => s.hasFuel)
  } else if (availability.value === 'empty') {
    result = result.filter((s) => !s.hasFuel)
  }

  if (activeFilters.value.length > 0) {
    result = result.filter((s) => s.hasFuel && activeFilters.value.some((f) => (s.fuel[f] ?? 0) > 0))
  }

  return result
})

const toggleFilter = (type: FuelType) => {
  const idx = activeFilters.value.indexOf(type)
  if (idx === -1) {
    activeFilters.value.push(type)
  } else {
    activeFilters.value.splice(idx, 1)
  }
}

const setAvailability = (value: 'all' | 'available' | 'empty') => {
  availability.value = value
}

const selectStation = (station: GasStation) => {
  selectedStation.value = station
  ;(mapRef.value as any)?.moveToStation(station)
}

const closeCard = () => {
  selectedStation.value = null
}
</script>

<template>
  <div class="app">
    <AppNavbar
      :show-list="showList"
      @filter="showFilters = !showFilters"
      @list="showList = !showList"
    />

    <FuelFilters
      :visible="showFilters"
      :active-filters="activeFilters"
      :availability="availability"
      @toggle="toggleFilter"
      @availability="setAvailability"
    />

    <div class="map-area">
      <StationList
        v-if="showList"
        :stations="filteredStations"
        :selected-id="selectedStation?.id ?? null"
        @select="selectStation"
        @close="showList = false"
      />

      <YandexMap
        ref="mapRef"
        :stations="filteredStations"
        :selected-id="selectedStation?.id ?? null"
        @select="selectStation"
        @deselect="closeCard"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
}

.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
</style>

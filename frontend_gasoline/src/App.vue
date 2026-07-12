<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import FuelFilters from './components/FuelFilters.vue'
import StationList from './components/StationList.vue'
import YandexMap from './components/YandexMap.vue'
import { gasStations } from './data/stations'
import type { GasStation, FuelType } from './types/station'

const isMobile = ref(window.innerWidth < 768)
const showFilters = ref(false)
const showList = ref(!isMobile.value)
const activeFilters = ref<FuelType[]>([])
const availability = ref<'all' | 'available' | 'empty'>('all')
const activeBrand = ref('all')
const selectedStation = ref<GasStation | null>(null)
const mapRef = ref<InstanceType<typeof YandexMap> | null>(null)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    showFilters.value = false
    showList.value = false
  } else {
    showList.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const filteredStations = computed(() => {
  let result = gasStations

  if (activeBrand.value !== 'all') {
    result = result.filter((s) => s.brand === activeBrand.value)
  }

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

const setBrand = (value: string) => {
  activeBrand.value = value
}

const resetFilters = () => {
  activeFilters.value = []
  availability.value = 'all'
  activeBrand.value = 'all'
  selectedStation.value = null
  showFilters.value = false
  ;(mapRef.value as any)?.resetZoom()
}

const selectStation = (station: GasStation) => {
  selectedStation.value = station
  showFilters.value = false
  showList.value = false
}

const selectStationFromList = (station: GasStation) => {
  selectedStation.value = station
  showList.value = false
  showFilters.value = false
  setTimeout(() => {
    ;(mapRef.value as any)?.moveToStation(station)
  }, 100)
}

const closeCard = () => {
  selectedStation.value = null
}

const onMapClick = () => {
  showList.value = false
  showFilters.value = false
}

const toggleList = () => {
  selectedStation.value = null
  showFilters.value = false
  showList.value = !showList.value
}

const toggleFilters = () => {
  selectedStation.value = null
  showList.value = false
  showFilters.value = !showFilters.value
}
</script>

<template>
  <div class="app">
    <AppNavbar
      :show-list="showList"
      :show-filters="showFilters"
      :is-mobile="isMobile"
      @filter="toggleFilters"
      @list="toggleList"
    />

    <div :class="['map-area', { 'map-area--mobile': isMobile }]">
      <Transition name="slide-up">
        <StationList
          v-if="showList"
          :stations="filteredStations"
          :selected-id="selectedStation?.id ?? null"
          :is-mobile="isMobile"
          :visible="showList"
          @select="selectStationFromList"
          @close="showList = false"
        />
      </Transition>

      <FuelFilters
        :visible="showFilters"
        :active-filters="activeFilters"
        :availability="availability"
        :active-brand="activeBrand"
        :is-mobile="isMobile"
        @toggle="toggleFilter"
        @availability="setAvailability"
        @brand="setBrand"
        @reset="resetFilters"
        @close="showFilters = false"
      />

      <YandexMap
        ref="mapRef"
        :stations="filteredStations"
        :selected-id="selectedStation?.id ?? null"
        :is-mobile="isMobile"
        @select="selectStation"
        @deselect="closeCard"
        @map-click="onMapClick"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: var(--bg);
}

.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;

  &--mobile {
    padding-bottom: 60px;
  }
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

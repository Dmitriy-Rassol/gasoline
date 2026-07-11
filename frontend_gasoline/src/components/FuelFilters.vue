<script setup lang="ts">
import { ref, computed } from 'vue'
import { FUEL_LABELS } from '../types/station'
import type { FuelType } from '../types/station'
import { X } from '@lucide/vue'

const props = defineProps<{
  activeFilters: FuelType[]
  availability: 'all' | 'available' | 'empty'
  activeBrand: string
  visible: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', type: FuelType): void
  (e: 'availability', value: 'all' | 'available' | 'empty'): void
  (e: 'brand', value: string): void
  (e: 'reset'): void
  (e: 'close'): void
}>()

const fuelTypes: FuelType[] = ['ai92', 'ai95', 'ai98', 'diesel']

const brands = [
  { id: 'all', name: 'Все' },
  { id: 'lukoil', name: 'Лукойл' },
  { id: 'gazprom', name: 'Газпромнефть' },
  { id: 'tatneft', name: 'Татнефть' },
  { id: 'teboil', name: 'Teboil' },
  { id: 'enticom', name: 'Энтиком' },
  { id: 'espo', name: 'Эспо' },
]

const isActive = (type: FuelType) => props.activeFilters.includes(type)

const touchStartY = ref(0)
const touchDeltaY = ref(0)
const isDragging = ref(false)
const isClosing = ref(false)

const onTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
  touchDeltaY.value = 0
  isDragging.value = true
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  touchDeltaY.value = Math.max(0, e.touches[0].clientY - touchStartY.value)
}

const onTouchEnd = () => {
  isDragging.value = false
  if (touchDeltaY.value > 80) {
    isClosing.value = true
    touchDeltaY.value = window.innerHeight
    setTimeout(() => {
      emit('close')
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
</script>

<template>
  <!-- Desktop sidebar -->
  <Transition name="slide-right">
    <aside v-if="visible && !isMobile" class="sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">Фильтры</h3>
        <button class="sidebar-close" @click="emit('close')">
          <X :size="18" />
        </button>
      </div>

      <div class="sidebar-content">
        <div class="section">
          <div class="section-label">Бренд</div>
          <div class="pills">
            <button
              v-for="brand in brands"
              :key="brand.id"
              :class="['pill', { active: activeBrand === brand.id }]"
              @click="emit('brand', brand.id)"
            >
              {{ brand.name }}
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-label">Наличие</div>
          <div class="pills">
            <button
              :class="['pill', { active: availability === 'all' }]"
              @click="emit('availability', 'all')"
            >
              Все АЗС
            </button>
            <button
              :class="['pill pill--green', { active: availability === 'available' }]"
              @click="emit('availability', 'available')"
            >
              Есть топливо
            </button>
            <button
              :class="['pill pill--red', { active: availability === 'empty' }]"
              @click="emit('availability', 'empty')"
            >
              Нет топлива
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-label">Тип топлива</div>
          <div class="pills">
            <button
              v-for="type in fuelTypes"
              :key="type"
              :class="['pill', { active: isActive(type) }]"
              @click="emit('toggle', type)"
            >
              {{ FUEL_LABELS[type] }}
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button
          class="reset-btn"
          @click="emit('reset')"
        >
          Сбросить фильтры
        </button>
      </div>
    </aside>
  </Transition>

  <!-- Mobile bottom sheet -->
  <Transition name="slide-up">
    <div v-if="visible && isMobile" class="mobile-filters" :style="sheetStyle">
      <div
        class="mobile-handle"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div class="handle-bar"></div>
      </div>

      <div class="mobile-sticky">
        <div class="mobile-header">
          <h3 class="mobile-title">Фильтры</h3>
          <button class="mobile-close" @click="emit('close')">
            <X :size="20" />
          </button>
        </div>
        <button
          class="mobile-reset"
          @click="emit('reset')"
        >
          Сбросить фильтры
        </button>
      </div>

      <div class="mobile-content">
        <div class="mobile-section">
          <div class="section-label">Бренд</div>
          <div class="mobile-pills">
            <button
              v-for="brand in brands"
              :key="brand.id"
              :class="['mobile-pill', { active: activeBrand === brand.id }]"
              @click="emit('brand', brand.id)"
            >
              {{ brand.name }}
            </button>
          </div>
        </div>

        <div class="mobile-section">
          <div class="section-label">Наличие</div>
          <div class="mobile-pills">
            <button
              :class="['mobile-pill', { active: availability === 'all' }]"
              @click="emit('availability', 'all')"
            >
              Все АЗС
            </button>
            <button
              :class="['mobile-pill mobile-pill--green', { active: availability === 'available' }]"
              @click="emit('availability', 'available')"
            >
              Есть топливо
            </button>
            <button
              :class="['mobile-pill mobile-pill--red', { active: availability === 'empty' }]"
              @click="emit('availability', 'empty')"
            >
              Нет топлива
            </button>
          </div>
        </div>

        <div class="mobile-section">
          <div class="section-label">Тип топлива</div>
          <div class="mobile-pills">
            <button
              v-for="type in fuelTypes"
              :key="type"
              :class="['mobile-pill', { active: isActive(type) }]"
              @click="emit('toggle', type)"
            >
              {{ FUEL_LABELS[type] }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
/* Desktop sidebar */
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--gray-200);
  z-index: 30;
  display: flex;
  flex-direction: column;
  animation: slideRight 0.25s ease;

  @media (min-width: 768px) {
    width: 340px;
  }
}

@keyframes slideRight {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--gray-100);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
}

.sidebar-close {
  width: 32px;
  height: 32px;
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

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 100px;
  }
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--gray-100);
  flex-shrink: 0;
}

.section {
  margin-bottom: 20px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray-400);
  margin-bottom: 10px;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill {
  padding: 6px 14px;
  border: 1px solid var(--gray-200);
  border-radius: 100px;
  background: var(--white);
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  transition: all var(--transition);

  &:hover {
    border-color: var(--gray-300);
    background: var(--gray-50);
  }

  &.active {
    background: var(--blue);
    color: white;
    border-color: var(--blue);
  }

  &--green.active {
    background: #22C55E;
    border-color: #22C55E;
  }

  &--red.active {
    background: #EF4444;
    border-color: #EF4444;
  }
}

.reset-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #FECACA;
  border-radius: 10px;
  background: #FEF2F2;
  font-size: 13px;
  font-weight: 600;
  color: #EF4444;
  transition: all var(--transition);

  &:hover {
    background: #FEE2E2;
  }
}

/* Mobile */
.mobile-filters {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 45;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.mobile-handle {
  padding: 12px 0 0;
  touch-action: none;
  cursor: grab;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin: 0 auto;
}

.mobile-sticky {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gray-100);
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
}

.mobile-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
}

.mobile-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
}

.mobile-reset {
  display: block;
  width: calc(100% - 32px);
  margin: 0 16px;
  padding: 10px;
  border: 1px solid #FECACA;
  border-radius: 10px;
  background: #FEF2F2;
  font-size: 13px;
  font-weight: 600;
  color: #EF4444;
  text-align: center;
  transition: all var(--transition);

  &:active {
    transform: scale(0.98);
  }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 16px;
}

.mobile-section {
  padding: 16px 16px 8px;
}

.mobile-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-pill {
  padding: 8px 16px;
  border: 1px solid var(--gray-200);
  border-radius: 100px;
  background: var(--white);
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-600);
  transition: all var(--transition);

  &.active {
    background: var(--blue);
    color: white;
    border-color: var(--blue);
  }

  &--green.active {
    background: #22C55E;
    border-color: #22C55E;
  }

  &--red.active {
    background: #EF4444;
    border-color: #EF4444;
  }
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
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

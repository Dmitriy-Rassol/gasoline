<script setup lang="ts">
import { FUEL_LABELS } from '../types/station'
import type { FuelType } from '../types/station'

const props = defineProps<{
  activeFilters: FuelType[]
  availability: 'all' | 'available' | 'empty'
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', type: FuelType): void
  (e: 'availability', value: 'all' | 'available' | 'empty'): void
}>()

const fuelTypes: FuelType[] = ['ai92', 'ai95', 'ai98', 'diesel']

const isActive = (type: FuelType) => props.activeFilters.includes(type)
</script>

<template>
  <Transition name="slide-down">
    <div v-if="visible" class="filters">
      <div class="filters-group">
        <button
          :class="['pill pill--all', { active: availability === 'all' }]"
          @click="emit('availability', 'all')"
        >
          Все АЗС
        </button>
        <button
          :class="['pill pill--green', { active: availability === 'available' }]"
          @click="emit('availability', 'available')"
        >
          <span class="dot dot--green"></span>
          Есть топливо
        </button>
        <button
          :class="['pill pill--red', { active: availability === 'empty' }]"
          @click="emit('availability', 'empty')"
        >
          <span class="dot dot--red"></span>
          Нет топлива
        </button>
      </div>

      <div class="divider"></div>

      <div class="filters-group">
        <button
          v-for="type in fuelTypes"
          :key="type"
          :class="['pill pill--fuel', { active: isActive(type) }]"
          @click="emit('toggle', type)"
        >
          {{ FUEL_LABELS[type] }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filters-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--gray-200);
  flex-shrink: 0;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--gray-200);
  border-radius: 100px;
  background: var(--white);
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  white-space: nowrap;
  transition: all var(--transition);

  &:hover {
    border-color: var(--gray-300);
    background: var(--gray-50);
  }

  &.active {
    color: white;
    border-color: transparent;
  }

  &--all.active {
    background: var(--blue);
  }

  &--green.active {
    background: #22C55E;
  }

  &--red.active {
    background: #EF4444;
  }

  &--fuel.active {
    background: var(--blue);
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &--green {
    background: #22C55E;

    .pill.active & {
      background: rgba(255, 255, 255, 0.6);
    }
  }

  &--red {
    background: #EF4444;

    .pill.active & {
      background: rgba(255, 255, 255, 0.6);
    }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>

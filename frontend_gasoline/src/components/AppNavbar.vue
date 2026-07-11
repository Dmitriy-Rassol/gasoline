<script setup lang="ts">
import { SlidersHorizontal, List } from '@lucide/vue'

defineProps<{
  showList: boolean
}>()

defineEmits<{
  (e: 'filter'): void
  (e: 'list'): void
}>()
</script>

<template>
  <header class="navbar">
    <div class="navbar-left">
      <div class="logo">
       <img width="32" src="../assets/azs_logo.png" alt="логотип">
        <span class="logo-text"> Карта наличия топлива на АЗС в городском округе Череповец</span>
      </div>
    </div>

    <div class="navbar-right">
      <button :class="['icon-btn', { active: showList }]" title="Список" @click="$emit('list')">
        <List :size="18" />
      </button>
      <button class="icon-btn" title="Фильтры" @click="$emit('filter')">
        <SlidersHorizontal :size="18" />
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 20px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  z-index: 50;
  flex-shrink: 0;
}

.navbar-left {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--blue), var(--blue-dark));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.3px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  background: var(--white);
  color: var(--gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);

  &:hover {
    background: var(--gray-50);
    color: var(--gray-900);
    border-color: var(--gray-300);
  }

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: var(--blue);
    color: white;
    border-color: var(--blue);
  }
}
</style>

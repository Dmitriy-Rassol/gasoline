<script setup lang="ts">
import { SlidersHorizontal, List, Sun, Moon } from '@lucide/vue'
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()

defineProps<{
  showList: boolean
  showFilters: boolean
  isMobile: boolean
}>()

defineEmits<{
  (e: 'filter'): void
  (e: 'list'): void
}>()
</script>

<template>
  <header v-if="!isMobile" class="navbar">
    <div class="navbar-left">
      <div class="logo">
        <img width="32" src="../assets/azs_logo.png" alt="логотип">
        <span class="logo-text">Карта наличия топлива на АЗС в городском округе Череповец</span>
      </div>
    </div>

    <div class="navbar-right">
      <button :class="['icon-btn', { active: showList }]" title="Список" @click="$emit('list')">
        <List :size="18" />
      </button>
      <button :class="['icon-btn', { active: showFilters }]" title="Фильтры" @click="$emit('filter')">
        <SlidersHorizontal :size="18" />
      </button>
      <button class="icon-btn" title="Тема" @click="toggle">
        <Sun v-if="theme === 'dark'" :size="18" />
        <Moon v-else :size="18" />
      </button>
    </div>
  </header>

  <nav v-if="isMobile" class="bottom-nav">
    <button :class="['nav-btn', { active: showList }]" @click="$emit('list')">
      <List :size="20" />
      <span>Список</span>
    </button>
    <button :class="['nav-btn', { active: showFilters }]" @click="$emit('filter')">
      <SlidersHorizontal :size="20" />
      <span>Фильтр</span>
    </button>
    <button class="nav-btn" @click="toggle">
      <Sun v-if="theme === 'dark'" :size="20" />
      <Moon v-else :size="20" />
      <span>Тема</span>
    </button>
  </nav>
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
  min-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.3px;
  white-space: nowrap;

  @media (min-width: 1024px) {
    font-size: 18px;
  }
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

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background: var(--white);
  border-top: 1px solid var(--gray-200);
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--gray-500);
  font-size: 11px;
  font-weight: 500;
  transition: all var(--transition);

  &.active {
    color: var(--blue);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>

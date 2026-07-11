import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light')

const apply = (t: Theme) => {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

apply(theme.value)

watch(theme, apply)

export function useTheme() {
  const toggle = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggle }
}

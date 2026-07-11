import { createApp } from 'vue'
import { createYmaps } from 'vue-yandex-maps'
import './style.scss'
import App from './App.vue'

const app = createApp(App)

app.use(createYmaps({
  apikey: import.meta.env.VITE_YANDEX_MAPS_APIKEY,
}))

app.mount('#app')

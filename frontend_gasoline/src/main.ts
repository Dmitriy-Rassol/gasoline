import { createApp } from 'vue'
import { createYmaps } from 'vue-yandex-maps'
import './style.scss'
import App from './App.vue'

const app = createApp(App)

const apikey = import.meta.env.VITE_YANDEX_MAPS_APIKEY || 'decf9c26-db06-4cca-a93f-5ad27dc48b15'

app.use(createYmaps({
  apikey,
}))

app.mount('#app')

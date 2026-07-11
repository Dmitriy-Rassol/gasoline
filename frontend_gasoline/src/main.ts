import { createApp } from 'vue'
import { createYmaps } from 'vue-yandex-maps'
import './style.scss'
import App from './App.vue'

const app = createApp(App)

const apikey = import.meta.env.VITE_YANDEX_MAPS_APIKEY || '98738c44-43e2-451c-8892-a5d93597b233'

app.use(createYmaps({
  apikey,
}))

app.mount('#app')

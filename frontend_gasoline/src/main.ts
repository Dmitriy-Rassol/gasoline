import { createApp } from 'vue'
import { createYmaps } from 'vue-yandex-maps'
import './style.scss'
import App from './App.vue'

const app = createApp(App)

app.use(createYmaps({
  apikey: 'decf9c26-db06-4cca-a93f-5ad27dc48b15',
}))

app.mount('#app')

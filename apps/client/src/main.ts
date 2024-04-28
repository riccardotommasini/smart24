import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from './plugins/axios'
import { env } from './env'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(axios, { baseUrl: env.VITE_SERVER_URL })

app.mount('#app')

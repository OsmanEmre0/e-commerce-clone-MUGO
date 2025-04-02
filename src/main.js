import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store/cart'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
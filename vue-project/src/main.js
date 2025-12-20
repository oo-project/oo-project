import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ★ 1. 引入簽名套件
import VueSignaturePad from 'vue-signature-pad'

const app = createApp(App)

app.use(router)
// ★ 2. 註冊簽名套件
app.use(VueSignaturePad)

app.mount('#app')
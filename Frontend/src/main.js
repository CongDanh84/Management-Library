import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/auth.js'
import '../src/assets/style.css'

const app = createApp(App)
app.use(createPinia())

// Khởi tạo auth store TRƯỚC khi mount: đăng ký callback xử lý refresh token thất bại
// và thử khôi phục phiên đăng nhập từ cookie (nếu có) trước khi render UI,
// tránh nháy màn hình "chưa đăng nhập" rồi mới bật lại.
const auth = useAuthStore()
await auth.init();
app.use(router)
app.mount('#app');


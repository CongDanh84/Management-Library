<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { ROUTE_NAMES } from '../../constants/routes'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const form = ref({ MaDocGia: '', Password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.value.MaDocGia || !form.value.Password) {
    errorMsg.value = 'Vui lòng nhập đầy đủ mã độc giả và mật khẩu.'
    return
  }
  loading.value = true
  try {
    await auth.loginReader(form.value)
    toast.success('Đăng nhập thành công!')
    router.push(route.query.redirect || { name: ROUTE_NAMES.BOOK_LIST })
  } catch (err) {
    errorMsg.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form-wrap fade-stagger">
    <div class="card auth-card">
      <span class="eyebrow">Độc giả</span>
      <h1>Đăng nhập</h1>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="madg">Mã độc giả</label>
          <input id="madg" v-model="form.MaDocGia" placeholder="DG0001" autocomplete="username" />
        </div>
        <div class="field">
          <label for="pw">Mật khẩu</label>
          <input id="pw" v-model="form.Password" type="password" autocomplete="current-password" />
        </div>
        <p v-if="errorMsg" class="field-error">{{ errorMsg }}</p>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? 'Đang đăng nhập…' : 'Đăng nhập' }}
        </button>
      </form>
      <p class="auth-switch">
        Chưa có tài khoản? <RouterLink :to="{ name: ROUTE_NAMES.REGISTER_READER }">Đăng ký</RouterLink> ·
        <RouterLink :to="{ name: ROUTE_NAMES.LOGIN_STAFF }">Đăng nhập nhân viên</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-form-wrap { max-width: 420px; margin: var(--space-7) auto; }
.auth-card { padding: var(--space-7); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
h1 { margin: var(--space-2) 0 var(--space-6); font-size: 26px; }
.auth-switch { margin-top: var(--space-5); text-align: center; font-size: 13px; color: var(--color-ink-soft); }
.auth-switch a { color: var(--color-primary); font-weight: 600; }
</style>

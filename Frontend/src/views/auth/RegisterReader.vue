<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validatePassword, validateRequired, validatePhone } from '../../utils/validators'
import { ROUTE_NAMES } from '../../constants/routes'

const auth = useAuthStore()
const toast = useToast()

const form = reactive({
  Hoten: '', NgaySinh: '', Phai: 'Nam', DiaChi: '', DienThoai: '', Password: ''
})
const confirmPassword = ref('')
const errors = reactive({})
const loading = ref(false)
const successCode = ref('')

function validate() {
  errors.Hoten = validateRequired(form.Hoten, 'Họ tên')
  errors.NgaySinh = validateRequired(form.NgaySinh, 'Ngày sinh')
  errors.DiaChi = validateRequired(form.DiaChi, 'Địa chỉ')
  errors.DienThoai = validatePhone(form.DienThoai)
  errors.Password = validatePassword(form.Password)
  errors.confirmPassword = confirmPassword.value !== form.Password ? 'Mật khẩu nhập lại không khớp.' : ''
  return Object.values(errors).every((e) => !e)
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  try {
    const res = await auth.registerReader(form)
    successCode.value = res.MaDocGia
    toast.success('Đăng ký thành công!')
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form-wrap fade-stagger">
    <div v-if="successCode" class="card auth-card success-box">
      <span class="success-icon">✓</span>
      <h1>Đăng ký thành công</h1>
      <p>Mã độc giả của bạn là:</p>
      <span class="code-stamp code-stamp-lg">{{ successCode }}</span>
      <p class="hint">Hãy lưu lại mã này để đăng nhập.</p>
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN_READER }" class="btn btn-primary btn-block">Đến trang đăng nhập</RouterLink>
    </div>

    <div v-else class="card auth-card">
      <span class="eyebrow">Độc giả mới</span>
      <h1>Đăng ký tài khoản</h1>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="hoten">Họ tên</label>
          <input id="hoten" v-model="form.Hoten" :class="{ invalid: errors.Hoten }" />
          <span v-if="errors.Hoten" class="field-error">{{ errors.Hoten }}</span>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ngaysinh">Ngày sinh</label>
            <input id="ngaysinh" v-model="form.NgaySinh" type="date" :class="{ invalid: errors.NgaySinh }" />
            <span v-if="errors.NgaySinh" class="field-error">{{ errors.NgaySinh }}</span>
          </div>
          <div class="field">
            <label for="phai">Giới tính</label>
            <select id="phai" v-model="form.Phai">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="diachi">Địa chỉ</label>
          <input id="diachi" v-model="form.DiaChi" :class="{ invalid: errors.DiaChi }" />
          <span v-if="errors.DiaChi" class="field-error">{{ errors.DiaChi }}</span>
        </div>
        <div class="field">
          <label for="dienthoai">Điện thoại</label>
          <input id="dienthoai" v-model="form.DienThoai" placeholder="0912345678" :class="{ invalid: errors.DienThoai }" />
          <span v-if="errors.DienThoai" class="field-error">{{ errors.DienThoai }}</span>
        </div>
        <div class="field">
          <label for="pw">Mật khẩu</label>
          <input id="pw" v-model="form.Password" type="password" :class="{ invalid: errors.Password }" />
          <span v-if="errors.Password" class="field-error">{{ errors.Password }}</span>
          <span v-else class="hint">Tối thiểu 8 ký tự, gồm chữ, số và ký tự đặc biệt.</span>
        </div>
        <div class="field">
          <label for="pw2">Nhập lại mật khẩu</label>
          <input id="pw2" v-model="confirmPassword" type="password" :class="{ invalid: errors.confirmPassword }" />
          <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
        </div>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? 'Đang đăng ký…' : 'Đăng ký' }}
        </button>
      </form>
      <p class="auth-switch">
        Đã có tài khoản? <RouterLink :to="{ name: ROUTE_NAMES.LOGIN_READER }">Đăng nhập</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-form-wrap { max-width: 460px; margin: var(--space-7) auto; }
.auth-card { padding: var(--space-7); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
h1 { margin: var(--space-2) 0 var(--space-6); font-size: 26px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.hint { font-size: 12px; color: var(--color-ink-faint); }
.auth-switch { margin-top: var(--space-5); text-align: center; font-size: 13px; color: var(--color-ink-soft); }
.auth-switch a { color: var(--color-primary); font-weight: 600; }
.success-box { text-align: center; }
.success-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--color-success-tint); color: var(--color-success);
  font-size: 22px; margin-bottom: var(--space-4);
}
.code-stamp-lg { font-size: 18px; padding: 8px 20px; margin: var(--space-4) 0; }
.success-box .btn { margin-top: var(--space-6); }
</style>

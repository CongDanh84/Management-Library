<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileApi } from '../../api/profileApi'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validateRequired, validatePhone, validatePassword } from '../../utils/validators'
import { ROUTE_NAMES } from '../../constants/routes'
import ConfirmModal from '../../components/common/ConfirmModal.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const form = reactive({ Hoten: '', NgaySinh: '', Phai: 'Nam', DiaChi: '', DienThoai: '' })
const errors = reactive({})

const pwForm = reactive({ passwordCu: '', passwordMoi: '', confirmPasswordMoi: '' })
const pwErrors = reactive({})
const changingPw = ref(false)
const showLogoutModal = ref(false)

function toDateInputValue(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().slice(0, 10)
}

async function loadProfile() {
  loading.value = true
  try {
    const { data } = await profileApi.getMyProfile()
    form.Hoten = data.Hoten || ''
    form.NgaySinh = toDateInputValue(data.NgaySinh)
    form.Phai = data.Phai || 'Nam'
    form.DiaChi = data.DiaChi || ''
    form.DienThoai = data.DienThoai || ''
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

function validateProfile() {
  errors.Hoten = validateRequired(form.Hoten, 'Họ tên')
  errors.DiaChi = validateRequired(form.DiaChi, 'Địa chỉ')
  errors.DienThoai = validatePhone(form.DienThoai)
  return Object.values(errors).every((e) => !e)
}

async function handleSaveProfile() {
  if (!validateProfile()) return
  saving.value = true
  try {
    await profileApi.updateMyProfile(form)
    auth.updateLocalUser({ Hoten: form.Hoten })
    toast.success('Cập nhật thông tin thành công!')
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    saving.value = false
  }
}

function validatePwForm() {
  pwErrors.passwordCu = validateRequired(pwForm.passwordCu, 'Mật khẩu hiện tại')
  pwErrors.passwordMoi = validatePassword(pwForm.passwordMoi)
  pwErrors.confirmPasswordMoi =
    pwForm.confirmPasswordMoi !== pwForm.passwordMoi ? 'Mật khẩu nhập lại không khớp.' : ''
  return Object.values(pwErrors).every((e) => !e)
}

async function handleChangePassword() {
  if (!validatePwForm()) return
  changingPw.value = true
  try {
    await profileApi.changeMyPassword({
      passwordCu: pwForm.passwordCu,
      passwordMoi: pwForm.passwordMoi
    })
    // Access token (JWT) vẫn còn hiệu lực tới khi hết hạn tự nhiên (15 phút) dù
    // refresh token đã bị backend revoke — revoke chỉ chặn được lần refresh KẾ TIẾP,
    // không thu hồi access token đang sống. Vì vậy KHÔNG cần xóa session ngay lúc này;
    // chỉ xóa + điều hướng khi người dùng chủ động bấm "Đăng nhập lại" bên dưới,
    // để họ luôn thấy rõ thông báo thành công trước khi phiên thực sự kết thúc.
    showLogoutModal.value = true
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    changingPw.value = false
  }
}

function goToLoginAfterPwChange() {
  auth.clearSession()
  router.push({ name: ROUTE_NAMES.LOGIN_READER })
}

onMounted(loadProfile)
</script>

<template>
  <div class="profile-page">
    <div class="page-head fade-stagger">
      <span class="eyebrow">Độc giả</span>
      <h1>Trang cá nhân</h1>
      <span class="code-stamp">{{ auth.myCode }}</span>
    </div>

    <div v-if="loading" class="skeleton" style="height: 320px;"></div>

    <div v-else class="profile-grid">
      <div class="card profile-section fade-stagger">
        <h3>Thông tin cá nhân</h3>
        <form @submit.prevent="handleSaveProfile">
          <div class="field">
            <label for="hoten">Họ tên</label>
            <input id="hoten" v-model="form.Hoten" :class="{ invalid: errors.Hoten }" />
            <span v-if="errors.Hoten" class="field-error">{{ errors.Hoten }}</span>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="ngaysinh">Ngày sinh</label>
              <input id="ngaysinh" v-model="form.NgaySinh" type="date" />
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
            <input id="dienthoai" v-model="form.DienThoai" :class="{ invalid: errors.DienThoai }" />
            <span v-if="errors.DienThoai" class="field-error">{{ errors.DienThoai }}</span>
          </div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Đang lưu…' : 'Lưu thay đổi' }}
          </button>
        </form>
      </div>

      <div class="card profile-section fade-stagger">
        <h3>Đổi mật khẩu</h3>
        <p class="hint">Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.</p>
        <form @submit.prevent="handleChangePassword">
          <div class="field">
            <label for="pwcu">Mật khẩu hiện tại</label>
            <input id="pwcu" v-model="pwForm.passwordCu" type="password" :class="{ invalid: pwErrors.passwordCu }" />
            <span v-if="pwErrors.passwordCu" class="field-error">{{ pwErrors.passwordCu }}</span>
          </div>
          <div class="field">
            <label for="pwmoi">Mật khẩu mới</label>
            <input id="pwmoi" v-model="pwForm.passwordMoi" type="password" :class="{ invalid: pwErrors.passwordMoi }" />
            <span v-if="pwErrors.passwordMoi" class="field-error">{{ pwErrors.passwordMoi }}</span>
          </div>
          <div class="field">
            <label for="pwmoi2">Nhập lại mật khẩu mới</label>
            <input id="pwmoi2" v-model="pwForm.confirmPasswordMoi" type="password" :class="{ invalid: pwErrors.confirmPasswordMoi }" />
            <span v-if="pwErrors.confirmPasswordMoi" class="field-error">{{ pwErrors.confirmPasswordMoi }}</span>
          </div>
          <button class="btn btn-secondary" type="submit" :disabled="changingPw">
            {{ changingPw ? 'Đang xử lý…' : 'Đổi mật khẩu' }}
          </button>
        </form>
      </div>
    </div>

    <ConfirmModal
      v-model="showLogoutModal"
      title="Đổi mật khẩu thành công"
      message="Mật khẩu của bạn đã được cập nhật. Để đảm bảo an toàn, vui lòng đăng nhập lại bằng mật khẩu mới."
      confirm-text="Đăng nhập lại"
      force-confirm
      @confirm="goToLoginAfterPwChange"
    />
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; }
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); align-items: start; }
.profile-section { padding: var(--space-6); }
.profile-section h3 { font-size: 17px; margin-bottom: var(--space-4); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.hint { font-size: 13px; color: var(--color-ink-faint); margin-bottom: var(--space-4); }
@media (max-width: 780px) { .profile-grid { grid-template-columns: 1fr; } }
</style>
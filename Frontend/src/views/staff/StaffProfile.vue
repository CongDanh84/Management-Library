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
const form = reactive({ HotenNV: '', DiaChi: '', SoDienThoai: '' })
const errors = reactive({})

const pwForm = reactive({ passwordCu: '', passwordMoi: '', confirmPasswordMoi: '' })
const pwErrors = reactive({})
const changingPw = ref(false)
const showLogoutModal = ref(false)

async function loadProfile() {
  loading.value = true
  try {
    const { data } = await profileApi.getStaffProfile()
    form.HotenNV = data.HotenNV || ''
    form.DiaChi = data.DiaChi || ''
    form.SoDienThoai = data.SoDienThoai || ''
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

function validateProfile() {
  errors.HotenNV = validateRequired(form.HotenNV, 'Họ tên')
  errors.DiaChi = validateRequired(form.DiaChi, 'Địa chỉ')
  errors.SoDienThoai = validatePhone(form.SoDienThoai)
  return Object.values(errors).every((e) => !e)
}

async function handleSaveProfile() {
  if (!validateProfile()) return
  saving.value = true
  try {
    await profileApi.updateStaffProfile(form)
    auth.updateLocalUser({ HotenNV: form.HotenNV })
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
    await profileApi.changeStaffPassword({
      passwordCu: pwForm.passwordCu,
      passwordMoi: pwForm.passwordMoi
    })
    // Giống Reader: access token vẫn còn hiệu lực tới khi hết hạn tự nhiên dù refresh token
    // đã bị revoke, nên chỉ xóa session khi người dùng chủ động bấm "Đăng nhập lại".
    showLogoutModal.value = true
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    changingPw.value = false
  }
}

function goToLoginAfterPwChange() {
  auth.clearSession()
  router.push({ name: ROUTE_NAMES.LOGIN_STAFF })
}

onMounted(loadProfile)
</script>

<template>
  <div class="profile-page">
    <div class="page-head fade-stagger">
      <span class="eyebrow">{{ auth.isAdmin ? 'Quản trị' : 'Thủ thư' }}</span>
      <h1>Hồ sơ nhân viên</h1>
      <span class="code-stamp">{{ auth.myCode }}</span>
    </div>

    <div v-if="loading" class="skeleton" style="height: 320px;"></div>

    <div v-else class="profile-grid">
      <div class="card profile-section fade-stagger">
        <h3>Thông tin cá nhân</h3>
        <form @submit.prevent="handleSaveProfile">
          <div class="field">
            <label for="hotennv">Họ tên</label>
            <input id="hotennv" v-model="form.HotenNV" :class="{ invalid: errors.HotenNV }" />
            <span v-if="errors.HotenNV" class="field-error">{{ errors.HotenNV }}</span>
          </div>
          <div class="field">
            <label for="diachinv">Địa chỉ</label>
            <input id="diachinv" v-model="form.DiaChi" :class="{ invalid: errors.DiaChi }" />
            <span v-if="errors.DiaChi" class="field-error">{{ errors.DiaChi }}</span>
          </div>
          <div class="field">
            <label for="sdtnv">Điện thoại</label>
            <input id="sdtnv" v-model="form.SoDienThoai" :class="{ invalid: errors.SoDienThoai }" />
            <span v-if="errors.SoDienThoai" class="field-error">{{ errors.SoDienThoai }}</span>
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
.hint { font-size: 13px; color: var(--color-ink-faint); margin-bottom: var(--space-4); }
@media (max-width: 780px) { .profile-grid { grid-template-columns: 1fr; } }
</style>
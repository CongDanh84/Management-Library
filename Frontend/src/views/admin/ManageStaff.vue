<script setup>
import { ref, reactive, onMounted } from 'vue'
import { profileApi } from '../../api/profileApi'
import { authApi } from '../../api/authApi'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validateRequired, validatePassword } from '../../utils/validators'
import { CHUC_VU, TRANG_THAI_TAI_KHOAN } from '../../constants/index'
import EmptyState from '../../components/common/EmptyState.vue'

const toast = useToast()
const staffs = ref([])
const loading = ref(true)

async function loadStaffs() {
  loading.value = true
  try {
    const { data } = await profileApi.getStaffs() // không phân trang
    staffs.value = data
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

// ----- Tạo nhân viên mới -----
const showCreateModal = ref(false)
const createForm = reactive({ HotenNV: '', Password: '', ChucVu: CHUC_VU.THU_THU, DiaChi: '', SoDienThoai: '' })
const createErrors = reactive({})
const creating = ref(false)

function openCreateModal() {
  createForm.HotenNV = ''
  createForm.Password = ''
  createForm.ChucVu = CHUC_VU.THU_THU
  createForm.DiaChi = ''
  createForm.SoDienThoai = ''
  Object.keys(createErrors).forEach((k) => (createErrors[k] = ''))
  showCreateModal.value = true
}

function validateCreateForm() {
  createErrors.HotenNV = validateRequired(createForm.HotenNV, 'Họ tên')
  createErrors.Password = validatePassword(createForm.Password)
  createErrors.DiaChi = validateRequired(createForm.DiaChi, 'Địa chỉ')
  return Object.values(createErrors).every((e) => !e)
}

async function handleCreateStaff() {
  if (!validateCreateForm()) return
  creating.value = true
  try {
    const res = await authApi.registerStaff(createForm)
    toast.success(`Tạo nhân viên thành công! Mã: ${res.data.MSNV}`)
    showCreateModal.value = false
    loadStaffs()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    creating.value = false
  }
}

// ----- Sửa nhân viên -----
const showEditModal = ref(false)
const editForm = reactive({ MSNV: '', HotenNV: '', DiaChi: '', SoDienThoai: '', ChucVu: CHUC_VU.THU_THU, TrangThai: 'active' })
const saving = ref(false)

function openEdit(s) {
  editForm.MSNV = s.MSNV
  editForm.HotenNV = s.HotenNV || ''
  editForm.DiaChi = s.DiaChi || ''
  editForm.SoDienThoai = s.SoDienThoai || ''
  editForm.ChucVu = s.ChucVu || CHUC_VU.THU_THU
  editForm.TrangThai = s.TrangThai || 'active'
  showEditModal.value = true
}

async function handleSaveEdit() {
  saving.value = true
  try {
    await profileApi.updateStaffByAdmin(editForm.MSNV, {
      HotenNV: editForm.HotenNV,
      DiaChi: editForm.DiaChi,
      SoDienThoai: editForm.SoDienThoai,
      ChucVu: editForm.ChucVu,
      TrangThai: editForm.TrangThai
    })
    toast.success('Cập nhật nhân viên thành công!')
    showEditModal.value = false
    loadStaffs()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    saving.value = false
  }
}

// ----- Reset mật khẩu -----
const showResetModal = ref(false)
const resetTarget = ref(null)
const resetPassword = ref('')
const resetError = ref('')
const resetting = ref(false)

function openReset(s) {
  resetTarget.value = s
  resetPassword.value = ''
  resetError.value = ''
  showResetModal.value = true
}

async function handleResetPassword() {
  resetError.value = validatePassword(resetPassword.value)
  if (resetError.value) return
  resetting.value = true
  try {
    await profileApi.resetStaffPassword(resetTarget.value.MSNV, resetPassword.value)
    toast.success(`Đã đặt lại mật khẩu cho ${resetTarget.value.MSNV}.`)
    showResetModal.value = false
  } catch (err) {
    resetError.value = extractErrorMessage(err)
  } finally {
    resetting.value = false
  }
}

onMounted(loadStaffs)
</script>

<template>
  <div class="staffs-page">
    <div class="page-head fade-stagger">
      <div>
        <span class="eyebrow">Quản trị</span>
        <h1>Quản lý nhân sự</h1>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">+ Thêm nhân viên</button>
    </div>

    <div v-if="loading" class="skeleton" style="height: 240px;"></div>

    <EmptyState v-else-if="staffs.length === 0" title="Chưa có nhân viên nào" />

    <div v-else class="card staff-table fade-stagger">
      <div class="row row-head">
        <span>MSNV</span>
        <span>Họ tên</span>
        <span>Chức vụ</span>
        <span>Trạng thái</span>
        <span></span>
      </div>
      <div v-for="s in staffs" :key="s.MSNV" class="row">
        <span class="code-stamp">{{ s.MSNV }}</span>
        <span class="row-title">{{ s.HotenNV }}</span>
        <span>
          <span class="badge" :class="s.ChucVu === CHUC_VU.ADMIN ? 'badge-warning' : 'badge-neutral'">{{ s.ChucVu }}</span>
        </span>
        <span>
          <span class="badge" :class="s.TrangThai === TRANG_THAI_TAI_KHOAN.LOCKED ? 'badge-danger' : 'badge-success'">
            {{ s.TrangThai === TRANG_THAI_TAI_KHOAN.LOCKED ? 'Đã khóa' : 'Hoạt động' }}
          </span>
        </span>
        <span class="row-actions">
          <button class="btn btn-ghost btn-sm" @click="openEdit(s)">Sửa</button>
          <button class="btn btn-ghost btn-sm" @click="openReset(s)">Đặt lại mật khẩu</button>
        </span>
      </div>
    </div>

    <!-- Modal tạo nhân viên -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <div class="modal-box card">
            <h3>Thêm nhân viên mới</h3>
            <form @submit.prevent="handleCreateStaff">
              <div class="field">
                <label for="choten">Họ tên</label>
                <input id="choten" v-model="createForm.HotenNV" :class="{ invalid: createErrors.HotenNV }" />
                <span v-if="createErrors.HotenNV" class="field-error">{{ createErrors.HotenNV }}</span>
              </div>
              <div class="field">
                <label for="cpw">Mật khẩu</label>
                <input id="cpw" v-model="createForm.Password" type="password" :class="{ invalid: createErrors.Password }" />
                <span v-if="createErrors.Password" class="field-error">{{ createErrors.Password }}</span>
              </div>
              <div class="field">
                <label for="cchucvu">Chức vụ</label>
                <select id="cchucvu" v-model="createForm.ChucVu">
                  <option :value="CHUC_VU.THU_THU">ThuThu</option>
                  <option :value="CHUC_VU.ADMIN">Admin</option>
                </select>
              </div>
              <div class="field">
                <label for="cdiachi">Địa chỉ</label>
                <input id="cdiachi" v-model="createForm.DiaChi" :class="{ invalid: createErrors.DiaChi }" />
                <span v-if="createErrors.DiaChi" class="field-error">{{ createErrors.DiaChi }}</span>
              </div>
              <div class="field">
                <label for="csdt">Điện thoại</label>
                <input id="csdt" v-model="createForm.SoDienThoai" />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showCreateModal = false" :disabled="creating">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="creating">
                  {{ creating ? 'Đang tạo…' : 'Tạo' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal sửa nhân viên -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
          <div class="modal-box card">
            <h3>Sửa nhân viên <span class="code-stamp">{{ editForm.MSNV }}</span></h3>
            <form @submit.prevent="handleSaveEdit">
              <div class="field">
                <label for="ehoten">Họ tên</label>
                <input id="ehoten" v-model="editForm.HotenNV" />
              </div>
              <div class="field">
                <label for="ediachi">Địa chỉ</label>
                <input id="ediachi" v-model="editForm.DiaChi" />
              </div>
              <div class="field">
                <label for="esdt">Điện thoại</label>
                <input id="esdt" v-model="editForm.SoDienThoai" />
              </div>
              <div class="field">
                <label for="echucvu">Chức vụ</label>
                <select id="echucvu" v-model="editForm.ChucVu">
                  <option :value="CHUC_VU.THU_THU">ThuThu</option>
                  <option :value="CHUC_VU.ADMIN">Admin</option>
                </select>
              </div>
              <div class="field">
                <label for="etrangthai">Trạng thái</label>
                <select id="etrangthai" v-model="editForm.TrangThai">
                  <option value="active">Hoạt động</option>
                  <option value="locked">Khóa</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showEditModal = false" :disabled="saving">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Đang lưu…' : 'Lưu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal reset password -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showResetModal" class="modal-overlay" @click.self="showResetModal = false">
          <div class="modal-box card">
            <h3>Đặt lại mật khẩu — {{ resetTarget?.MSNV }}</h3>
            <form @submit.prevent="handleResetPassword">
              <div class="field">
                <label for="newpw2">Mật khẩu mới</label>
                <input id="newpw2" v-model="resetPassword" type="password" :class="{ invalid: resetError }" />
                <span v-if="resetError" class="field-error">{{ resetError }}</span>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showResetModal = false" :disabled="resetting">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="resetting">
                  {{ resetting ? 'Đang xử lý…' : 'Đặt lại' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; margin-top: var(--space-2); }

.staff-table { overflow-x: auto; }
.row {
  display: grid;
  grid-template-columns: 110px 1.3fr 110px 110px 220px;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  align-items: center;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 13.5px;
  min-width: 680px;
}
.row:last-child { border-bottom: none; }
.row-head { font-weight: 700; font-size: 12px; text-transform: uppercase; color: var(--color-ink-soft); background: var(--color-primary-tint); }
.row-title { font-weight: 600; }
.row-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(34, 38, 43, 0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: var(--space-5);
  overflow-y: auto;
}
.modal-box { padding: var(--space-6); max-width: 420px; width: 100%; margin: auto; }
.modal-box h3 { margin-bottom: var(--space-5); font-size: 18px; display: flex; align-items: center; gap: var(--space-2); }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s var(--ease); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
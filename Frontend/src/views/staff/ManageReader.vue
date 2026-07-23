<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { profileApi } from '../../api/profileApi'
import { useAuthStore } from '../../store/auth'
import { usePagination } from '../../composables/usePagination'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validatePassword } from '../../utils/validators'
import { TRANG_THAI_TAI_KHOAN } from '../../constants/index'
import EmptyState from '../../components/common/EmptyState.vue'
import SkeletonGrid from '../../components/common/SkeletonGrid.vue'
import Pagination from '../../components/common/Pagination.vue'
import ConfirmModal from '../../components/common/ConfirmModal.vue'

const auth = useAuthStore()
const toast = useToast()
const readers = ref([])
const loading = ref(true)
const { page, limit, totalItems, totalPages, applyPagination, goToPage } = usePagination(10)

async function loadReaders() {
  loading.value = true
  try {
    const { data } = await profileApi.getReaders({ page: page.value, limit: limit.value })
    readers.value = data.data || []
    applyPagination(data.pagination)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}
watch(page, loadReaders)

// ----- Modal xem/sửa chi tiết -----
const showEditModal = ref(false)
const editForm = reactive({ MaDocGia: '', Hoten: '', DiaChi: '', DienThoai: '', TrangThai: 'active' })
const saving = ref(false)

function openEdit(r) {
  editForm.MaDocGia = r.MaDocGia
  editForm.Hoten = r.Hoten || ''
  editForm.DiaChi = r.DiaChi || ''
  editForm.DienThoai = r.DienThoai || ''
  editForm.TrangThai = r.TrangThai || 'active'
  showEditModal.value = true
}

async function handleSaveEdit() {
  saving.value = true
  try {
    const payload = { Hoten: editForm.Hoten, DiaChi: editForm.DiaChi, DienThoai: editForm.DienThoai }
    if (auth.isAdmin) {
      // Chỉ Admin được sửa TrangThai (khóa/mở khóa)
      await profileApi.updateReaderByAdmin(editForm.MaDocGia, { ...payload, TrangThai: editForm.TrangThai })
    } else {
      await profileApi.updateReaderByStaff(editForm.MaDocGia, payload)
    }
    toast.success('Cập nhật độc giả thành công!')
    showEditModal.value = false
    loadReaders()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    saving.value = false
  }
}

// ----- Reset mật khẩu (Admin only) -----
const showResetModal = ref(false)
const resetTarget = ref(null)
const resetPassword = ref('')
const resetError = ref('')
const resetting = ref(false)

function openReset(r) {
  resetTarget.value = r
  resetPassword.value = ''
  resetError.value = ''
  showResetModal.value = true
}

async function handleResetPassword() {
  resetError.value = validatePassword(resetPassword.value)
  if (resetError.value) return
  resetting.value = true
  try {
    await profileApi.resetReaderPassword(resetTarget.value.MaDocGia, resetPassword.value)
    toast.success(`Đã đặt lại mật khẩu cho ${resetTarget.value.MaDocGia}.`)
    showResetModal.value = false
  } catch (err) {
    resetError.value = extractErrorMessage(err)
  } finally {
    resetting.value = false
  }
}

onMounted(loadReaders)
</script>

<template>
  <div class="readers-page">
    <div class="page-head fade-stagger">
      <span class="eyebrow">{{ auth.isAdmin ? 'Quản trị' : 'Thủ thư' }}</span>
      <h1>Danh sách độc giả</h1>
    </div>

    <SkeletonGrid v-if="loading" type="row" :count="6" />

    <EmptyState v-else-if="readers.length === 0" title="Chưa có độc giả nào" />

    <div v-else class="card reader-table fade-stagger">
      <div class="row row-head">
        <span>Mã độc giả</span>
        <span>Họ tên</span>
        <span>Điện thoại</span>
        <span>Trạng thái</span>
        <span></span>
      </div>
      <div v-for="r in readers" :key="r.MaDocGia" class="row">
        <span class="code-stamp">{{ r.MaDocGia }}</span>
        <span class="row-title">{{ r.Hoten }}</span>
        <span>{{ r.DienThoai }}</span>
        <span>
          <span class="badge" :class="r.TrangThai === TRANG_THAI_TAI_KHOAN.LOCKED ? 'badge-danger' : 'badge-success'">
            {{ r.TrangThai === TRANG_THAI_TAI_KHOAN.LOCKED ? 'Đã khóa' : 'Hoạt động' }}
          </span>
        </span>
        <span class="row-actions">
          <button class="btn btn-ghost btn-sm" @click="openEdit(r)">Sửa</button>
          <button v-if="auth.isAdmin" class="btn btn-ghost btn-sm" @click="openReset(r)">Đặt lại mật khẩu</button>
        </span>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" :total-items="totalItems" @change="goToPage" />

    <!-- Modal sửa độc giả -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
          <div class="modal-box card">
            <h3>Sửa độc giả <span class="code-stamp">{{ editForm.MaDocGia }}</span></h3>
            <form @submit.prevent="handleSaveEdit">
              <div class="field">
                <label for="rhoten">Họ tên</label>
                <input id="rhoten" v-model="editForm.Hoten" />
              </div>
              <div class="field">
                <label for="rdiachi">Địa chỉ</label>
                <input id="rdiachi" v-model="editForm.DiaChi" />
              </div>
              <div class="field">
                <label for="rdienthoai">Điện thoại</label>
                <input id="rdienthoai" v-model="editForm.DienThoai" />
              </div>
              <div v-if="auth.isAdmin" class="field">
                <label for="rtrangthai">Trạng thái tài khoản</label>
                <select id="rtrangthai" v-model="editForm.TrangThai">
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
            <h3>Đặt lại mật khẩu — {{ resetTarget?.MaDocGia }}</h3>
            <form @submit.prevent="handleResetPassword">
              <div class="field">
                <label for="newpw">Mật khẩu mới</label>
                <input id="newpw" v-model="resetPassword" type="password" :class="{ invalid: resetError }" />
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
.page-head { margin-bottom: var(--space-6); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; margin-top: var(--space-2); }

.reader-table { overflow-x: auto; }
.row {
  display: grid;
  grid-template-columns: 120px 1.4fr 130px 110px 220px;
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
}
.modal-box { padding: var(--space-6); max-width: 420px; width: 100%; }
.modal-box h3 { margin-bottom: var(--space-5); font-size: 18px; display: flex; align-items: center; gap: var(--space-2); }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s var(--ease); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

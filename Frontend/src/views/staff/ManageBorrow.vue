<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { borrowApi } from '../../api/borrowApi'
import { usePagination } from '../../composables/usePagination'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validateRequired, validateSoNgayMuon } from '../../utils/validators'
import { TRANG_THAI_MUON } from '../../constants/index'
import EmptyState from '../../components/common/EmptyState.vue'
import SkeletonGrid from '../../components/common/SkeletonGrid.vue'
import Pagination from '../../components/common/Pagination.vue'
import ConfirmModal from '../../components/common/ConfirmModal.vue'

const toast = useToast()
const borrows = ref([])
const loading = ref(true)
const { page, limit, totalItems, totalPages, applyPagination, goToPage } = usePagination(10)

const STATUS_LABEL = {
  [TRANG_THAI_MUON.DANG_MUON]: { text: 'Đang mượn', cls: 'badge-warning' },
  [TRANG_THAI_MUON.DA_TRA]: { text: 'Đã trả', cls: 'badge-success' },
  [TRANG_THAI_MUON.QUA_HAN]: { text: 'Quá hạn', cls: 'badge-danger' }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

async function loadBorrows() {
  loading.value = true
  try {
    const { data } = await borrowApi.getAllBorrows({ page: page.value, limit: limit.value })
    borrows.value = data.data || []
    applyPagination(data.pagination)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}
watch(page, loadBorrows)

// ----- Form tạo phiếu mượn giúp Reader -----
const showCreateModal = ref(false)
const createForm = reactive({ maDocGia: '', maSach: '', soNgayMuon: '' })
const createErrors = reactive({})
const creating = ref(false)

function openCreateModal() {
  createForm.maDocGia = ''
  createForm.maSach = ''
  createForm.soNgayMuon = ''
  Object.keys(createErrors).forEach((k) => (createErrors[k] = ''))
  showCreateModal.value = true
}

function validateCreateForm() {
  createErrors.maDocGia = validateRequired(createForm.maDocGia, 'Mã độc giả')
  createErrors.maSach = validateRequired(createForm.maSach, 'Mã sách')
  createErrors.soNgayMuon = validateSoNgayMuon(createForm.soNgayMuon)
  return Object.values(createErrors).every((e) => !e)
}

async function handleCreateBorrow() {
  if (!validateCreateForm()) return
  creating.value = true
  try {
    await borrowApi.borrowForReader({
      maDocGia: createForm.maDocGia,
      maSach: createForm.maSach,
      soNgayMuon: createForm.soNgayMuon ? Number(createForm.soNgayMuon) : undefined
    })
    toast.success('Tạo phiếu mượn thành công!')
    showCreateModal.value = false
    page.value = 1
    loadBorrows()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    creating.value = false
  }
}

// ----- Xác nhận trả sách -----
const showReturnModal = ref(false)
const returningId = ref(null)
const returningInfo = ref(null)
const returning = ref(false)

function openReturnModal(b) {
  returningId.value = b._id
  returningInfo.value = b
  showReturnModal.value = true
}

async function handleConfirmReturn() {
  returning.value = true
  try {
    const { data } = await borrowApi.returnBook(returningId.value)
    const tienPhat = data?.TienPhat || 0
    toast.success(
      tienPhat > 0
        ? `Xác nhận trả thành công! Tiền phạt: ${Number(tienPhat).toLocaleString('vi-VN')}đ`
        : 'Xác nhận trả thành công!'
    )
    showReturnModal.value = false
    loadBorrows()
  } catch (err) {
    toast.error(extractErrorMessage(err))
    showReturnModal.value = false
  } finally {
    returning.value = false
  }
}

onMounted(loadBorrows)
</script>

<template>
  <div class="borrows-page">
    <div class="page-head fade-stagger">
      <div>
        <span class="eyebrow">Thủ thư / Quản trị</span>
        <h1>Mượn / Trả sách</h1>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">+ Tạo phiếu mượn giúp</button>
    </div>

    <SkeletonGrid v-if="loading" type="row" :count="6" />

    <EmptyState v-else-if="borrows.length === 0" icon="tray" title="Chưa có phiếu mượn nào" />

    <div v-else class="card borrow-table fade-stagger">
      <div class="row row-head">
        <span>Độc giả</span>
        <span>Sách</span>
        <span>Ngày mượn</span>
        <span>Hạn trả</span>
        <span>Trạng thái</span>
        <span></span>
      </div>
      <div v-for="b in borrows" :key="b._id" class="row">
        <span class="code-stamp">{{ b.MaDocGia }}</span>
        <span class="code-stamp">{{ b.MaSach }}</span>
        <span>{{ formatDate(b.NgayMuon) }}</span>
        <span>{{ formatDate(b.HanTra) }}</span>
        <span>
          <span class="badge" :class="STATUS_LABEL[b.TrangThai]?.cls || 'badge-neutral'">
            {{ STATUS_LABEL[b.TrangThai]?.text || b.TrangThai }}
          </span>
        </span>
        <span class="row-actions">
          <button
            v-if="b.TrangThai !== TRANG_THAI_MUON?.DA_TRA && b.TrangThai !== 'DaTra'"
            class="btn btn-secondary btn-sm"
            @click="openReturnModal(b)"
          >
            Xác nhận trả
          </button>
        </span>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" :total-items="totalItems" @change="goToPage" />

    <!-- Modal tạo phiếu mượn giúp -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <div class="modal-box card">
            <h3>Tạo phiếu mượn giúp độc giả</h3>
            <form @submit.prevent="handleCreateBorrow">
              <div class="field">
                <label for="madg">Mã độc giả</label>
                <input id="madg" v-model="createForm.maDocGia" placeholder="DG0001" :class="{ invalid: createErrors.maDocGia }" />
                <span v-if="createErrors.maDocGia" class="field-error">{{ createErrors.maDocGia }}</span>
              </div>
              <div class="field">
                <label for="mas">Mã sách</label>
                <input id="mas" v-model="createForm.maSach" placeholder="SACH0001" :class="{ invalid: createErrors.maSach }" />
                <span v-if="createErrors.maSach" class="field-error">{{ createErrors.maSach }}</span>
              </div>
              <div class="field">
                <label for="songay">Số ngày mượn (tối đa 30, để trống = 14 ngày)</label>
                <input id="songay" v-model="createForm.soNgayMuon" type="number" min="1" max="30" :class="{ invalid: createErrors.soNgayMuon }" />
                <span v-if="createErrors.soNgayMuon" class="field-error">{{ createErrors.soNgayMuon }}</span>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showCreateModal = false" :disabled="creating">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="creating">
                  {{ creating ? 'Đang tạo…' : 'Tạo phiếu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      v-model="showReturnModal"
      title="Xác nhận trả sách"
      :message="`Xác nhận độc giả ${returningInfo?.MaDocGia} đã trả sách ${returningInfo?.MaSach}? Tiền phạt (nếu trễ hạn) sẽ được tính tự động.`"
      confirm-text="Xác nhận trả"
      :loading="returning"
      @confirm="handleConfirmReturn"
    />
  </div>
</template>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; margin-top: var(--space-2); }

.borrow-table { overflow-x: auto; }
.row {
  display: grid;
  grid-template-columns: 110px 110px 100px 100px 110px 140px;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  align-items: center;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 13.5px;
  min-width: 720px;
}
.row:last-child { border-bottom: none; }
.row-head { font-weight: 700; font-size: 12px; text-transform: uppercase; color: var(--color-ink-soft); background: var(--color-primary-tint); }
.row-actions { display: flex; justify-content: flex-end; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(34, 38, 43, 0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: var(--space-5);
}
.modal-box { padding: var(--space-6); max-width: 420px; width: 100%; }
.modal-box h3 { margin-bottom: var(--space-5); font-size: 18px; }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s var(--ease); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

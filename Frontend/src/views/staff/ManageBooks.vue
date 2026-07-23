<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { bookApi } from '../../api/bookApi'
import { publisherApi } from '../../api/publisherApi'
import { usePagination } from '../../composables/usePagination'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validateRequired } from '../../utils/validators'
import { DEFAULT_BOOK_PAGE_SIZE } from '../..//constants/index'
import SkeletonGrid from '../../components/common/SkeletonGrid.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import Pagination from '../../components/common/Pagination.vue'
import ConfirmModal from '../../components/common/ConfirmModal.vue'

const toast = useToast()
const books = ref([])
const publishers = ref([])
const loading = ref(true)
const { page, limit, totalItems, totalPages, applyPagination, goToPage } = usePagination(DEFAULT_BOOK_PAGE_SIZE)
const keyword = ref('')
let searchDebounce = null

const showFormModal = ref(false)
const editingCode = ref(null)
const form = reactive({ MaSach: '', TenSach: '', DonGia: '', SoQuyen: '', NamXuatBan: '', MaNXB: '', TacGia: '' })
const errors = reactive({})
const saving = ref(false)

const showDeleteModal = ref(false)
const deletingCode = ref(null)
const deleting = ref(false)

async function loadPublishers() {
  try {
    const { data } = await publisherApi.getAll()
    publishers.value = data.data
  } catch {
    // Không chặn trang chính nếu lỗi tải NXB
  }
}

async function loadBooks() {
  loading.value = true
  try {
    const params = { page: page.value, limit: limit.value }
    const result = keyword.value
      ? await bookApi.searchBooks({ keyword: keyword.value, ...params })
      : await bookApi.getBooks(params)
    books.value = result.items
    applyPagination(result.pagination)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    page.value = 1
    loadBooks()
  }, 400)
}

watch(page, loadBooks)

function resetForm() {
  form.MaSach = ''
  form.TenSach = ''
  form.DonGia = ''
  form.SoQuyen = ''
  form.NamXuatBan = ''
  form.MaNXB = publishers.value[0]?.MaNXB || ''
  form.TacGia = ''
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

function openCreateForm() {
  if (publishers.value.length === 0) {
    toast.error('Cần có ít nhất 1 nhà xuất bản trước khi thêm sách.')
    return
  }
  editingCode.value = null
  resetForm()
  showFormModal.value = true
}

function openEditForm(b) {
  editingCode.value = b.MaSach
  form.MaSach = b.MaSach
  form.TenSach = b.TenSach
  form.DonGia = b.DonGia
  form.SoQuyen = b.SoQuyen
  form.NamXuatBan = b.NamXuatBan
  form.MaNXB = b.MaNXB
  form.TacGia = b.TacGia
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  showFormModal.value = true
}

function validateForm() {
  errors.TenSach = validateRequired(form.TenSach, 'Tên sách')
  errors.DonGia = !form.DonGia && form.DonGia !== 0 ? 'Vui lòng nhập đơn giá.' : Number(form.DonGia) < 0 ? 'Đơn giá không được âm.' : ''
  errors.SoQuyen = !form.SoQuyen && form.SoQuyen !== 0 ? 'Vui lòng nhập số quyển.' : Number(form.SoQuyen) < 0 ? 'Số quyển không được âm.' : ''
  errors.MaNXB = validateRequired(form.MaNXB, 'Nhà xuất bản')
  errors.TacGia = validateRequired(form.TacGia, 'Tác giả')
  return Object.values(errors).every((e) => !e)
}

async function handleSubmitForm() {
  if (!validateForm()) return
  saving.value = true
  const payload = {
    TenSach: form.TenSach,
    DonGia: Number(form.DonGia),
    SoQuyen: Number(form.SoQuyen),
    NamXuatBan: form.NamXuatBan ? Number(form.NamXuatBan) : undefined,
    MaNXB: form.MaNXB,
    TacGia: form.TacGia
  }
  try {
    if (editingCode.value) {
      await bookApi.updateBook(editingCode.value, payload)
      toast.success('Cập nhật sách thành công!')
    } else {
      await bookApi.createBook(payload)
      toast.success('Thêm sách thành công!')
    }
    showFormModal.value = false
    loadBooks()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    saving.value = false
  }
}

function confirmDelete(maSach) {
  deletingCode.value = maSach
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    await bookApi.deleteBook(deletingCode.value)
    toast.success('Đã xóa sách.')
    showDeleteModal.value = false
    loadBooks()
  } catch (err) {
    // Lỗi 400 nếu còn phiếu mượn chưa trả cuốn này
    toast.error(extractErrorMessage(err))
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadPublishers()
  loadBooks()
})
</script>

<template>
  <div class="books-page">
    <div class="page-head fade-stagger">
      <div>
        <span class="eyebrow">Thủ thư / Quản trị</span>
        <h1>Quản lý sách</h1>
      </div>
      <button class="btn btn-primary" @click="openCreateForm">+ Thêm sách</button>
    </div>

    <div class="card search-bar fade-stagger">
      <input v-model="keyword" placeholder="Tìm theo tên sách, tác giả, mã sách…" @input="onSearchInput" />
    </div>

    <SkeletonGrid v-if="loading" type="row" :count="6" />

    <EmptyState
      v-else-if="books.length === 0"
      icon="search"
      title="Chưa có sách nào"
      description="Thêm sách mới hoặc thử từ khóa khác."
    />

    <div v-else class="card book-table fade-stagger">
      <div class="row row-head">
        <span>Mã sách</span>
        <span>Tên sách</span>
        <span>Tác giả</span>
        <span>Số quyển</span>
        <span>Đơn giá</span>
        <span></span>
      </div>
      <div v-for="b in books" :key="b.MaSach" class="row">
        <span class="code-stamp">{{ b.MaSach }}</span>
        <span class="row-title">{{ b.TenSach }}</span>
        <span>{{ b.TacGia }}</span>
        <span>
          <span class="badge" :class="b.SoQuyen > 0 ? 'badge-success' : 'badge-danger'">{{ b.SoQuyen }}</span>
        </span>
        <span>{{ Number(b.DonGia).toLocaleString('vi-VN') }}đ</span>
        <span class="row-actions">
          <button class="btn btn-ghost btn-sm" @click="openEditForm(b)">Sửa</button>
          <button class="btn btn-ghost btn-sm danger-text" @click="confirmDelete(b.MaSach)">Xóa</button>
        </span>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" :total-items="totalItems" @change="goToPage" />

    <!-- Modal thêm/sửa sách -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showFormModal" class="modal-overlay" @click.self="showFormModal = false">
          <div class="modal-box card">
            <h3>{{ editingCode ? 'Sửa sách' : 'Thêm sách mới' }}</h3>
            <form @submit.prevent="handleSubmitForm">
              <div v-if="editingCode" class="field">
                <label>Mã sách</label>
                <span class="code-stamp">{{ editingCode }}</span>
              </div>
              <div class="field">
                <label for="tensach">Tên sách</label>
                <input id="tensach" v-model="form.TenSach" :class="{ invalid: errors.TenSach }" />
                <span v-if="errors.TenSach" class="field-error">{{ errors.TenSach }}</span>
              </div>
              <div class="field">
                <label for="tacgia">Tác giả</label>
                <input id="tacgia" v-model="form.TacGia" :class="{ invalid: errors.TacGia }" />
                <span v-if="errors.TacGia" class="field-error">{{ errors.TacGia }}</span>
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="songuyen">Số quyển</label>
                  <input id="songuyen" v-model="form.SoQuyen" type="number" min="0" :class="{ invalid: errors.SoQuyen }" />
                  <span v-if="errors.SoQuyen" class="field-error">{{ errors.SoQuyen }}</span>
                </div>
                <div class="field">
                  <label for="dongia">Đơn giá (đ)</label>
                  <input id="dongia" v-model="form.DonGia" type="number" min="0" :class="{ invalid: errors.DonGia }" />
                  <span v-if="errors.DonGia" class="field-error">{{ errors.DonGia }}</span>
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="namxb">Năm xuất bản</label>
                  <input id="namxb" v-model="form.NamXuatBan" type="number" placeholder="2024" />
                </div>
                <div class="field">
                  <label for="manxbsach">Nhà xuất bản</label>
                  <select id="manxbsach" v-model="form.MaNXB" :class="{ invalid: errors.MaNXB }">
                    <option v-for="p in publishers" :key="p.MaNXB" :value="p.MaNXB">{{ p.TenNXB }}</option>
                  </select>
                  <span v-if="errors.MaNXB" class="field-error">{{ errors.MaNXB }}</span>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="showFormModal = false" :disabled="saving">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Đang lưu…' : 'Lưu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Xóa sách?"
      :message="`Bạn có chắc muốn xóa sách ${deletingCode}? Hành động này không thể hoàn tác.`"
      confirm-text="Xóa"
      danger
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); flex-wrap: wrap; gap: var(--space-3); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; margin-top: var(--space-2); }

.search-bar { padding: var(--space-4) var(--space-5); margin-bottom: var(--space-5); }
.search-bar input { width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 10px 14px; font-size: 14px; }
.search-bar input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-tint); }

.book-table { overflow-x: auto; }
.row {
  display: grid;
  grid-template-columns: 110px 1.6fr 1.1fr 90px 110px 130px;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  align-items: center;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 13.5px;
  min-width: 760px;
}
.row:last-child { border-bottom: none; }
.row-head { font-weight: 700; font-size: 12px; text-transform: uppercase; color: var(--color-ink-soft); background: var(--color-primary-tint); }
.row-title { font-weight: 600; }
.row-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }
.danger-text { color: var(--color-danger); }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(34, 38, 43, 0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: var(--space-5);
  overflow-y: auto;
}
.modal-box { padding: var(--space-6); max-width: 460px; width: 100%; margin: auto; }
.modal-box h3 { margin-bottom: var(--space-5); font-size: 18px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s var(--ease); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
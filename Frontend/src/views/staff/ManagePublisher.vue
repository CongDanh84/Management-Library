<script setup>
import { ref, reactive, onMounted } from 'vue'
import { publisherApi } from '../../api/publisherApi'
import { useToast } from '../../composables/useToast'
import { extractErrorMessage } from '../../api/axios.customize'
import { validateRequired } from '../../utils/validators'
import EmptyState from '../../components/common/EmptyState.vue'
import ConfirmModal from '../../components/common/ConfirmModal.vue'

const toast = useToast()
const publishers = ref([])
const loading = ref(true)

// Form thêm/sửa dùng chung 1 modal, phân biệt bằng editingCode (null = đang thêm mới)
const showFormModal = ref(false)
const editingCode = ref(null) // null: thêm mới, string: đang sửa MaNXB đó
const form = reactive({ MaNXB: '', TenNXB: '', DiaChi: '' })
const errors = reactive({})
const saving = ref(false)

const showDeleteModal = ref(false)
const deletingCode = ref(null)
const deleting = ref(false)

async function loadPublishers() {
  loading.value = true
  try {
    const { data } = await publisherApi.getAll()
    publishers.value = data.data
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingCode.value = null
  form.MaNXB = ''
  form.TenNXB = ''
  form.DiaChi = ''
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  showFormModal.value = true
}

function openEditForm(p) {
  editingCode.value = p.MaNXB
  form.MaNXB = p.MaNXB
  form.TenNXB = p.TenNXB
  form.DiaChi = p.DiaChi
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  showFormModal.value = true
}

function validateForm() {
  if (!editingCode.value) {
    errors.MaNXB = validateRequired(form.MaNXB, 'Mã NXB')
  }
  errors.TenNXB = validateRequired(form.TenNXB, 'Tên NXB')
  errors.DiaChi = validateRequired(form.DiaChi, 'Địa chỉ')
  return Object.values(errors).every((e) => !e)
}

async function handleSubmitForm() {
  if (!validateForm()) return
  saving.value = true
  try {
    if (editingCode.value) {
      await publisherApi.update(editingCode.value, { TenNXB: form.TenNXB, DiaChi: form.DiaChi })
      toast.success('Cập nhật NXB thành công!')
    } else {
      await publisherApi.create({ MaNXB: form.MaNXB, TenNXB: form.TenNXB, DiaChi: form.DiaChi })
      toast.success('Thêm NXB thành công!')
    }
    showFormModal.value = false
    loadPublishers()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    saving.value = false
  }
}

function confirmDelete(maNXB) {
  deletingCode.value = maNXB
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    await publisherApi.remove(deletingCode.value)
    toast.success('Đã xóa NXB.')
    showDeleteModal.value = false
    loadPublishers()
  } catch (err) {
    // Lỗi 400 khi còn sách thuộc NXB — hiển thị rõ để Staff biết cần xử lý sách trước
    toast.error(extractErrorMessage(err))
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(loadPublishers)
</script>

<template>
  <div class="publisher-page">
    <div class="page-head fade-stagger">
      <div>
        <span class="eyebrow">Thủ thư / Quản trị</span>
        <h1>Nhà xuất bản</h1>
      </div>
      <button class="btn btn-primary" @click="openCreateForm">+ Thêm NXB</button>
    </div>

    <div v-if="loading" class="skeleton" style="height: 240px;"></div>

    <EmptyState
      v-else-if="publishers.length === 0"
      title="Chưa có nhà xuất bản nào"
      description="Thêm NXB đầu tiên để có thể tạo sách."
    >
      <button class="btn btn-primary" @click="openCreateForm">+ Thêm NXB</button>
    </EmptyState>

    <div v-else class="card publisher-table fade-stagger">
      <div class="row row-head">
        <span>Mã NXB</span>
        <span>Tên NXB</span>
        <span>Địa chỉ</span>
        <span></span>
      </div>
      <div v-for="p in publishers" :key="p.MaNXB" class="row">
        <span class="code-stamp">{{ p.MaNXB }}</span>
        <span>{{ p.TenNXB }}</span>
        <span class="row-address">{{ p.DiaChi }}</span>
        <span class="row-actions">
          <button class="btn btn-ghost btn-sm" @click="openEditForm(p)">Sửa</button>
          <button class="btn btn-ghost btn-sm danger-text" @click="confirmDelete(p.MaNXB)">Xóa</button>
        </span>
      </div>
    </div>

    <!-- Modal thêm/sửa NXB -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showFormModal" class="modal-overlay" @click.self="showFormModal = false">
          <div class="modal-box card">
            <h3>{{ editingCode ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản' }}</h3>
            <form @submit.prevent="handleSubmitForm">
              <div class="field">
                <label for="manxb">Mã NXB</label>
                <input
                  id="manxb"
                  v-model="form.MaNXB"
                  :disabled="!!editingCode"
                  placeholder="NXB0001"
                  :class="{ invalid: errors.MaNXB }"
                />
                <span v-if="errors.MaNXB" class="field-error">{{ errors.MaNXB }}</span>
                <span v-else-if="!editingCode" class="hint">Mã NXB nhập tay, không tự sinh, không đổi được sau khi tạo.</span>
              </div>
              <div class="field">
                <label for="tennxb">Tên NXB</label>
                <input id="tennxb" v-model="form.TenNXB" :class="{ invalid: errors.TenNXB }" />
                <span v-if="errors.TenNXB" class="field-error">{{ errors.TenNXB }}</span>
              </div>
              <div class="field">
                <label for="diachinxb">Địa chỉ</label>
                <input id="diachinxb" v-model="form.DiaChi" :class="{ invalid: errors.DiaChi }" />
                <span v-if="errors.DiaChi" class="field-error">{{ errors.DiaChi }}</span>
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
      title="Xóa nhà xuất bản?"
      :message="`Bạn có chắc muốn xóa NXB ${deletingCode}? Hành động này không thể hoàn tác.`"
      confirm-text="Xóa"
      danger
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; margin-top: var(--space-2); }

.publisher-table { overflow-x: auto; }
.row {
  display: grid;
  grid-template-columns: 140px 1.3fr 1.6fr 140px;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  align-items: center;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 14px;
  min-width: 640px;
}
.row:last-child { border-bottom: none; }
.row-head { font-weight: 700; font-size: 12px; text-transform: uppercase; color: var(--color-ink-soft); background: var(--color-primary-tint); }
.row-address { color: var(--color-ink-soft); }
.row-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }
.danger-text { color: var(--color-danger); }
.hint { font-size: 12px; color: var(--color-ink-faint); }

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
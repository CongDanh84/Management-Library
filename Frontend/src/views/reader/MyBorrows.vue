<script setup>
import { ref, onMounted, watch } from 'vue'
import { borrowApi } from '../../api/borrowApi.js'
import { usePagination } from '../../composables/usePagination.js'
import { useToast } from '../../composables/useToast.js'
import { extractErrorMessage } from '../../api/axios.customize.js'
import { TRANG_THAI_MUON } from '../../constants/index'
import SkeletonGrid from '../..//components/common/SkeletonGrid.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import Pagination from '../../components/common/Pagination.vue'

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
    const { data } = await borrowApi.getMyBorrows({ page: page.value, limit: limit.value })
    borrows.value = data.data || []
    applyPagination(data.pagination)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

watch(page, loadBorrows)
onMounted(loadBorrows)
</script>

<template>
  <div class="borrows-page">
    <div class="page-head fade-stagger">
      <span class="eyebrow">Độc giả</span>
      <h1>Sách đang mượn &amp; lịch sử</h1>
      <p>Danh sách các phiếu mượn bạn đã tạo, bao gồm cả sách đã trả.</p>
    </div>

    <SkeletonGrid v-if="loading" type="row" :count="5" />

    <EmptyState
      v-else-if="borrows.length === 0"
      icon="tray"
      title="Bạn chưa mượn cuốn sách nào"
      description="Ghé qua danh mục sách để tìm cuốn bạn thích."
    />

    <div v-else class="borrow-table card fade-stagger">
      <div class="borrow-row borrow-head">
        <span>Mã sách</span>
        <span>Ngày mượn</span>
        <span>Hạn trả</span>
        <span>Ngày trả</span>
        <span>Trạng thái</span>
        <span>Tiền phạt</span>
      </div>
      <div v-for="b in borrows" :key="b._id" class="borrow-row">
        <span class="code-stamp">{{ b.MaSach }}</span>
        <span>{{ formatDate(b.NgayMuon) }}</span>
        <span>{{ formatDate(b.HanTra) }}</span>
        <span>{{ formatDate(b.NgayTra) }}</span>
        <span>
          <span class="badge" :class="STATUS_LABEL[b.TrangThai]?.cls || 'badge-neutral'">
            {{ STATUS_LABEL[b.TrangThai]?.text || b.TrangThai }}
          </span>
        </span>
        <span>{{ b.TienPhat > 0 ? Number(b.TienPhat).toLocaleString('vi-VN') + 'đ' : '—' }}</span>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" :total-items="totalItems" @change="goToPage" />
  </div>
</template>

<style scoped>
.page-head { margin-bottom: var(--space-6); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 26px; margin-top: var(--space-2); }
.page-head p { color: var(--color-ink-soft); margin-top: var(--space-2); }

.borrow-table { overflow-x: auto; }
.borrow-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  align-items: center;
  font-size: 13.5px;
  border-bottom: 1px solid var(--color-border-soft);
  min-width: 640px;
}
.borrow-row:last-child { border-bottom: none; }
.borrow-head { font-weight: 700; color: var(--color-ink-soft); font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; background: var(--color-primary-tint); }
</style>
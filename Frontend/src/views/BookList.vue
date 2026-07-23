<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { bookApi } from '../api/bookApi'
import { publisherApi } from '../api/publisherApi'
import { usePagination } from '../composables/usePagination'
import { useToast } from '../composables/useToast'
import { extractErrorMessage } from '../api/axios.customize'
import SkeletonGrid from '../components/common/SkeletonGrid.vue'
import EmptyState from '../components/common/EmptyState.vue'
import Pagination from '../components/common/Pagination.vue'

const toast = useToast()
const books = ref([])
const publishers = ref([])
const loading = ref(true)
const { page, limit, totalItems, totalPages, applyPagination, goToPage } = usePagination(12)

const filters = reactive({ keyword: '', maNXB: '', tacGia: '' })
let searchDebounce = null

async function loadPublishers() {
  try {
    const { data } = await publisherApi.getAll()
    publishers.value = data.data
  } catch {
    // Danh sách NXB chỉ để lọc, lỗi không chặn trang chính
  }
}

async function loadBooks() {
  loading.value = true
  try {
    const hasFilter = filters.keyword || filters.maNXB || filters.tacGia
    const params = { page: page.value, limit: limit.value }
    let result
    if (hasFilter) {
      result = await bookApi.searchBooks({
        keyword: filters.keyword || undefined,
        maNXB: filters.maNXB || undefined,
        tacGia: filters.tacGia || undefined,
        ...params
      })
    } else {
      result = await bookApi.getBooks(params)
    }
    books.value = result.items
    applyPagination(result.pagination)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    page.value = 1
    loadBooks()
  }, 400)
}

watch(page, loadBooks)

onMounted(() => {
  loadPublishers()
  loadBooks()
})
</script>

<template>
  <div class="book-list-page">
    <div class="page-head fade-stagger">
      <span class="eyebrow">Mục lục</span>
      <h1>Danh mục sách</h1>
      <p>Tra cứu và tìm kiếm đầu sách trong thư viện.</p>
    </div>

    <div class="filter-bar card fade-stagger">
      <div class="field" style="margin-bottom: 0;">
        <label for="kw">Từ khóa</label>
        <input id="kw" v-model="filters.keyword" placeholder="Tên sách…" @input="onFilterChange" />
      </div>
      <div class="field" style="margin-bottom: 0;">
        <label for="tg">Tác giả</label>
        <input id="tg" v-model="filters.tacGia" placeholder="Tên tác giả…" @input="onFilterChange" />
      </div>
      <div class="field" style="margin-bottom: 0;">
        <label for="nxb">Nhà xuất bản</label>
        <select id="nxb" v-model="filters.maNXB" @change="onFilterChange">
          <option value="">Tất cả</option>
          <option v-for="p in publishers" :key="p.MaNXB" :value="p.MaNXB">{{ p.TenNXB }}</option>
        </select>
      </div>
    </div>

    <SkeletonGrid v-if="loading" :count="8" />

    <EmptyState
      v-else-if="books.length === 0"
      icon="search"
      title="Không tìm thấy sách nào"
      description="Thử điều chỉnh từ khóa hoặc bộ lọc để xem thêm kết quả."
    />

    <div v-else class="book-grid">
      <RouterLink
        v-for="(b, i) in books"
        :key="b.MaSach"
        :to="`/sach/${b.MaSach}`"
        class="book-card card fade-stagger"
        :style="{ animationDelay: `${Math.min(i, 10) * 0.04}s` }"
      >
        <div class="book-card-top">
          <span class="code-stamp">{{ b.MaSach }}</span>
          <span class="badge" :class="b.SoQuyen > 0 ? 'badge-success' : 'badge-danger'">
            {{ b.SoQuyen > 0 ? `Còn ${b.SoQuyen}` : 'Hết sách' }}
          </span>
        </div>
        <h3>{{ b.TenSach }}</h3>
        <p class="book-author">{{ b.TacGia }}</p>
        <div class="book-card-foot">
          <span>{{ b.NamXuatBan }}</span>
          <span>{{ Number(b.DonGia).toLocaleString('vi-VN') }}đ</span>
        </div>
      </RouterLink>
    </div>

    <Pagination :page="page" :total-pages="totalPages" :total-items="totalItems" @change="goToPage" />
  </div>
</template>

<style scoped>
.page-head { margin-bottom: var(--space-6); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
.page-head h1 { font-size: 28px; margin-top: var(--space-2); }
.page-head p { color: var(--color-ink-soft); margin-top: var(--space-2); }

.filter-bar {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  gap: var(--space-4);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}
@media (max-width: 720px) { .filter-bar { grid-template-columns: 1fr; } }

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--space-4);
}
.book-card { padding: var(--space-5); transition: all 0.3s var(--ease); display: block; }
.book-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-raised); border-color: var(--color-primary); }
.book-card:hover h3 { color: var(--color-primary); }
.book-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.book-card h3 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  margin-bottom: 6px;
  transition: color 0.3s var(--ease);
}
.book-author {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-accent);
}
.book-card-foot {
  display: flex; justify-content: space-between;
  margin-top: var(--space-4); padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-soft);
  font-size: 13px; color: var(--color-ink-faint);
}
</style>
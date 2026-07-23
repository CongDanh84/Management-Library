<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { bookApi } from '../api/bookApi'
import { publisherApi } from '../api/publisherApi'
import { borrowApi } from '../api/borrowApi'
import { useAuthStore } from '../store/auth'
import { useToast } from '../composables/useToast'
import { extractErrorMessage } from '../api/axios.customize'
import { validateSoNgayMuon } from '../utils/validators'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const book = ref(null)
const publisher = ref(null)
const loading = ref(true)
const notFound = ref(false)

const soNgayMuon = ref('')
const borrowError = ref('')
const borrowing = ref(false)
const borrowSuccess = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    const { data } = await bookApi.getBookDetail(route.params.maSach)
    book.value = data.data
    if (data?.MaNXB) {
      try {
        const pub = await publisherApi.getDetail(data.MaNXB)
        publisher.value = pub.data
      } catch {
        // NXB có thể đã bị xóa, bỏ qua
      }
    }
  } catch (err) {
    if (err?.response?.status === 404) notFound.value = true
    else toast.error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

async function handleBorrow() {
  borrowError.value = validateSoNgayMuon(soNgayMuon.value)
  if (borrowError.value) return
  borrowing.value = true
  try {
    await borrowApi.borrowSelf({
      maSach: book.value.MaSach,
      soNgayMuon: soNgayMuon.value ? Number(soNgayMuon.value) : undefined
    })
    borrowSuccess.value = true
    toast.success('Mượn sách thành công!')
    load()
  } catch (err) {
    borrowError.value = extractErrorMessage(err)
  } finally {
    borrowing.value = false
  }
}

const canBorrow = computed(() => auth.isReader && book.value?.SoQuyen > 0)

onMounted(load)
</script>

<template>
  <div class="book-detail-page">
    <RouterLink to="/sach" class="back-link">‹ Quay lại danh mục</RouterLink>

    <div v-if="loading" class="skeleton-detail">
      <div class="skeleton" style="height: 32px; width: 60%; margin-bottom: 16px;"></div>
      <div class="skeleton" style="height: 200px;"></div>
    </div>

    <div v-else-if="notFound" class="card empty-detail">
      <h2>Không tìm thấy sách</h2>
      <p>Sách này có thể đã bị xóa hoặc mã sách không đúng.</p>
    </div>

    <div v-else class="detail-layout">
      <div class="card detail-main fade-stagger">
        <div class="detail-top">
          <span class="code-stamp">{{ book.MaSach }}</span>
          <span class="badge" :class="book.SoQuyen > 0 ? 'badge-success' : 'badge-danger'">
            {{ book.SoQuyen > 0 ? `Còn ${book.SoQuyen} quyển` : 'Hết sách' }}
          </span>
        </div>
        <h1>{{ book.TenSach }}</h1>
        <p class="detail-author">{{ book.TacGia }} · {{ book.NamXuatBan }}</p>

        <dl class="detail-meta">
          <div><dt>Đơn giá</dt><dd>{{ Number(book.DonGia).toLocaleString('vi-VN') }}đ</dd></div>
          <div><dt>Nhà xuất bản</dt><dd>{{ publisher?.TenNXB || book.MaNXB }}</dd></div>
          <div v-if="publisher"><dt>Địa chỉ NXB</dt><dd>{{ publisher.DiaChi }}</dd></div>
        </dl>
      </div>

      <div class="card borrow-panel fade-stagger">
        <template v-if="!auth.isAuthenticated">
          <h3>Đăng nhập để mượn sách</h3>
          <p>Bạn cần đăng nhập bằng tài khoản độc giả để mượn cuốn sách này.</p>
          <RouterLink to="/dang-nhap/doc-gia" class="btn btn-primary btn-block">Đăng nhập</RouterLink>
        </template>

        <template v-else-if="auth.isStaff">
          <h3>Chế độ nhân viên</h3>
          <p>Để tạo phiếu mượn giúp độc giả, hãy sang mục Mượn / Trả.</p>
          <RouterLink to="/nhan-vien/muon-tra" class="btn btn-secondary btn-block">Đi đến Mượn / Trả</RouterLink>
        </template>

        <template v-else-if="borrowSuccess">
          <h3>Đã gửi yêu cầu mượn</h3>
          <p>Sách đã được thêm vào danh sách đang mượn của bạn.</p>
          <RouterLink to="/muon-cua-toi" class="btn btn-primary btn-block">Xem sách đang mượn</RouterLink>
        </template>

        <template v-else>
          <h3>Mượn sách này</h3>
          <p v-if="book.SoQuyen <= 0" class="hint-danger">Sách hiện đã hết, vui lòng quay lại sau.</p>
          <form v-else @submit.prevent="handleBorrow">
            <div class="field">
              <label for="songay">Số ngày mượn (tối đa 30)</label>
              <input id="songay" v-model="soNgayMuon" type="number" min="1" max="30" placeholder="Mặc định 14 ngày" />
            </div>
            <p v-if="borrowError" class="field-error">{{ borrowError }}</p>
            <button class="btn btn-primary btn-block" type="submit" :disabled="borrowing || !canBorrow">
              {{ borrowing ? 'Đang xử lý…' : 'Xác nhận mượn' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-link { display: inline-block; margin-bottom: var(--space-5); font-size: 13px; font-weight: 600; color: var(--color-ink-soft); }
.back-link:hover { color: var(--color-primary); }
.empty-detail { padding: var(--space-7); text-align: center; }
.detail-layout { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-5); align-items: start; }
.detail-main, .borrow-panel { padding: var(--space-6); }
.detail-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.detail-main h1 { font-size: 26px; }
.detail-author { color: var(--color-ink-soft); margin-top: var(--space-2); }
.detail-meta { margin-top: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.detail-meta div { display: flex; justify-content: space-between; padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border-soft); }
.detail-meta dt { color: var(--color-ink-faint); font-size: 13px; }
.detail-meta dd { margin: 0; font-weight: 600; font-size: 13px; }
.borrow-panel h3 { font-size: 17px; margin-bottom: var(--space-3); }
.borrow-panel p { color: var(--color-ink-soft); font-size: 14px; margin-bottom: var(--space-4); }
.hint-danger { color: var(--color-danger); }
@media (max-width: 780px) { .detail-layout { grid-template-columns: 1fr; } }
</style>

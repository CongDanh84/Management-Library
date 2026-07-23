import { ref } from 'vue'

/**
 * Composable quản lý trạng thái phân trang chuẩn của backend:
 * { page, limit, totalItems, totalPages }
 */
export function usePagination(defaultLimit = 10) {
  const page = ref(1)
  const limit = ref(defaultLimit)
  const totalItems = ref(0)
  const totalPages = ref(1)

  function applyPagination(paginationFromApi) {
    if (!paginationFromApi) return
    page.value = paginationFromApi.page ?? page.value
    limit.value = paginationFromApi.limit ?? limit.value
    totalItems.value = paginationFromApi.totalItems ?? 0
    totalPages.value = paginationFromApi.totalPages ?? 1
  }

  function goToPage(p) {
    if (p < 1 || p > totalPages.value) return
    page.value = p
  }

  function reset() {
    page.value = 1
  }

  return { page, limit, totalItems, totalPages, applyPagination, goToPage, reset }
}

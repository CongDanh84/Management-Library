import api from './axios.customize'

// Backend bọc thêm 1 lớp {data: ...} ở controller sách, nên GET / và /search
// có thể trả về {data: {data: [...], pagination: {...}}} thay vì {data:[...], pagination:{...}}.
// Hàm này chuẩn hóa cả 2 dạng để phần còn lại của FE không cần quan tâm cấu trúc thật.
function normalizeListResponse(raw) {
  // Backend: { data:{ data:[...], pagination:{} } }
  if (Array.isArray(raw?.data?.data)) {
    return {
      items: raw.data.data,
      pagination: raw.data.pagination || null
    }
  }
  // Backend: { data:[...], pagination:{} }
  if (Array.isArray(raw?.data)) {
    return {
      items: raw.data,
      pagination: raw.pagination || null
    }
  }
  return {
    items: [],
    pagination: null
  }
}
export const bookApi = {
  async getBooks(params) {
    const res = await api.get('/book', { params })
    return normalizeListResponse(res.data)
  },
  async searchBooks(params) {
    // route /search phải đặt trước /:maSach ở backend — FE chỉ cần gọi đúng path
    const res = await api.get('/book/search', { params })
    return normalizeListResponse(res.data)
  },
  getBookDetail: (maSach) => api.get(`/book/${maSach}`),
  createBook: (payload) => api.post('/book', payload),
  updateBook: (maSach, payload) => api.put(`/book/${maSach}`, payload),
  deleteBook: (maSach) => api.delete(`/book/${maSach}`)
}

import api from './axios.customize'

export const borrowApi = {
  borrowSelf: (payload) => api.post('/borrow-book/borrow', payload), // {maSach, soNgayMuon}
  borrowForReader: (payload) => api.post('/borrow-book/borrow-for', payload), // Staff: {maDocGia, maSach, soNgayMuon}
  returnBook: (id) => api.patch(`/borrow-book/return/${id}`),
  getMyBorrows: (params) => api.get('/borrow-book/me', { params }),
  getReaderBorrows: (maDocGia, params) => api.get(`/borrow-book/reader/${maDocGia}`, { params }),
  getAllBorrows: (params) => api.get('/borrow-book', { params }),
  getBorrowDetail: (id) => api.get(`/borrow-book/${id}`)
}

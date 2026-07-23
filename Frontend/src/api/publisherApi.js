import api from './axios.customize'

export const publisherApi = {
  getAll: () => api.get('/publisher'), // không phân trang
  getDetail: (maNXB) => api.get(`/publisher/${maNXB}`),
  create: (payload) => api.post('/publisher', payload), // MaNXB nhập tay
  update: (maNXB, payload) => api.put(`/publisher/${maNXB}`, payload),
  remove: (maNXB) => api.delete(`/publisher/${maNXB}`)
}

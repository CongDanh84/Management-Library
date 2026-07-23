import api from './axios.customize'

export const profileApi = {
  // Reader
  getMyProfile: () => api.get('/profile/reader/me'),
  updateMyProfile: (payload) => api.put('/profile/reader/me', payload),
  changeMyPassword: (payload) => api.patch('/profile/reader/me/change-password', payload),

  // Staff
  getStaffProfile: () => api.get('/profile/staff/me'),
  updateStaffProfile: (payload) => api.put('/profile/staff/me', payload),
  changeStaffPassword: (payload) => api.patch('/profile/staff/me/change-password', payload),

  // ThuThu quản lý Reader
  getReaders: (params) => api.get('/profile/readers', { params }),
  getReaderDetail: (maDocGia) => api.get(`/profile/reader/${maDocGia}`),
  updateReaderByStaff: (maDocGia, payload) => api.put(`/profile/reader/${maDocGia}`, payload),

  // Admin quản lý Staff
  getStaffs: () => api.get('/profile/admin/staffs'),
  getStaffDetail: (msnv) => api.get(`/profile/admin/staff/${msnv}`),
  updateReaderByAdmin: (maDocGia, payload) => api.put(`/profile/admin/reader/${maDocGia}`, payload),
  resetReaderPassword: (maDocGia, passwordMoi) =>
    api.patch(`/profile/admin/reader/${maDocGia}/reset-password`, { passwordMoi }),
  updateStaffByAdmin: (msnv, payload) => api.put(`/profile/admin/staff/${msnv}`, payload),
  resetStaffPassword: (msnv, passwordMoi) =>
    api.patch(`/profile/admin/staff/${msnv}/reset-password`, { passwordMoi })
}

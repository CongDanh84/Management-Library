import api from './axios.customize'

export const authApi = {
  registerReader: (payload) => api.post('/auth/reader/register', payload),
  loginReader: (payload) => api.post('/auth/reader/login', payload),
  loginStaff: (payload) => api.post('/auth/staff/login', payload),
  registerStaff: (payload) => api.post('/auth/staff/register', payload), // chỉ Admin
  // refresh-token và logout không cần gửi refreshToken trong body —
  // withCredentials: true (cấu hình trong axios.js) tự đính kèm httpOnly cookie
  refreshToken: () => api.post('/auth/refresh-token', {}),
  logout: () => api.post('/auth/logout', {})
}
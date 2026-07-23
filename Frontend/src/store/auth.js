import { defineStore } from 'pinia'
import { authApi } from '../api/authApi'
import { setOnAuthFailure, bootstrapSession } from '../api/axios.customize'
import { tokenStorage } from '../utils/TokenStorage'
import { ROLES, CHUC_VU } from '../constants/index'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Thông tin user hiện tại (reader hoặc staff) — chỉ dữ liệu hiển thị, KHÔNG chứa token
    user: JSON.parse(localStorage.getItem('qlms_user') || 'null'),
    role: localStorage.getItem('qlms_role') || null, // 'reader' | 'staff'
    chucVu: localStorage.getItem('qlms_chucvu') || null, // 'Admin' | 'ThuThu'
    ready: false // true sau khi đã thử khôi phục phiên đăng nhập lúc khởi động
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!tokenStorage.getAccess(),
    isReader: (state) => state.role === ROLES.READER,
    isStaff: (state) => state.role === ROLES.STAFF,
    isAdmin: (state) => state.role === ROLES.STAFF && state.chucVu === CHUC_VU.ADMIN,
    isThuThu: (state) => state.role === ROLES.STAFF && state.chucVu === CHUC_VU.THU_THU,
    displayName: (state) => state.user?.Hoten || state.user?.HotenNV || '',
    myCode: (state) => state.user?.MaDocGia || state.user?.MSNV || ''
  },

  actions: {
    // Gọi 1 lần lúc app khởi động, TRƯỚC khi mount (xem main.js)
    async init() {
      setOnAuthFailure(() => this.clearSession())

      // Có thông tin user cũ trong localStorage (chỉ là dữ liệu hiển thị)
      // -> thử âm thầm khôi phục access token từ cookie refresh token
      if (this.user) {
        const restored = await bootstrapSession()
        if (!restored) this.clearSession()
      }
      this.ready = true
    },

    persistSession(role, chucVu, user, accessToken) {
      this.role = role
      this.chucVu = chucVu || null
      this.user = user
      tokenStorage.setAccess(accessToken)
      localStorage.setItem('qlms_role', role)
      if (chucVu) localStorage.setItem('qlms_chucvu', chucVu)
      else localStorage.removeItem('qlms_chucvu')
      localStorage.setItem('qlms_user', JSON.stringify(user))
    },

    async loginReader({ MaDocGia, Password }) {
      const { data } = await authApi.loginReader({ MaDocGia, Password })
      this.persistSession(ROLES.READER, null, data.reader, data.accessToken)
      return data
    },

    async loginStaff({ MSNV, Password }) {
      const { data } = await authApi.loginStaff({ MSNV, Password })
      this.persistSession(ROLES.STAFF, data.staff?.ChucVu, data.staff, data.accessToken)
      return data
    },

    async registerReader(payload) {
      const { data } = await authApi.registerReader(payload)
      return data
    },

    async logout() {
      try {
        await authApi.logout() // cookie tự gửi kèm, backend revoke + clear cookie
      } catch {
        // Bỏ qua lỗi logout phía server, vẫn xóa session cục bộ
      }
      this.clearSession()
    },

    clearSession() {
      this.user = null
      this.role = null
      this.chucVu = null
      tokenStorage.clear()
      localStorage.removeItem('qlms_role')
      localStorage.removeItem('qlms_chucvu')
      localStorage.removeItem('qlms_user')
    },

    // Gọi sau khi đổi mật khẩu thành công — backend revoke refresh token nên phải logout + về trang login
    forceLogoutAfterPasswordChange() {
      this.clearSession()
    },

    updateLocalUser(patch) {
      this.user = { ...this.user, ...patch }
      localStorage.setItem('qlms_user', JSON.stringify(this.user))
    }
  }
})
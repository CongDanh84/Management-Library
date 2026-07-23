// Access token CHỈ lưu trong biến JS (module-level), KHÔNG lưu localStorage/sessionStorage.
// Lý do: refresh token đã chuyển hẳn sang httpOnly cookie (backend set, JS không đọc được).
// Access token sống ngắn (15 phút) nên chấp nhận mất khi F5 — sẽ tự khôi phục qua
// bootstrapSession() (gọi /refresh-token, cookie tự gửi kèm) ngay khi app khởi động.
let accessTokenMemory = null

export const tokenStorage = {
  getAccess: () => accessTokenMemory,
  setAccess: (token) => {
    accessTokenMemory = token
  },
  clear: () => {
    accessTokenMemory = null
  }
}
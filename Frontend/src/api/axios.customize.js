import axios from 'axios'
import { tokenStorage } from '../utils/TokenStorage'

// Base URL lấy từ .env (VITE_API_BASE_URL), FE cấu hình riêng theo backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // BẮT BUỘC: để browser tự đính kèm httpOnly cookie chứa refresh token
})

// Gắn Authorization header cho mọi request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Cơ chế hàng đợi: nếu nhiều request 401 cùng lúc, chỉ refresh 1 lần,
// các request còn lại chờ kết quả refresh rồi retry
let isRefreshing = false
let pendingQueue = []

function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingQueue = []
}

// Callback được gán từ store auth để xử lý logout khi refresh thất bại
let onAuthFailure = () => {}
export function setOnAuthFailure(cb) {
  onAuthFailure = cb
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token')

    // Lỗi 401 (access token hết hạn) và request này chưa từng được retry
    if (status === 401 && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        // Đã có 1 lượt refresh đang chạy -> xếp hàng chờ, không gọi refresh trùng lặp
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Không cần gửi body — refresh token nằm trong httpOnly cookie (path: /api/auth),
        // withCredentials: true tự đính kèm cookie này vào request.
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )
        tokenStorage.setAccess(data.accessToken)
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStorage.clear()
        onAuthFailure()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Gọi 1 lần khi app khởi động (F5 / mở tab mới): access token trong bộ nhớ đã mất,
// nhưng nếu cookie refresh token còn hạn, ta âm thầm lấy access token mới.
// Trả về true nếu khôi phục được phiên đăng nhập, false nếu chưa đăng nhập/cookie hết hạn.
export async function bootstrapSession() {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh-token`,
      {},
      { withCredentials: true }
    )
    tokenStorage.setAccess(data.accessToken)
    return true
  } catch {
    tokenStorage.clear()
    return false
  }
}

// Helper đọc message lỗi thống nhất từ errorHandle.js backend
export function extractErrorMessage(error) {
  return error?.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.'
}

export default api
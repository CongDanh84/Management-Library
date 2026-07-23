// Vai trò người dùng, khớp field `role` trong JWT payload backend trả về
export const ROLES = Object.freeze({
  READER: 'reader',
  STAFF: 'staff'
}) 


// Chức vụ của Staff, khớp field `ChucVu` trong model Staff
export const CHUC_VU = Object.freeze({
  ADMIN: 'Admin',
  THU_THU: 'ThuThu'
})

// Trạng thái tài khoản (Reader/Staff)
export const TRANG_THAI_TAI_KHOAN = Object.freeze({
  ACTIVE: 'active',
  LOCKED: 'locked'
})

// Trạng thái phiếu mượn (BookTracking.TrangThai)
export const TRANG_THAI_MUON = Object.freeze({
  DANG_MUON: 'DangMuon',
  DA_TRA: 'DaTra',
  QUA_HAN: 'QuaHan'
})

// Quy tắc nghiệp vụ mượn/trả — khớp README backend
export const BUSINESS_RULES = Object.freeze({
  SO_NGAY_MUON_MAC_DINH: 14,
  SO_NGAY_MUON_TOI_DA: 30,
  SO_SACH_MUON_TOI_DA: 5,
  TIEN_PHAT_MOI_NGAY_TRE: 5000
})

// Quy tắc password: tối thiểu 8 ký tự, có chữ, số, ký tự đặc biệt
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=]).{8,}$/

export const PHONE_REGEX = /^0\d{9,10}$/

// Danh sách phân trang mặc định
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_BOOK_PAGE_SIZE = 12
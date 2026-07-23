import { PASSWORD_REGEX, PHONE_REGEX, BUSINESS_RULES } from '../constants/index'

export function validatePassword(value) {
  if (!value) return 'Vui lòng nhập mật khẩu.'
  if (!PASSWORD_REGEX.test(value)) {
    return 'Mật khẩu tối thiểu 8 ký tự, gồm chữ, số và ký tự đặc biệt.'
  }
  return ''
}

export function validateRequired(value, label = 'Trường này') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} không được để trống.`
  }
  return ''
}

export function validatePhone(value) {
  if (!value) return 'Vui lòng nhập số điện thoại.'
  if (!PHONE_REGEX.test(value)) return 'Số điện thoại không hợp lệ.'
  return ''
}

export function validateSoNgayMuon(value) {
  const n = Number(value)
  if (!value) return '' // để trống -> backend mặc định 14 ngày
  if (Number.isNaN(n) || n <= 0) return 'Số ngày mượn phải là số dương.'
  if (n > BUSINESS_RULES.SO_NGAY_MUON_TOI_DA) {
    return `Số ngày mượn tối đa là ${BUSINESS_RULES.SO_NGAY_MUON_TOI_DA} ngày.`
  }
  return ''
}
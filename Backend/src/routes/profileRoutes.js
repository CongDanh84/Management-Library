const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, authorize, authorizeChucVu } = require('../middleware/auth');

// ========== READER ==========
router.get('/reader/me', protect, authorize('reader'), profileController.getMyProfileReader);
router.put('/reader/me', protect, authorize('reader'), profileController.updateMyProfileReader);
router.patch('/reader/me/change-password', protect, authorize('reader'), profileController.changePasswordReader);

// ========== STAFF ==========
router.get('/staff/me', protect, authorize('staff'), profileController.getMyProfileStaff);
router.put('/staff/me', protect, authorize('staff'), profileController.updateMyProfileStaff);
router.patch('/staff/me/change-password', protect, authorize('staff'), profileController.changePasswordStaff);

// ========== THU THU & ADMIN d?u xem du?c Reader ==========
router.get('/readers', protect, authorize('staff'), profileController.getAllReaders);
router.get('/reader/:maDocGia', protect, authorize('staff'), profileController.getReaderByStaff);

// ThuThu s?a thông tin Reader (tr? TrangThai, Password, MaDocGia, role)
router.put('/reader/:maDocGia', protect, authorize('staff'), profileController.updateReaderByThuThu);

// ========== ADMIN ==========
// Admin dùng route riêng d? s?a thêm TrangThai, ChucVu
router.put('/admin/reader/:maDocGia', protect, authorizeChucVu('Admin'), profileController.updateReaderByAdmin);
router.patch('/admin/reader/:maDocGia/reset-password', protect, authorizeChucVu('Admin'), profileController.resetPasswordReader);

router.get('/admin/staffs', protect, authorizeChucVu('Admin'), profileController.getAllStaff);
router.get('/admin/staff/:msnv', protect, authorizeChucVu('Admin'), profileController.getStaffByAdmin);
router.put('/admin/staff/:msnv', protect, authorizeChucVu('Admin'), profileController.updateStaffByAdmin);
router.patch('/admin/staff/:msnv/reset-password', protect, authorizeChucVu('Admin'), profileController.resetPasswordStaff);

module.exports = router;
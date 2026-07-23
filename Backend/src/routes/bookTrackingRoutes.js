const express = require('express');
const router = express.Router();
const muonTraController = require('../controllers/bookTrackingController');
const { protect, authorize } = require('../middleware/auth');

// Reader tự mượn sách online
router.post('/borrow', protect, authorize('reader'), muonTraController.readerTuMuon);

// Reader xem phiếu mượn của chính mình
router.get('/me', protect, authorize('reader'), muonTraController.getMePhieu);

// ThuThu/Admin tạo phiếu mượn giúp Reader tại thư viện
router.post('/borrow-for', protect, authorize('staff'), muonTraController.thuThuTaoPhieuMuon);

// ThuThu/Admin xác nhận trả sách
router.patch('/return/:id', protect, authorize('staff'), muonTraController.xacNhanTraSach);

// ThuThu/Admin xem tất cả phiếu mượn
router.get('/', protect, authorize('staff'), muonTraController.getAll);

// ThuThu/Admin xem phiếu mượn theo 1 reader
router.get('/reader/:maDocGia', protect, authorize('staff'), muonTraController.getByReader);

// Xem chi tiết 1 phiếu (staff)
router.get('/:id', protect, authorize('staff'), muonTraController.getOne);

module.exports = router;
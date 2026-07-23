const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

// Reader + Staff đều xem được (Reader cần xem để chọn mượn)
router.get('/search', protect, bookController.search);
router.get('/', protect, bookController.getAll);
router.get('/:maSach', protect, bookController.getOne);

// Chỉ ThuThu + Admin được thêm/sửa/xóa
router.post('/', protect, authorize('staff'), bookController.create);
router.put('/:maSach', protect, authorize('staff'), bookController.update);
router.delete('/:maSach', protect, authorize('staff'), bookController.remove);

module.exports = router;
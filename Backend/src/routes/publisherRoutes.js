const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisherController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, publisherController.getAll);
router.get('/:maNXB', protect, publisherController.getOne);

router.post('/', protect, authorize('staff'), publisherController.create);
router.put('/:maNXB', protect, authorize('staff'), publisherController.update);
router.delete('/:maNXB', protect, authorize('staff'), publisherController.remove);

module.exports = router;
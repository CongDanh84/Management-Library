const express = require('express');
const router = express.Router();
const {
  registerReader,
  registerStaff,
  loginReader,
  loginStaff,
  refreshAccessToken,
  logout
} = require('../controllers/authController');
const {protect, authorizeChucVu} = require('../middleware/auth');

router.post('/reader/register', registerReader);
router.post('/reader/login', loginReader);

router.post('/staff/login', loginStaff);
router.post('/staff/register', protect, authorizeChucVu('Admin'), registerStaff);

router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

module.exports = router;
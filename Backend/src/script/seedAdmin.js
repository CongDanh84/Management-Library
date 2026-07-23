const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const Staff = require('../models/Staff');
const { generateCode } = require('../models/Counter');
const { isStrongPassword } = require('../utils/validatePassword');

async function seedAdmin() {
  await connectDB();

  const existingAdmin = await Staff.findOne({ ChucVu: 'Admin' });
  if (existingAdmin) {
    console.log(`⚠️  Đã tồn tại tài khoản Admin: ${existingAdmin.MSNV} — không tạo thêm.`);
    process.exit(0);
  }

  const hoTen = 'Đoàn Công Danh';
  const password = 'admin123@';

  if (!isStrongPassword(password)) {
    console.error('❌ ADMIN_PASSWORD chưa đủ mạnh (>=8 ký tự, có chữ, số, ký tự đặc biệt)');
    process.exit(1);
  }

  const MSNV = await generateCode('staff', 'NV');
  const hashed = await bcrypt.hash(password, 10);

  await Staff.create({
    MSNV,
    HotenNV: hoTen,
    Password: hashed,
    ChucVu: 'Admin'
  });

  console.log('✅ Tạo Admin thành công!');
  console.log(`   MSNV    : ${MSNV}`);
  console.log(`   Password: (như ADMIN_PASSWORD trong .env)`);
  console.log('   Lưu MSNV lại để đăng nhập qua POST /api/auth/staff/login');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
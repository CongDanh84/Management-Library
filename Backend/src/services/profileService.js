const Reader = require('../models/Reader');
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const RefreshToken = require('../models/RefreshToken');
const {isStrongPassword} = require('../utils/validatePassword');
const { getPagination, buildPaginationResult } = require('../utils/pagination');


const pickFields = (body, allowedFields) => {
  return allowedFields.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});
}

const revokeAllTokens = async (ownerId, role) => {
  await RefreshToken.updateMany({ ownerId, role, revoked: false }, { $set: { revoked: true } });
}

const READER_EDITABLE = ['Hoten', 'NgaySinh', 'Phai', 'DiaChi', 'DienThoai'];


const STAFF_EDITABLE = ['HotenNV', 'DiaChi', 'SoDienThoai'];


const THUTHU_READER_EDITABLE = ['Hoten', 'NgaySinh', 'Phai', 'DiaChi', 'DienThoai'];


const ADMIN_READER_EDITABLE = [...THUTHU_READER_EDITABLE, 'TrangThai'];

const ADMIN_STAFF_EDITABLE = ['HotenNV', 'DiaChi', 'SoDienThoai', 'ChucVu', 'TrangThai'];


const getMyProfileReader = async (MaDocGia) => {
  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) throw { status: 404, message: 'Không tìm thấy tài khoản' };
  return reader;
}

const updateMyProfileReader = async (MaDocGia, body) => {
  const data = pickFields(body, READER_EDITABLE);

  if (Object.keys(data).length === 0) {
    throw { status: 400, message: 'Không có thông tin hợp lệ để cập nhật' };
  }

  const reader = await Reader.findOneAndUpdate(
    { MaDocGia },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!reader) throw { status: 404, message: 'Không tìm thấy tài khoản' };
  return reader;
}

const changePasswordReader = async (MaDocGia, { passwordCu, passwordMoi }) => {
  if (!passwordCu || !passwordMoi) {
    throw { status: 400, message: 'Thiếu password cũ hoặc password mới' };
  }
  if (!isStrongPassword(passwordMoi)) {
    throw { status: 400, message: 'Password mới phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt' };
  }
  if (passwordCu === passwordMoi) {
    throw { status: 400, message: 'Password mới không được trùng password cũ' };
  }

  const reader = await Reader.findOne({ MaDocGia }).select('+Password');
  if (!reader) throw { status: 404, message: 'Không tìm thấy tài khoản' };

  const isMatch = await bcrypt.compare(passwordCu, reader.Password);
  if (!isMatch) throw { status: 401, message: 'Password cũ không đúng' };

  reader.Password = await bcrypt.hash(passwordMoi, 10);
  await reader.save();

  await revokeAllTokens(MaDocGia, 'reader');
}

// ========== STAFF T? QU?N LÝ ==========

const getMyProfileStaff = async (MSNV) => {
  const staff = await Staff.findOne({ MSNV });
  if (!staff) throw { status: 404, message: 'Không tìm thấy tài khoản' };
  return staff;
}

const updateMyProfileStaff = async (MSNV, body) => {
  const data = pickFields(body, STAFF_EDITABLE);

  if (Object.keys(data).length === 0) {
    throw { status: 400, message: 'Không có thông tin hợp lệ để cập nhật' };
  }

  const staff = await Staff.findOneAndUpdate(
    { MSNV },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!staff) throw { status: 404, message: 'Không tìm thấy tài khoản' };
  return staff;
}

const changePasswordStaff = async (MSNV, { passwordCu, passwordMoi }) => {
  if (!passwordCu || !passwordMoi) {
    throw { status: 400, message: 'Thiếu Password cũ hoặc Password mới' };
  }
  if (!isStrongPassword(passwordMoi)) {
    throw { status: 400, message: 'Password mới phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt' };
  }
  if (passwordCu === passwordMoi) {
    throw { status: 400, message: 'Password mới không được trùng password cũ' };
  }

  const staff = await Staff.findOne({ MSNV }).select('+Password');
  if (!staff) throw { status: 404, message: 'Không tìm thấy tài khoản' };

  const isMatch = await bcrypt.compare(passwordCu, staff.Password);
  if (!isMatch) throw { status: 401, message: 'Password cũ không đúng' };

  staff.Password = await bcrypt.hash(passwordMoi, 10);
  await staff.save();

  await revokeAllTokens(MSNV, 'staff');
}


// ========== THU THU ==========

const getReaderByStaff = async (MaDocGia) => {
  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) throw { status: 404, message: 'Không tìm thấy độc giả' };
  return reader;
}

const updateReaderByThuThu = async (MaDocGia, body) => {
  const data = pickFields(body, THUTHU_READER_EDITABLE);

  if (Object.keys(data).length === 0) {
    throw { status: 400, message: 'Không có thông tin hợp lệ để cập nhật' };
  }

  const reader = await Reader.findOneAndUpdate(
    { MaDocGia },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!reader) throw { status: 404, message: 'Không tìm thấy độc giả' };
  return reader;
}


// ========== ADMIN ==========

const getAllReaders = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const [readers, totalItems] = await Promise.all([
    Reader.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Reader.countDocuments()
  ]);
  return buildPaginationResult(readers, totalItems, page, limit);
}

const getReaderByAdmin = async (MaDocGia) => {
  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) throw { status: 404, message: 'Không tìm thấy độc giả' };
  return reader;
}

const updateReaderByAdmin = async (MaDocGia, body) => {
  const data = pickFields(body, ADMIN_READER_EDITABLE);

  if (Object.keys(data).length === 0) {
    throw { status: 400, message: 'Không có thông tin hợp lệ để cập nhật' };
  }

  const reader = await Reader.findOneAndUpdate(
    { MaDocGia },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!reader) throw { status: 404, message: 'Không tìm thấy độc giả' };
  return reader;
}

const resetPasswordReader = async (MaDocGia, { passwordMoi }) => {
  if (!passwordMoi) throw { status: 400, message: 'Thiếu password mới' };
  if (!isStrongPassword(passwordMoi)) {
    throw { status: 400, message: 'Password mới phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt' };
  }

  const reader = await Reader.findOne({ MaDocGia }).select('+Password');
  if (!reader) throw { status: 404, message: 'Không tìm thấy độc giả' };
  const isSame = await bcrypt.compare(passwordMoi, reader.Password);

  if (isSame) {
      throw {
          status: 400,
          message: 'Password mới không được trùng password hiện tại'
      };
  }

  reader.Password = await bcrypt.hash(passwordMoi, 10);
  await reader.save();

  // Revoke toàn b? token -> ngu?i dùng bu?c ph?i dang nh?p l?i b?ng password m?i
  await revokeAllTokens(MaDocGia, 'reader');
}

const getAllStaff = async () => {
  return await Staff.find().sort({ createdAt: -1 });
}

const getStaffByAdmin = async (MSNV) => {
  const staff = await Staff.findOne({ MSNV });
  if (!staff) throw { status: 404, message: 'Không tìm thấy nhân viên' };
  return staff;
}

const updateStaffByAdmin = async (MSNV, body) => {
  const data = pickFields(body, ADMIN_STAFF_EDITABLE);

  if (Object.keys(data).length === 0) {
    throw { status: 400, message: 'Không có thông tin hợp lệ để cập nhật' };
  }

  const staff = await Staff.findOneAndUpdate(
    { MSNV },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!staff) throw { status: 404, message: 'Không tìm thấy nhân viên' };
  return staff;
}

const resetPasswordStaff = async (MSNV, { passwordMoi }) => {
  if (!passwordMoi) throw { status: 400, message: 'Thi?u password m?i' };
  if (!isStrongPassword(passwordMoi)) {
    throw { status: 400, message: 'Password mới phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt' };
  } 

  const staff = await Staff.findOne({ MSNV }).select('+Password');
  if (!staff) throw { status: 404, message: 'Không tìm th?y nhân viên' };
  const isSame = await bcrypt.compare(passwordMoi, staff.Password);

  if (isSame) {
      throw {
          status: 400,
          message: 'Password mới không được trùng password hiện tại'
      };
  }

  staff.Password = await bcrypt.hash(passwordMoi, 10);
  await staff.save();

  await revokeAllTokens(MSNV, 'staff');
}

module.exports = {
  getMyProfileReader,
  updateMyProfileReader,
  getMyProfileStaff,
  updateMyProfileStaff,
  getReaderByStaff,
  updateReaderByThuThu,
  getAllReaders,
  getReaderByAdmin,
  updateReaderByAdmin,
  getAllStaff,
  getStaffByAdmin,
  updateStaffByAdmin,
  changePasswordReader,
  changePasswordStaff,
  resetPasswordReader,
  resetPasswordStaff,
};
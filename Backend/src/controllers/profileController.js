const profileService = require('../services/profileService');

// ========== READER ==========

const getMyProfileReader = async (req, res, next) => {
  try {
    const data = await profileService.getMyProfileReader(req.user.id);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const updateMyProfileReader = async (req, res, next) => {
  try {
    const data = await profileService.updateMyProfileReader(req.user.id, req.body);
    return res.json({ message: 'Cập nhật thông tin thành công', data });
  } catch (err) {
    next(err);
  }
}

const changePasswordReader = async (req, res, next) => {
  try {
    await profileService.changePasswordReader(req.user.id, req.body);
    return res.json({ message: 'Đổi password thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    next(err);
  }
}

// ========== STAFF ==========

const getMyProfileStaff = async (req, res, next) => {
  try {
    const data = await profileService.getMyProfileStaff(req.user.id);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const updateMyProfileStaff = async (req, res, next) => {
  try {
    const data = await profileService.updateMyProfileStaff(req.user.id, req.body);
    return res.json({ message: 'Cập nhật thông tin thành công', data });
  } catch (err) {
    next(err);
  }
}

const changePasswordStaff = async (req, res, next) => {
  try {
    await profileService.changePasswordStaff(req.user.id, req.body);
    return res.json({ message: 'Đổi password thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    next(err);
  }
}

// ========== THU THU ==========

const getReaderByStaff = async (req, res, next) => {
  try {
    const data = await profileService.getReaderByStaff(req.params.maDocGia);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const updateReaderByThuThu = async (req, res, next) => {
  try {
    const data = await profileService.updateReaderByThuThu(req.params.maDocGia, req.body);
    return res.json({ message: 'Cập nhật thông tin độc giả thành công', data });
  } catch (err) {
    next(err);
  }
}

// ========== ADMIN ==========

const getAllReaders = async (req, res, next) => {
  try {
    const data = await profileService.getAllReaders(req.query);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const getReaderByAdmin = async (req, res, next) => {
  try {
    const data = await profileService.getReaderByAdmin(req.params.maDocGia);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const updateReaderByAdmin =  async (req, res, next) => {
  try {
    const data = await profileService.updateReaderByAdmin(req.params.maDocGia, req.body);
    return res.json({ message: 'Cập nhật thông tin độc giả thành công', data });
  } catch (err) {
    next(err);
  }
}

const resetPasswordReader = async (req, res, next) => {
  try {
    await profileService.resetPasswordReader(req.params.maDocGia, req.body);
    return res.json({ message: 'Reset password độc giả thành công. Người dùng sẽ phải đăng nhập lại.' });
  } catch (err) {
    next(err);
  }
}

const getAllStaff = async (req, res, next) => {
  try {
    const data = await profileService.getAllStaff();
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const getStaffByAdmin = async (req, res, next) => {
  try {
    const data = await profileService.getStaffByAdmin(req.params.msnv);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

const updateStaffByAdmin = async (req, res, next) => {
  try {
    const data = await profileService.updateStaffByAdmin(req.params.msnv, req.body);
    return res.json({ message: 'Cập nhật thông tin nhân viên thành công', data });
  } catch (err) {
    next(err);
  }
}

const resetPasswordStaff = async (req, res, next) => {
  try {
    await profileService.resetPasswordStaff(req.params.msnv, req.body);
    return res.json({ message: 'Reset password nhân viên thành công. Người dùng sẽ phải đăng nhập lại.' });
  } catch (err) {
    next(err);
  }
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
  resetPasswordStaff
};
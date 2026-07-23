const bcrypt = require('bcryptjs');
const Reader = require('../models/Reader');
const Staff = require('../models/Staff');
const RefreshToken = require('../models/RefreshToken');
const {generateCode} = require('../models/Counter');
const {isStrongPassword} = require('../utils/validatePassword');
const {generateAccessToken, generateRefreshTokenString, hashToken} = require('../utils/tokenUtils');

const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '30', 10);

const taoCapToken = async ({id, role, chucVu}) => {
    const payload = role === 'staff' ? {id, role, chucVu} : {id, role};
    const accessToken = generateAccessToken(payload);

    const refreshTokenRaw = generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        tokenHash: hashToken(refreshTokenRaw),
        ownerId: id,
        role,
        expiresAt
    });

    return {accessToken, refreshToken: refreshTokenRaw};
}

const registerReader = async ({Hoten, NgaySinh, Phai, DiaChi, DienThoai, Password}) => {
    if(!Hoten || !Password){
        throw { status: 400, message: 'Thiếu thông tin bắt buộc: Họ và tên, Password' };
    }
    if(!isStrongPassword(Password)){
        throw { status: 400, message: 'Password phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt' }
    }

    const MaDocGia = await generateCode('reader', 'DG');
    const hashed =  await bcrypt.hash(Password,10);

    await Reader.create({
        MaDocGia,
        Hoten,
        NgaySinh,
        Phai,
        DiaChi,
        DienThoai,
        Password: hashed
    });

    return {MaDocGia};
}

const loginReader = async ({MaDocGia, Password}) => {
    if(!MaDocGia || !Password){
        throw { status: 400, message: 'Thiếu MaDocGia hoặc Password' };
    }

    const reader = await Reader.findOne({MaDocGia}).select('+Password');
    if(!reader){
        throw { status: 401, message: 'Mã độc giả hoặc password không đúng' };
    }

    if(reader.TrangThai === 'locked') {
        throw { status: 403, message: 'Tài khoản đã bị khoá' };
    }

    const isMatch = await bcrypt.compare(Password, reader.Password);
    if(!isMatch) {
        throw { status: 401, message: 'Mã độc giả hoặc password không đúng' };
    }

    const tokens = await taoCapToken({id: reader.MaDocGia, role: 'reader'});

    return {
        ...tokens,
        reader: {MaDocGia: reader.MaDocGia, Hoten: reader.Hoten}
    };
}

const registerStaff = async ({HotenNV, Password, ChucVu, DiaChi, SoDienThoai}) => {
    if (!HotenNV || !Password) {
        throw { status: 400, message: 'Thiếu thông tin bắt buộc: Họ tên, Password' };
      }
    
      if (!isStrongPassword(Password)) {
        throw { status: 400, message: 'Password phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt' };
      }
    
      const chucVuHopLe = ChucVu === 'Admin' ? 'Admin' : 'ThuThu';
      const MSNV = await generateCode('staff', 'NV');
      const hashed = await bcrypt.hash(Password, 10);
    
      await Staff.create({ MSNV, HotenNV, Password: hashed, ChucVu: chucVuHopLe, DiaChi, SoDienThoai });
    
      return { MSNV };
}

const loginStaff = async ({MSNV, Password}) => {
    if (!MSNV || !Password) {
        throw { status: 400, message: 'Thiếu MSNV hoặc Password' };
      }
    
      const staff = await Staff.findOne({ MSNV }).select('+Password');
      if (!staff) {
        throw { status: 401, message: 'MSNV hoặc password không đúng' };
      }
    
      if (staff.TrangThai === 'locked') {
        throw { status: 403, message: 'Tài khoản đã bị khóa' };
      }
    
      const isMatch = await bcrypt.compare(Password, staff.Password);
      if (!isMatch) {
        throw { status: 401, message: 'MSNV hoặc password không đúng' };
      }
    
      const tokens = await taoCapToken({ id: staff.MSNV, role: 'staff', chucVu: staff.ChucVu });
    
      return {
        ...tokens,
        staff: { MSNV: staff.MSNV, HoTenNV: staff.HotenNV, ChucVu: staff.ChucVu }
      };
}

const refreshAccessToken = async ({refreshToken}) => {
    if (!refreshToken) {
        throw { status: 400, message: 'Thiếu refreshToken' };
      }
    
      const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) });
    
      if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        throw { status: 401, message: 'Refresh token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại' };
      }
    
      // Revoke token cũ ngay (token rotation)
      stored.revoked = true;
      await stored.save();
    
      // Lấy lại ChucVu mới nhất từ DB để token mới luôn đúng quyền hiện tại
      let chucVu;
      if (stored.role === 'staff') {
        const staff = await Staff.findOne({ MSNV: stored.ownerId });
        if (!staff || staff.TrangThai === 'locked') {
          throw { status: 403, message: 'Tài khoản không còn hoạt động' };
        }
        chucVu = staff.ChucVu;
      } else {
        const reader = await Reader.findOne({ MaDocGia: stored.ownerId });
        if (!reader || reader.TrangThai === 'locked') {
          throw { status: 403, message: 'Tài khoản không còn hoạt động' };
        }
      }
    
      return await taoCapToken({ id: stored.ownerId, role: stored.role, chucVu });
}

const logout = async ({refreshToken}) => {
    if (!refreshToken) {
        throw { status: 400, message: 'Thiếu refreshToken' };
    }
    
    const stored = await RefreshToken.findOne({
      tokenHash: hashToken(refreshToken)
    });

    if(!stored){
      throw { status: 401, message: 'Refresh token không hợp lệ' };
    }

    if(stored.revoked){
      throw { status: 401, message: 'Refresh token đã bị thu hồi' };
    }

    if(stored.expiresAt < new Date()){
      throw { status: 401, message: 'Refresh token đã hết hạn' };
    }

    stored.revoked = true;
    await stored.save();
}

module.exports = {
  registerReader,
  loginReader,
  registerStaff,
  loginStaff,
  refreshAccessToken,
  logout
};
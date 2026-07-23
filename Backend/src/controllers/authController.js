const authService = require('../services/authServices')
const {setRefreshCookie, clearRefreshCookie} = require('../utils/tokenUtils');

const registerReader = async (req, res, next) => {
    try {
        const {MaDocGia} = await authService.registerReader(req.body);
        return res.status(200).json({
            message: `Đăng ký thành công. Mã đọc giả của bản là ${MaDocGia} - vui lòng lưu lại để đăng nhập.`,
            MaDocGia
        });
    } catch (err) {
        next(err);
    }
}

const loginReader = async (req, res, next) => {
    try {
        const data = await authService.loginReader(req.body);
        setRefreshCookie(res, data.refreshToken);
        return res.json({message: 'Đăng nhập thành công', accessToken: data.accessToken, reader: data.reader});
    } catch (err) {
        next(err);
    }
}

const registerStaff = async (req, res, next) => {
    try {
        const {MSNV} = await authService.registerStaff(req.body);
        return res.status(201).json({message: `Tạo nhân viên thành công. Mã nhân viên là ${MSNV}`, MSNV});
    } catch (err) {
        next(err);
    }
}

const loginStaff = async (req, res, next) => {
    try {
        const data = await authService.loginStaff(req.body);
        setRefreshCookie(res, data.refreshToken);
        return res.json({message: 'Đăng nhập thành công', accessToken: data.accessToken, staff: data.staff});
    } catch (err) {
        next(err);
    }
}

const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if(!refreshToken){
            return res.status(401).json({ message: 'Không tìm thấy refresh token, vui lòng đăng nhập lại.' });
        }
        const tokens = await authService.refreshAccessToken({ refreshToken });
        setRefreshCookie(res, tokens.refreshToken)
        return res.json({message: 'Cấp lại token thành công', accessToken: tokens.accessToken});
    } catch (err) {
        next(err);
    }
}

const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await authService.logout({ refreshToken });
        }
        clearRefreshCookie(res);
        return res.json({message: 'Đăng xuất thành công'});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    registerReader,
    registerStaff,
    loginReader,
    loginStaff,
    refreshAccessToken,
    logout
};
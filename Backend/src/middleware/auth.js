const {verifyAccessToken} = require('../utils/tokenUtils');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: 'Chưa đăng nhập hoặc thiếu access token'});
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = verifyAccessToken(token);
        next();
    } catch (error) {
        return res.status(401).json({message: 'Access token không hợp lệ hoặc đã hết hạn'});
    }
}

const authorize = (...roles) => {
    return (req, res, next) => {
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({message: 'Không có quyền chi cập'});
        }
        next();
    };
}

const authorizeChucVu = (...chucVus) => {
    return (req, res, next) => {
        if(!req.user || req.user.role !== 'staff' || !chucVus.includes(req.user.chucVu)){
            return res.status(403).json({message: 'Chỉ Admin mới có quyền thực hiện hành động này'});
        }
        next();
    }
}

module.exports = {protect, authorize, authorizeChucVu};
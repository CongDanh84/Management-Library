const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true khi deploy HTTPS
  sameSite: 'lax', // 'strict' nếu FE/BE cùng domain, 'none'+secure:true nếu khác domain
  path: '/api/auth', // chỉ gửi cookie cho các route auth (bao gồm /refresh-token, /logout)
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày, khớp thời hạn refresh token
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
}

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

const generateAccessToken =  (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    });
}
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

const generateRefreshTokenString = () => {
    return crypto.randomBytes(48).toString('hex');
}

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    generateAccessToken, verifyAccessToken, generateRefreshTokenString, hashToken, setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME
};


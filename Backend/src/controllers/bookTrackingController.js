const muonTraService = require('../services/bookTrackingService');

// Reader tự mượn (lấy maDocGia từ req.user.id)
const readerTuMuon = async (req, res, next) => {
    try {
        const phieu = await muonTraService.readerTuMuon(req.user.id, req.body);
        res.status(201).json(phieu);
    } catch (err) { next(err); }
};

// ThuThu/Admin tạo phiếu mượn giúp Reader
const thuThuTaoPhieuMuon = async (req, res, next) => {
    try {
        const phieu = await muonTraService.thuThuTaoPhieuMuon(req.user.id, req.body);
        res.status(201).json(phieu);
    } catch (err) { next(err); }
};

// ThuThu/Admin xác nhận trả sách
const xacNhanTraSach = async (req, res, next) => {
    try {
        const phieu = await muonTraService.xacNhanTraSach(req.params.id, req.user.id);
        res.json(phieu);
    } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
    try {
        const list = await muonTraService.getAll(req.query);
        res.json(list);
    } catch (err) { next(err); }
};

// Reader xem phiếu mượn của chính mình
const getMePhieu = async (req, res, next) => {
    try {
        const list = await muonTraService.getByReader(req.user.id, req.query);
        res.json(list);
    } catch (err) { next(err); }
};

// Staff xem phiếu mượn của 1 reader
const getByReader = async (req, res, next) => {
    try {
        const list = await muonTraService.getByReader(req.params.maDocGia, req.query);
        res.json(list);
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const phieu = await muonTraService.getById(req.params.id);
        res.json(phieu);
    } catch (err) { next(err); }
};

module.exports = {
    readerTuMuon, thuThuTaoPhieuMuon, xacNhanTraSach, getAll, getMePhieu, getByReader, getOne
}
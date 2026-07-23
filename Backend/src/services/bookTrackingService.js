const TheoDoiMuonSach = require('../models/BookTracking');
const Sach = require('../models/Book');
const Reader = require('../models/Reader');
const { getPagination, buildPaginationResult } = require('../utils/pagination');

const {
    SO_NGAY_MUON_TOI_DA,
    SO_NGAY_MUON_MAC_DINH,
    TIEN_PHAT_MOI_NGAY,
    SO_SACH_MUON_TOI_DA
} = require('../config/bookTrackingConfig');

const tinhHanTra = (ngayMuon, soNgayMuon) => {
    let soNgay = Number(soNgayMuon);

    if (!soNgay || soNgay <= 0) {
        soNgay = SO_NGAY_MUON_MAC_DINH;
    }

    if (soNgay > SO_NGAY_MUON_TOI_DA) {
        throw { status: 400, message: `Số ngày mượn không được vượt quá ${SO_NGAY_MUON_TOI_DA} ngày` };
    }

    const hanTra = new Date(ngayMuon);
    hanTra.setDate(hanTra.getDate() + soNgay);
    return hanTra;
}

const kiemTraDieuKienMuon = async (maDocGia, maSach) => {
    const reader = await Reader.findOne({ MaDocGia: maDocGia });
    if (!reader) {
        throw { status: 404, message: 'Không tìm thấy độc giả' };
    }
    if (reader.TrangThai === 'locked') {
        throw { status: 403, message: 'Tài khoản độc giả đang bị khóa, không thể mượn sách' };
    }

    const sach = await Sach.findOne({ MaSach: maSach });

    if (!sach) {
        throw { status: 404, message: 'Không tìm thấy sách' };
    }
    if (sach.SoQuyen <= 0) {
        throw { status: 400, message: 'Sách đã hết, không thể mượn' };
    }

    const dangMuonSachNay = await TheoDoiMuonSach.exists({
        MaDocGia: maDocGia,
        MaSach: maSach,
        TrangThai: { $in: ['DangMuon', 'QuaHan'] }
    });
    if (dangMuonSachNay) {
        throw { status: 400, message: 'Độc giả đang mượn cuốn sách này, chưa trả' };
    }

    const soLuongDangMuon = await TheoDoiMuonSach.countDocuments({
        MaDocGia: maDocGia,
        TrangThai: { $in: ['DangMuon', 'QuaHan'] }
    });
    if (soLuongDangMuon >= SO_SACH_MUON_TOI_DA) {
        throw { status: 400, message: `Độc giả đã mượn tối đa ${SO_SACH_MUON_TOI_DA} cuốn, cần trả bớt trước khi mượn thêm` };
    }

}

// Reader tự mượn online
const readerTuMuon = async (maDocGia, { maSach, soNgayMuon }) => {

    await kiemTraDieuKienMuon(maDocGia, maSach);

    const ngayMuon = new Date();
    const hanTra = tinhHanTra(ngayMuon, soNgayMuon);

    const phieu = new TheoDoiMuonSach({
        MaDocGia: maDocGia,
        MaSach: maSach,
        NgayMuon: ngayMuon,
        HanTra: hanTra,
        MSNV: null
    });

    await Sach.updateOne(
        { MaSach: maSach }, 
        {

        $inc: {
            SoQuyen: -1
        }
    }
    );


    await phieu.save()

    return phieu;
};

// ThuThu tạo phiếu mượn giúp Reader tại thư viện
const thuThuTaoPhieuMuon = async (msnv, { maDocGia, maSach, soNgayMuon }) => {
    await kiemTraDieuKienMuon(maDocGia, maSach);

    const ngayMuon = new Date();
    const hanTra = tinhHanTra(ngayMuon, soNgayMuon);

    const phieu = new TheoDoiMuonSach({
        MaDocGia: maDocGia,
        MaSach: maSach,
        NgayMuon: ngayMuon,
        HanTra: hanTra,
        MSNV: msnv
    });

    await Sach.updateOne(
        { MaSach: maSach }, 
        {

        $inc: {
            SoQuyen: -1
        }
    }
    );

    await phieu.save()


    return phieu;
};

// ThuThu xác nhận trả sách, tự tính tiền phạt nếu trễ hạn
const xacNhanTraSach = async (phieuId, msnv) => {
    const phieu = await TheoDoiMuonSach.findById(phieuId);
    if (!phieu) {
        throw { status: 404, message: 'Không tìm thấy phiếu mượn' };
    }
    if (phieu.TrangThai === 'DaTra') {
        throw { status: 400, message: 'Phiếu mượn này đã được trả trước đó' };
    }

    const ngayTra = new Date();
    let tienPhat = 0;

    if (ngayTra > phieu.HanTra) {
        const soNgayTre = Math.ceil((ngayTra - phieu.HanTra) / (1000 * 60 * 60 * 24));
        tienPhat = soNgayTre * TIEN_PHAT_MOI_NGAY;
    }

    phieu.NgayTra = ngayTra;
    phieu.TrangThai = 'DaTra';
    phieu.TienPhat = tienPhat;
    phieu.MSNV = msnv; // nhân viên xác nhận trả
    await phieu.save();

    await Sach.updateOne(
        { MaSach: phieu.MaSach }, 
        {

        $inc: {
            SoQuyen: +1
        }
    }
    );

    return phieu;
};

const getAll = async (query) => {
    const {page, limit, skip} = getPagination(query);
    const [list, totalItems] = await Promise.all([
        TheoDoiMuonSach.find().sort({NgayMuon: -1}).skip(skip).limit(limit),
        TheoDoiMuonSach.countDocuments()
    ])
    return buildPaginationResult(list, totalItems, page, limit);
};

const getByReader = async (maDocGia, query) => {

    const {page, limit, skip} = getPagination(query);
    const [list, totalItems] = await Promise.all([
        TheoDoiMuonSach.find({MaDocGia: maDocGia}).sort({NgayMuon: -1}).skip(skip).limit(limit),
        TheoDoiMuonSach.countDocuments({MaDocGia: maDocGia})
    ])
    return buildPaginationResult(list, totalItems, page, limit);
};

const getById = async (phieuId) => {
    const phieu = await TheoDoiMuonSach.findById(phieuId);
    if (!phieu) {
        const err = new Error('Không tìm thấy phiếu mượn');
        err.statusCode = 404;
        throw err;
    }
    return phieu;
};

module.exports = {
    readerTuMuon, thuThuTaoPhieuMuon, xacNhanTraSach, getAll, getByReader, getById
}
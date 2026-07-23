const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
    MaDocGia: {
        type: String,
        required: true,
        ref: 'Reader'
    },
    MaSach: {
        type: String,
        required: true,
        ref: 'Book'
    },
    NgayMuon: {
        type: Date,
        default: Date.now,
        required: true
    },
    HanTra: {
        type: Date,
        required: true
    },
    NgayTra: {
        type: Date,
        default: null
    },
    TrangThai: {
        type: String,
        enum: ['DangMuon', 'DaTra', 'QuaHan'],
        default: 'DangMuon'
    },
    TienPhat: {
        type: Number,
        default: 0,
        min: 0
    },
    MSNV: {
        type: String,
        ref: 'Staff',
        default: null // null nếu Reader tự mượn online, có giá trị nếu ThuThu tạo giúp / xác nhận trả
    }
}, { timestamps: true });

theoDoiMuonSachSchema.index({ MaDocGia: 1, MaSach: 1 });
theoDoiMuonSachSchema.index({ TrangThai: 1 });

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
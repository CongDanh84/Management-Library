const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema(
    {
        MaDocGia: {type: String, unique: true, required: true},
        Hoten: {type: String, required: true, trim: true},
        NgaySinh: {type: Date},
        Phai: {type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Khác'},
        DiaChi: {type: String, trim: true},
        DienThoai: {type: String, trim: true},
        Password: {type: String, required: true, select: false},
        TrangThai: {type: String, enum:['active', 'locked'], default: 'active'}
    },
    {timestamps: true}
)

module.exports = mongoose.model('Reader', readerSchema);
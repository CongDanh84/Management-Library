const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
    {
        MSNV: {type: String, unique: true, required: true},
        HotenNV: {type: String, required: true, trim: true},
        Password: {type: String, required: true, select: false},
        ChucVu: {
            type: String,
            enum: ['Admin', 'ThuThu'],
            default: 'ThuThu'
        },
        DiaChi: {type: String, trim: true},
        SoDienThoai: {type: String, trim: true},
        TrangThai: {type: String, enum: ['active', 'locked'], default: 'active'}
    },
    {timestamps: true}
)

module.exports = mongoose.model('Staff', staffSchema);
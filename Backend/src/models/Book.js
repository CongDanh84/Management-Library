const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  MaSach: {
    type: String,
    required: true,
    unique: true
  },
  TenSach: {
    type: String,
    required: true,
    trim: true
  },
  DonGia: {
    type: Number,
    required: true,
    min: 0
  },
  SoQuyen: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  NamXuatBan: {
    type: Number
  },
  MaNXB: {
    type: String,
    required: true,
    ref: 'Publisher'
  },
  TacGia: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
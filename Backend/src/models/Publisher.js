const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  MaNXB: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  TenNXB: {
    type: String,
    required: true,
    trim: true
  },
  DiaChi: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Publisher', publisherSchema);
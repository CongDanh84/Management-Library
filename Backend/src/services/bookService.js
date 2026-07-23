const Book = require('../models/Book');
const Publisher = require('../models/Publisher');
const TheoDoiMuonSach = require('../models/BookTracking');
const { generateCode } = require('../models/Counter');
const { getPagination, buildPaginationResult } = require('../utils/pagination');

const pickFields = (body, fields) => {
    return fields.reduce((acc, field) => {
        if (body[field] !== undefined) {
            acc[field] = body[field];
        }
        return acc;
    }, {});
}

const createSach = async (data) => {
  const { TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia } = data;

  const nxb = await Publisher.findOne({ MaNXB });
  if (!nxb) {
    throw { status: 400, message: 'Mã NXB không tồn tại' };
  }

  const MaSach = await generateCode('book', 'SACH'); // ví dụ: SACH0001

  const sach = await Book.create({
    MaSach,
    TenSach,
    DonGia,
    SoQuyen,
    NamXuatBan,
    MaNXB,
    TacGia
  });

  return sach;
};

const getAllSach = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const [sachList, totalItems] = await Promise.all([
    Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Book.countDocuments()
  ]);
  return buildPaginationResult(sachList, totalItems, page, limit);
};

const getSachById = async (maSach) => {
  const sach = await Book.findOne({ MaSach: maSach });
  if (!sach) {
    throw { status: 404, message: 'Không tìm thấy sách' };
  }
  return sach;
};

const updateSach = async (maSach, data) => {
  const dataUpdate = pickFields(data, ["TenSach", "DonGia", "SoQuyen", "NamXuatBan", "MaNXB", "TacGia"])
  // không cho sửa MaSach

  if (dataUpdate.MaNXB) {
    const nxb = await Publisher.findOne({ MaNXB: dataUpdate.MaNXB });
    if (!nxb) {
      throw { status: 400, message: 'Mã NXB không tồn tại' };
    }
  }

  const sach = await Book.findOneAndUpdate(
    { MaSach: maSach },
    { $set: dataUpdate },
    { new: true, runValidators: true }
  );

  if (!sach) {
    throw { status: 404, message: 'Không tìm thấy sách' };
  }
  return sach;
};

const deleteSach = async (maSach) => {
  const sach = await Book.findOne({ MaSach: maSach });
  if (!sach) {
    throw { status: 404, message: 'Không tìm thấy sách' };
  }

  // TODO: bật đoạn này lên sau khi làm xong model TheoDoiMuonSach (bước 2)
  const conPhieuChuaTra = await TheoDoiMuonSach.exists({
    MaSach: maSach,
    NgayTra: null
  });
  if (conPhieuChuaTra) {
    throw { status: 400, message: 'Không thể xóa sách vì còn phiếu mượn chưa trả' };
  }

  await Book.deleteOne({ MaSach: maSach });
  return sach;
};

const searchSach = async (query) => {
    const filter = {};

    if (query.keyword) {
        filter.$or = [
            { TenSach: { $regex: query.keyword, $options: 'i' } },
            { TacGia: { $regex: query.keyword, $options: 'i' } },
            { MaSach: { $regex: query.keyword, $options: 'i' } }
        ];
    }

    if (query.maNXB) {
        filter.MaNXB = query.maNXB;
    }

    if (query.tacGia) {
        filter.TacGia = { $regex: query.tacGia, $options: 'i' };
    }

    const { page, limit, skip } = getPagination(query);
    const [sachList, totalItems] = await Promise.all([
      Book.find(filter).sort({createdAt: -1}).skip(skip).limit(limit),
      Book.countDocuments(filter)
    ])
    // MaNXB là String (không phải ObjectId) nên không dùng populate() được,
    // phải tự query NXB rồi map thủ công
    const danhSachMaNXB = [...new Set(sachList.map(s => s.MaNXB))];
    const nxbList = await Publisher.find({ MaNXB: { $in: danhSachMaNXB } });
    const nxbMap = {};
    nxbList.forEach(n => { nxbMap[n.MaNXB] = n; });

    const result = sachList.map(s => ({
        ...s.toObject(),
        NhaXuatBan: nxbMap[s.MaNXB] || null
    }));

    return buildPaginationResult(result, totalItems, page, limit);
};

module.exports ={
    createSach, getAllSach, getSachById, updateSach, deleteSach, searchSach
}
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');

const createNXB = async (data) => {
  const { MaNXB, TenNXB, DiaChi } = data;

  const existed = await Publisher.findOne({ MaNXB });
  if (existed) {
    throw { status: 400, message: 'Mã NXB đã tồn tại' };
  }

  const nxb = await Publisher.create({ MaNXB, TenNXB, DiaChi });
  return nxb;
};

const getAllNXB = async () => {
  return await Publisher.find().sort({ MaNXB: 1 });
};

const getNXBById = async (maNXB) => {
  const nxb = await Publisher.findOne({ MaNXB: maNXB });
  if (!nxb) {
    throw { status: 404, message: 'Không tìm thấy NXB' };
  }
  return nxb;
};

const updateNXB = async (maNXB, data) => {
  const { TenNXB, DiaChi } = data;
  const nxb = await Publisher.findOneAndUpdate(
    { MaNXB: maNXB },
    { TenNXB, DiaChi },
    { new: true, runValidators: true }
  );
  if (!nxb) {
    throw { status: 404, message: 'Không tìm thấy NXB' };
  }
  return nxb;
};

const deleteNXB = async (maNXB) => {
  const conCoSach = await Book.exists({ MaNXB: maNXB });
  if (conCoSach) {
    const err = new Error('Không thể xóa NXB vì còn sách thuộc NXB này');
    err.statusCode = 400;
    throw err;
  }

  const nxb = await Publisher.findOneAndDelete({ MaNXB: maNXB });
  if (!nxb) {
    throw { status: 404, message: 'Không tìm thấy NXB' };
  }
  return nxb;
};

module.exports = {
    createNXB, getAllNXB, getNXBById, updateNXB, deleteNXB
}
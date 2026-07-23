const bookService = require('../services/bookService');

const create = async (req, res, next) => {
  try {
    const sach = await bookService.createSach(req.body);
    res.status(201).json({data: sach});
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const list = await bookService.getAllSach(req.query);
    res.json({data: list});
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const sach = await bookService.getSachById(req.params.maSach);
    res.json({data: sach});
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const sach = await bookService.updateSach(req.params.maSach, req.body);
    res.json({data: sach});
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await bookService.deleteSach(req.params.maSach);
    res.json({ message: 'Xóa sách thành công' });
  } catch (err) { next(err); }
};

const search = async (req, res, next) => {
    try {
        const ketQua = await bookService.searchSach(req.query);
        res.json(ketQua);
    } catch (err) { next(err); }
};

module.exports = {
    create, getAll, getOne, update, remove, search
}
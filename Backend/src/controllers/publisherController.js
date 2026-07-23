const publisherService = require('../services/publisherService');

const create = async (req, res, next) => {
  try {
    const nxb = await publisherService.createNXB(req.body);
    res.status(201).json( {data: nxb});
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const list = await publisherService.getAllNXB();
    res.json({data: list});
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const nxb = await publisherService.getNXBById(req.params.maNXB);
    res.json({data: nxb});
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const nxb = await publisherService.updateNXB(req.params.maNXB, req.body);
    res.json({data: nxb});
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await publisherService.deleteNXB(req.params.maNXB);
    res.json({ message: 'Xóa NXB thành công' });
  } catch (err) { next(err); }
};

module.exports = {
    create, getAll, getOne, update, remove
}
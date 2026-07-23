const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Lỗi server';

    if (status === 500) {
        console.error(err); // log lỗi hệ thống thật để debug, không lộ ra response
    }

    return res.status(status).json({ message });
};

module.exports = errorHandler;
const cron = require('node-cron');
const TheoDoiMuonSach = require('../models/BookTracking');

const danhDauQuaHan = async () => {
    const now = new Date();
    console.log("NOW:", now);

    const ketQua = await TheoDoiMuonSach.updateMany(
        {
            TrangThai: 'DangMuon',
            HanTra: { $lt: now }
        },
        {
            $set: { TrangThai: 'QuaHan' }
        }
    );

    if (ketQua.modifiedCount > 0) {
        console.log(`[Cron QuaHan] Đã đánh dấu ${ketQua.modifiedCount} phiếu mượn quá hạn`);
    }
}

const startCronJobs = () => {
    // Chạy mỗi ngày lúc 00:05
    cron.schedule('* * * * *', () => {
        danhDauQuaHan().catch(err => {
            console.error('[Cron QuaHan] Lỗi khi chạy job:', err.message);
        });
    });

    console.log('Cron job đánh dấu quá hạn đã được khởi động');
}

module.exports = { startCronJobs, danhDauQuaHan };
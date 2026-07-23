require('dotenv').config();

const http = require('http');
const app = require('./app');
const connection = require('./src/config/database');
const port = process.env.PORT || 8888;
const server = http.createServer(app);
const { startCronJobs } = require('./src/cron/overdueCron');

(async () => {
    try {
        await connection();
        startCronJobs();
        server.listen(port, () => {
            console.log(`Server đang chạy tại port ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
})()
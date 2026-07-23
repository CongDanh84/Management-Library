require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const publisherRoutes = require('./src/routes/publisherRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const bookTrackingRoutes = require('./src/routes/bookTrackingRoutes')
const errorMiddleware = require('./src/middleware/errorHandle')
const app = express();

app.use(cors({
    origin: process.env.FE_ORIGIN,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/publisher', publisherRoutes);
app.use('/api/borrow-book', bookTrackingRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Route không tồn tại' });
});

app.use(express.static(path.join(__dirname,"src", "dist")));

app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "dist", "index.html"));
});


app.use(errorMiddleware);

module.exports = app;
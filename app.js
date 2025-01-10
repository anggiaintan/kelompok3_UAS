const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const db = require('./config/db');

const app = express();
const port = 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'tokobungaSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Custom middleware untuk membuat user session tersedia di semua views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const pelangganRoutes = require('./routes/pelanggan');

// Use routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/pelanggan', pelangganRoutes);

// Default route
app.get('/', (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/pelanggan');
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
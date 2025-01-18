const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Import sub-routes
const pesananRoutes = require('./pesanan');

// Middleware untuk cek login
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Dashboard Pelanggan
router.get('/', async (req, res) => {
    try {
        const [bunga] = await db.promise().query('SELECT * FROM bunga WHERE stok > 0');
        res.render('pelanggan/dashboard', {
            bunga,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// Profile Pelanggan
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const [pelanggan] = await db.promise().query(
            'SELECT * FROM pelanggan WHERE id_pelanggan = ?',
            [req.session.user.id_pelanggan]
        );
        res.render('pelanggan/profile', {
            user: pelanggan[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// Gunakan sub-routes
router.use('/pesanan', pesananRoutes);

module.exports = router;
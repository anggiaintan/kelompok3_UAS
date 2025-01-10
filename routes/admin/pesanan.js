const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware untuk cek admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// GET: Halaman kelola pesanan
router.get('/', isAdmin, async (req, res) => {
    try {
        const [pesanan] = await db.promise().query(
            `SELECT p.*, b.nama_bunga, pl.nama_pelanggan, pl.alamat
             FROM pesanan p
             JOIN bunga b ON p.kd_bunga = b.kd_bunga
             JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
             ORDER BY p.tgl_pesan DESC`
        );

        res.render('admin/kelola_pesanan', {
            pesanan: pesanan
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// POST: Update status pesanan
router.post('/update-status/:kd_pesanan', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.promise().query(
            'UPDATE pesanan SET status = ? WHERE kd_pesanan = ?',
            [status, req.params.kd_pesanan]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
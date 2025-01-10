const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware untuk cek login
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// GET: Halaman konfirmasi pesanan
router.get('/konfirmasi/:kd_bunga', isAuthenticated, async (req, res) => {
    try {
        const [bunga] = await db.query(
            'SELECT * FROM bunga WHERE kd_bunga = ?',
            [req.params.kd_bunga]
        );

        if (!bunga[0]) {
            return res.status(404).send('Bunga tidak ditemukan');
        }

        res.render('pelanggan/konfirmasiPesanan', {
            bunga: bunga[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// POST: Proses pembayaran
router.post('/bayar', isAuthenticated, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { kd_bunga, total_harga, metode_pembayaran } = req.body;
        const id_pelanggan = req.session.user.id_pelanggan;

        // Insert ke tabel pesanan
        const [result] = await connection.query(
            'INSERT INTO pesanan (id_pelanggan, kd_bunga, metode_pembayaran, total_harga, tgl_pesan) VALUES (?, ?, ?, ?, NOW())',
            [id_pelanggan, kd_bunga, metode_pembayaran, total_harga]
        );

        // Update stok bunga
        await connection.query(
            'UPDATE bunga SET stok = stok - 1 WHERE kd_bunga = ? AND stok > 0',
            [kd_bunga]
        );

        await connection.commit();
        res.json({ success: true, kd_pesanan: result.insertId });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// GET: Halaman selesai pesanan
router.get('/selesai', isAuthenticated, async (req, res) => {
    try {
        const [pesanan] = await db.query(
            `SELECT p.*, b.nama_bunga, b.gambar 
             FROM pesanan p 
             JOIN bunga b ON p.kd_bunga = b.kd_bunga 
             WHERE p.id_pelanggan = ? 
             ORDER BY p.tgl_pesan DESC LIMIT 1`,
            [req.session.user.id_pelanggan]
        );

        res.render('pelanggan/selesai', {
            pesanan: pesanan[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

module.exports = router;
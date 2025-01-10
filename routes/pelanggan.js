// routes/pelanggan.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Halaman Dashboard Pelanggan
router.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const username = isLoggedIn ? req.session.user.nama_pelanggan : null;
    const id_pelanggan = isLoggedIn ? req.session.user.id_pelanggan : null;

    db.query('SELECT * FROM bunga', (err, results) => {
        if (err) throw err;

        res.render('pelanggan/dashboard', {
            bunga: results,
            isLoggedIn,
            username,
            id_pelanggan,
        });
    });
});

// Proses Pembelian Bunga
router.post('/beli', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const { kd_bunga, jumlah } = req.body;

    if (jumlah <= 0 || isNaN(jumlah)) {
        return res.status(400).send('Jumlah harus angka positif.');
    }

    db.query('SELECT * FROM bunga WHERE kd_bunga = ?', [kd_bunga], (err, results) => {
        if (err) throw err;

        if (results.length > 0 && results[0].stok >= jumlah) {
            const totalHarga = results[0].harga * jumlah;

            db.query(
                'INSERT INTO pesanan (id_pelanggan, kd_bunga, tgl_pesan, total_harga) VALUES (?, ?, NOW(), ?)',
                [req.session.user.id_pelanggan, kd_bunga, totalHarga],
                (err) => {
                    if (err) throw err;

                    db.query('UPDATE bunga SET stok = stok - ? WHERE kd_bunga = ?', [jumlah, kd_bunga], (err) => {
                        if (err) throw err;

                        res.redirect('/pelanggan');
                    });
                }
            );
        } else {
            res.status(400).send('Stok tidak mencukupi atau bunga tidak ditemukan.');
        }
    });
});


// Proses Pembayaran
router.post('/bayar', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const { kd_bunga, harga, metode_pembayaran } = req.body;
    const id_pelanggan = req.session.user.id_pelanggan;

    if (!kd_bunga || !harga || !metode_pembayaran) {
        return res.status(400).send('Data tidak lengkap.');
    }

    db.query(
        'INSERT INTO pesanan (id_pelanggan, kd_bunga, metode_pembayaran, total_harga, tgl_pesan) VALUES (?, ?, ?, ?, NOW())',
        [id_pelanggan, kd_bunga, metode_pembayaran, harga],
        (err) => {
            if (err) throw err;

            res.redirect('/pelanggan/selesai');
        }
    );
});

// Halaman Selesai
router.get('/selesai', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Redirect jika belum login
    }

    const id_pelanggan = req.session.user.id_pelanggan;

    db.query(
        'SELECT * FROM pesanan WHERE id_pelanggan = ? ORDER BY kd_pesanan DESC LIMIT 1',
        [id_pelanggan],
        (err, results) => {
            if (err) throw err;

            res.render('pelanggan/selesai', {
                username: req.session.user.nama_pelanggan,
                pesanan: results[0] || null,
            });
        }
    );
});


module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// Halaman Dashboard Pelanggan
router.get('/', (req, res) => {
    // Periksa apakah user sudah login
    const isLoggedIn = req.session.user ? true : false;
    const username = isLoggedIn ? req.session.user.nama_pelanggan : null;
    const id_pelanggan = isLoggedIn ? req.session.user.id_pelanggan : null; // Menambahkan id_pelanggan dari sesi

    // Mengambil semua bunga
    db.query('SELECT * FROM bunga', (err, results) => {
        if (err) throw err;

        // Render halaman dashboard dan kirim data bunga, status login, username, dan id_pelanggan
        res.render('pelanggan/dashboard', {
            bunga: results,
            isLoggedIn: isLoggedIn,
            username: username,
            id_pelanggan: id_pelanggan, // Mengirim id_pelanggan ke view
        });
    });
});

// Proses Pembelian Bunga
router.post('/beli', (req, res) => {
    // Periksa apakah user sudah login
    if (!req.session.user) return res.redirect('/auth/login');

    const { kd_bunga, jumlah } = req.body;

    // Query untuk mengambil data bunga
    db.query('SELECT * FROM bunga WHERE kd_bunga = ?', [kd_bunga], (err, results) => {
        if (err) throw err;

        // Jika bunga ditemukan dan stok mencukupi
        if (results.length > 0 && results[0].stok >= jumlah) {
            const totalHarga = results[0].harga * jumlah;

            // Menyimpan pesanan ke tabel pesanan
            db.query(
                'INSERT INTO pesanan (id_pelanggan, tgl_pesan, total_harga) VALUES (?, NOW(), ?)',
                [req.session.user.id_pelanggan, totalHarga],
                (err, result) => {
                    if (err) throw err;

                    // Update stok bunga setelah pesanan
                    db.query('UPDATE bunga SET stok = stok - ? WHERE kd_bunga = ?', [jumlah, kd_bunga], (err) => {
                        if (err) throw err;

                        // Setelah berhasil, arahkan kembali ke halaman dashboard
                        res.redirect('/pelanggan');
                    });
                }
            );
        } else {
            // Jika stok tidak mencukupi, kirimkan pesan error
            res.send('Stok tidak mencukupi.');
        }
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db'); // Koneksi database

// Endpoint untuk membuat pesanan (menuju konfirmasi)
router.post('/buat', (req, res) => {
    const { kd_bunga } = req.body;

    // Validasi data
    if (!kd_bunga || !req.session.user) {
        return res.status(400).send('Data tidak lengkap atau pengguna belum login.');
    }

    const id_pelanggan = req.session.user.id_pelanggan;

    // Query untuk mendapatkan data bunga
    const bungaQuery = 'SELECT * FROM bunga WHERE kd_bunga = ?';
    db.query(bungaQuery, [kd_bunga], (err, results) => {
        if (err) {
            console.error('Kesalahan query database:', err);
            return res.status(500).send('Terjadi kesalahan pada server.');
        }

        if (results.length === 0) {
            return res.status(404).send('Bunga tidak ditemukan.');
        }

        const bunga = results[0];
        const totalHarga = bunga.harga; // Asumsi satu bunga per pesanan

        // Mengarahkan ke halaman konfirmasi
        res.render('pelanggan/konfirmasiPesanan', {
            bunga: bunga,
            totalHarga: totalHarga,
            id_pelanggan: id_pelanggan,
        });
    });
});

// Endpoint untuk menyelesaikan pesanan
router.post('/selesai', (req, res) => {
    const { kd_bunga, totalHarga } = req.body;

    // Validasi data
    if (!kd_bunga || !req.session.user || !totalHarga) {
        return res.status(400).send('Data tidak lengkap.');
    }

    const id_pelanggan = req.session.user.id_pelanggan;
    const tgl_pesan = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format timestamp

    // Query untuk menyimpan pesanan ke database
    const query = 'INSERT INTO pesanan (id_pelanggan, tgl_pesan, total_harga, kd_bunga) VALUES (?, ?, ?, ?)';
    db.query(query, [id_pelanggan, tgl_pesan, totalHarga, kd_bunga], (err, results) => {
        if (err) {
            console.error('Kesalahan query database:', err);
            return res.status(500).send('Terjadi kesalahan pada server.');
        }

        // Arahkan ke halaman selesai
        res.render('pelanggan/selesai', {
            message: 'Pesanan Anda berhasil dibuat!',
            totalHarga: totalHarga,
        });
    });
});

module.exports = router;

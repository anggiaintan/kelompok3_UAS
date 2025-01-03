const express = require('express');
const router = express.Router();
const db = require('../db'); // Asumsi Anda menggunakan koneksi database di file `db.js`

// Endpoint untuk membuat pesanan
router.post('/buat', (req, res) => {
    const { kd_bunga, id_pelanggan } = req.body;
    

    if (!kd_bunga || !id_pelanggan) {
        return res.status(400).send('Data tidak lengkap.');
    }

    // Query untuk mendapatkan harga bunga
    const bungaQuery = 'SELECT harga FROM bunga WHERE kd_bunga = ?';
    db.query(bungaQuery, [kd_bunga], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
        }

        if (results.length === 0) {
            return res.status(404).send('Bunga tidak ditemukan.');
        }

        const hargaBunga = results[0].harga;
        const totalHarga = hargaBunga; // Asumsi satu bunga per pesanan

        const tgl_pesan = new Date().toISOString().slice(0, 19).replace('T', ' '); // Mendapatkan waktu sekarang untuk tgl_pesan

        // Query untuk memasukkan pesanan ke dalam tabel pesanan
        const query = 'INSERT INTO pesanan (id_pelanggan, tgl_pesan, total_harga, kd_bunga) VALUES (?, ?, ?, ?)';
        db.query(query, [id_pelanggan, tgl_pesan, totalHarga, kd_bunga], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Terjadi kesalahan pada server.');
            }

            // Ambil kd_pesanan yang baru saja dimasukkan
            const kd_pesanan = results.insertId;

            // Mengirimkan respon konfirmasi
            res.render('konfirmasiPesanan', { 
                message: 'Pesanan berhasil dibuat!',
                bunga: { kd_bunga, total_harga: totalHarga }
            });
        });
    });
});

module.exports = router;

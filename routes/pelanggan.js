const express = require('express');
const router = express.Router();
const db = require('../db');  // Pastikan ini sesuai dengan konfigurasi DB Anda

// Route untuk menampilkan dashboard pelanggan dan bunga
router.get('/', (req, res) => {
    db.query('SELECT * FROM bunga', (err, results) => {
        if (err) {
            console.error('Error saat mengambil bunga:', err);
            return res.status(500).send('Terjadi kesalahan pada server.');
        }

        const isLoggedIn = req.session.user ? true : false;
        const username = isLoggedIn ? req.session.user.nama_pelanggan : null;

        res.render('pelanggan/dashboard', {
            bunga: results,
            isLoggedIn: isLoggedIn,
            username: username,
        });
    });
});

// Route untuk memproses pemesanan bunga
router.post('/beli', (req, res) => {
    console.log('Request body:', req.body);  // Cek nilai yang diterima dari form

    if (!req.session.user) {
        console.log('Pengguna belum login');
        return res.redirect('/auth/login'); // Pastikan pengguna sudah login
    }

    const { kd_bunga, jumlah } = req.body;

    // Validasi data
    if (!kd_bunga || !jumlah) {
        console.log('Data tidak lengkap:', { kd_bunga, jumlah });
        return res.status(400).send('Data tidak lengkap.');
    }

    // Pastikan jumlah adalah angka
    const jumlahInt = parseInt(jumlah, 10);  // Mengonversi jumlah menjadi integer
    if (isNaN(jumlahInt) || jumlahInt <= 0) {
        console.log('Jumlah yang dimasukkan tidak valid:', jumlah);
        return res.status(400).send('Jumlah yang dimasukkan tidak valid.');
    }

    console.log(`Memproses pesanan bunga dengan kode ${kd_bunga} dan jumlah ${jumlahInt}`);

    // Ambil data bunga berdasarkan kd_bunga
    db.query('SELECT * FROM bunga WHERE kd_bunga = ?', [kd_bunga], (err, results) => {
        if (err) {
            console.error('Error saat query bunga:', err);
            return res.status(500).send('Terjadi kesalahan saat memeriksa stok.');
        }

        console.log('Hasil query bunga:', results);  // Cek hasil query ke database

        // Cek apakah bunga ditemukan
        if (results.length === 0) {
            console.log(`Bunga dengan kode ${kd_bunga} tidak ditemukan.`);
            return res.status(404).send('Bunga tidak ditemukan.');
        }

        const bunga = results[0];

        // Cek apakah stok mencukupi
        if (bunga.stok < jumlahInt) {
            console.log(`Stok tidak mencukupi: ${bunga.stok} tersedia, ${jumlahInt} diminta.`);
            return res.status(400).send('Stok tidak mencukupi.');
        }

        // Hitung total harga
        const totalHarga = bunga.harga * jumlahInt;
        console.log(`Total harga pesanan: Rp ${totalHarga}`);

        // Masukkan pesanan ke tabel `orders`
        db.query('INSERT INTO orders (kd_bunga, id_pelanggan, jumlah, total_harga) VALUES (?, ?, ?, ?)',
            [kd_bunga, req.session.user.id_pelanggan, jumlahInt, totalHarga], (err) => {
                if (err) {
                    console.error('Error saat memasukkan pesanan:', err);
                    return res.status(500).send('Terjadi kesalahan saat memproses pesanan.');
                }

                console.log('Pesanan berhasil dimasukkan!');

                // Kurangi stok bunga yang dipesan
                db.query('UPDATE bunga SET stok = stok - ? WHERE kd_bunga = ?', [jumlahInt, kd_bunga], (err) => {
                    if (err) {
                        console.error('Error saat mengupdate stok bunga:', err);
                        return res.status(500).send('Terjadi kesalahan saat memperbarui stok.');
                    }

                    console.log(`Stok bunga dengan kode ${kd_bunga} berhasil diperbarui.`);
                    res.redirect('/pelanggan'); // Redirect ke halaman pelanggan
                });
            });
    });
});

module.exports = router;
// routes/pelanggan.js
const express = require('express');
const router = express.Router();
const db = require('../db');  // Pastikan ini sesuai dengan konfigurasi DB Anda

<<<<<<< HEAD
// Route untuk menampilkan dashboard pelanggan dan bunga
=======
// Halaman Dashboard Pelanggan
>>>>>>> 430d3d604ca949211fd6d0d480f643c208ff9f8c
router.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const username = isLoggedIn ? req.session.user.nama_pelanggan : null;
    const id_pelanggan = isLoggedIn ? req.session.user.id_pelanggan : null;

    db.query('SELECT * FROM bunga', (err, results) => {
<<<<<<< HEAD
        if (err) {
            console.error('Error saat mengambil bunga:', err);
            return res.status(500).send('Terjadi kesalahan pada server.');
        }

        const isLoggedIn = req.session.user ? true : false;
        const username = isLoggedIn ? req.session.user.nama_pelanggan : null;
=======
        if (err) throw err;
>>>>>>> 430d3d604ca949211fd6d0d480f643c208ff9f8c

        res.render('pelanggan/dashboard', {
            bunga: results,
            isLoggedIn,
            username,
            id_pelanggan,
        });
    });
});

<<<<<<< HEAD
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
=======
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
>>>>>>> 430d3d604ca949211fd6d0d480f643c208ff9f8c
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

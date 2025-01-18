const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { usn, pw } = req.body;
    
    // Cek hardcoded login admin
    if (usn === 'admin' && pw === 'diemaja') {
        req.session.admin = true;
        return res.redirect('/admin/dashboard');
    }

    // Cek login pelanggan
    db.query('SELECT * FROM pelanggan WHERE usn_pelanggan = ? AND pw_pelanggan = ?', [usn, pw], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.user = results[0];  // Set session hanya jika login berhasil
            return res.redirect('/pelanggan');  // Redirect ke halaman pelanggan
        } else {
            return res.send('Login gagal. Username atau password salah.');  // Pastikan login gagal ditangani
        }
    });
});


router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {
    const { nama_pelanggan, alamat, usn_pelanggan, pw_pelanggan } = req.body;

    // Validasi input (misalnya, pastikan tidak ada field kosong)
    if (!nama_pelanggan || !alamat || !usn_pelanggan || !pw_pelanggan) {
        return res.send('Semua kolom harus diisi!');
    }

    // Pastikan usn_pelanggan unik (tidak duplikat)
    db.query('SELECT * FROM pelanggan WHERE usn_pelanggan = ?', [usn_pelanggan], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            return res.send('Username sudah digunakan, silakan pilih username lain.');
        }

        // Jika username unik, simpan data ke database
        db.query('INSERT INTO pelanggan (nama_pelanggan, alamat, usn_pelanggan, pw_pelanggan) VALUES (?, ?, ?, ?)', 
            [nama_pelanggan, alamat, usn_pelanggan, pw_pelanggan], 
            (err) => {
                if (err) {
                    console.error('Error saat menyimpan data ke database:', err);
                    return res.send('Terjadi kesalahan saat proses signup.');
                }
                res.redirect('/auth/login');  // Arahkan ke halaman login setelah berhasil signup
            });
    });
});

// route untuk logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Gagal logout');
        }
        // Mengarahkan ke halaman login setelah logout
        res.redirect('/');
    });
});



module.exports = router;
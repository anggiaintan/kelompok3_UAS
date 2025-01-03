const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { usn, pw } = req.body;
    if (usn === 'admin' && pw === 'diemaja') {
        req.session.admin = true;
        return res.redirect('/admin/dashboard');
    }

    db.query('SELECT * FROM pelanggan WHERE usn_pelanggan = ? AND pw_pelanggan = ?', [usn, pw], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/pelanggan');
        } else {
            res.send('Login gagal.');
        }
    });
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {
    const { nama_pelanggan, alamat, usn_pelanggan, pw_pelanggan } = req.body;
    db.query('INSERT INTO pelanggan (nama_pelanggan, alamat, usn_pelanggan, pw_pelanggan) VALUES (?, ?, ?, ?)',
        [nama_pelanggan, alamat, usn_pelanggan, pw_pelanggan], (err) => {
            if (err) throw err;
            res.redirect('/auth/login');
        });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error saat logout:', err);
            return res.redirect('/'); // Jika gagal logout, arahkan ke halaman utama
        }
        res.clearCookie('connect.sid'); // Hapus cookie sesi
        res.redirect('/auth/login'); // Arahkan ke halaman login
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const upload = require('../../middleware/upload');

// Middleware untuk cek admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// GET: Kelola Bunga
router.get('/', isAdmin, async (req, res) => {
    try {
        const [bunga] = await db.promise().query('SELECT * FROM bunga');
        res.render('admin/kelola_bunga', { bunga });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// POST: Tambah Bunga
router.post('/tambah', isAdmin, upload.single('gambar'), async (req, res) => {
    try {
        const { nama_bunga, deskripsi, harga, stok } = req.body;
        const gambar = `/uploads/${req.file.filename}`;

        await db.promise().query(
            'INSERT INTO bunga (nama_bunga, deskripsi, harga, stok, gambar) VALUES (?, ?, ?, ?, ?)',
            [nama_bunga, deskripsi, harga, stok, gambar]
        );

        res.redirect('/admin/bunga');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// POST: Update Bunga
router.post('/update/:kd_bunga', isAdmin, upload.single('gambar'), async (req, res) => {
    try {
        const { nama_bunga, deskripsi, harga, stok } = req.body;
        const kd_bunga = req.params.kd_bunga;
        
        let query = 'UPDATE bunga SET nama_bunga = ?, deskripsi = ?, harga = ?, stok = ?';
        let params = [nama_bunga, deskripsi, harga, stok];

        if (req.file) {
            query += ', gambar = ?';
            params.push(`/uploads/${req.file.filename}`);
        }

        query += ' WHERE kd_bunga = ?';
        params.push(kd_bunga);

        await db.promise().query(query, params);
        res.redirect('/admin/bunga');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

// DELETE: Hapus Bunga
router.delete('/hapus/:kd_bunga', isAdmin, async (req, res) => {
    try {
        await db.promise().query('DELETE FROM bunga WHERE kd_bunga = ?', [req.params.kd_bunga]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
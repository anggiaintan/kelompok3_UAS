const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');  // Pastikan ini sesuai dengan konfigurasi DB Anda
const pelangganRoutes = require('./routes/pelanggan'); 
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

// Mengatur EJS sebagai template engine
app.set('view engine', 'ejs');

// Menggunakan folder 'public' untuk file statis seperti CSS, JS, dan gambar
app.use(express.static(path.join(__dirname, 'public')));

// Menggunakan middleware untuk meng-handle data yang dikirim melalui form (POST)
app.use(express.urlencoded({ extended: true }));

// Menggunakan session untuk menangani sesi pengguna
app.use(session({
    secret: 'tokobungaSecret', // Secret key untuk session
    resave: false,
    saveUninitialized: true,
}));

// Mengimpor dan menggunakan rute-rute aplikasi
app.use('/pelanggan', pelangganRoutes);  // Semua rute yang dimulai dengan '/pelanggan' akan diarahkan ke pelangganRoutes
app.use('/admin', adminRoutes);          // Semua rute yang dimulai dengan '/admin' akan diarahkan ke adminRoutes
app.use('/auth', authRoutes);            // Semua rute yang dimulai dengan '/auth' akan diarahkan ke authRoutes

// Rute default untuk halaman utama
app.get('/', (req, res) => {
    const data = { message: "Selamat datang di Toko Bunga!" };  // Data yang akan dipassing ke halaman
    res.render('halaman', data);  // Render halaman.ejs dengan data yang diberikan
});

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

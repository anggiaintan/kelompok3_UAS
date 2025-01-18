const express = require('express');
const session = require('express-session');
const path = require('path');
<<<<<<< HEAD
const db = require('./db');  // Pastikan ini sesuai dengan konfigurasi DB Anda
const pelangganRoutes = require('./routes/pelanggan'); 
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
=======
const multer = require('multer');
const db = require('./config/db');
>>>>>>> 430d3d604ca949211fd6d0d480f643c208ff9f8c

const app = express();
const port = 3000;

<<<<<<< HEAD
// Mengatur EJS sebagai template engine
app.set('view engine', 'ejs');

// Menggunakan folder 'public' untuk file statis seperti CSS, JS, dan gambar
app.use(express.static(path.join(__dirname, 'public')));

// Menggunakan middleware untuk meng-handle data yang dikirim melalui form (POST)
=======
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
>>>>>>> 430d3d604ca949211fd6d0d480f643c208ff9f8c
app.use(express.urlencoded({ extended: true }));

// Menggunakan session untuk menangani sesi pengguna
app.use(session({
    secret: 'tokobungaSecret', // Secret key untuk session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

<<<<<<< HEAD
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
=======
// Custom middleware untuk membuat user session tersedia di semua views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const pelangganRoutes = require('./routes/pelanggan');

// Use routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/pelanggan', pelangganRoutes);

// Default route
app.get('/', (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/pelanggan');
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
>>>>>>> 430d3d604ca949211fd6d0d480f643c208ff9f8c

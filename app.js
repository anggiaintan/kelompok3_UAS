const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const db = require('./db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'tokobungaSecret',
    resave: false,
    saveUninitialized: true,
}));

// Routes
const pelangganRoutes = require('./routes/pelanggan');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const pesananRoutes = require('./routes/pesanan'); // Tambahkan ini

app.use('/pelanggan', pelangganRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/pesanan', pesananRoutes); // Tambahkan ini

// Default route
app.get('/', (req, res) => {
    res.redirect('/pelanggan');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


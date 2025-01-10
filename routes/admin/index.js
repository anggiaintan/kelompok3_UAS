const express = require('express');
const router = express.Router();

// Import sub-routes
const bungaRoutes = require('./bunga');
const pesananRoutes = require('./pesanan');

// Middleware untuk cek admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Dashboard Admin
router.get('/', isAdmin, (req, res) => {
    res.render('admin/dashboard', {
        admin: req.session.admin
    });
});

router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard', {
        admin: req.session.admin
    });
});

// Gunakan sub-routes
router.use('/bunga', bungaRoutes);
router.use('/pesanan', pesananRoutes);

module.exports = router;